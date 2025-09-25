 // Configurações e dados globais
const CONFIG = {
    adminEmail: 'adminganfi@gmail.com',
    adminPassword: 'ganfiadmin*',
    storageKey: 'ganfi_clients_data'
};

// Estado da aplicação
let currentUser = null;
let clients = [];
let filteredClients = [];
let editingClient = null;

// Elementos DOM
const elements = {
    loginScreen: document.getElementById('loginScreen'),
    dashboard: document.getElementById('dashboard'),
    loginForm: document.getElementById('loginForm'),
    loginError: document.getElementById('loginError'),
    logoutBtn: document.getElementById('logoutBtn'),
    navBtns: document.querySelectorAll('.nav-btn'),
    sections: document.querySelectorAll('.dashboard-section'),
    searchClients: document.getElementById('searchClients'),
    addClientBtn: document.getElementById('addClientBtn'),
    clientModal: document.getElementById('clientModal'),
    clientForm: document.getElementById('clientForm'),
    closeModal: document.getElementById('closeModal'),
    cancelModal: document.getElementById('cancelModal'),
    confirmModal: document.getElementById('confirmModal'),
    cancelConfirm: document.getElementById('cancelConfirm'),
    confirmAction: document.getElementById('confirmAction'),
    addNumberBtn: document.getElementById('addNumberBtn'),
    numbersContainer: document.querySelector('.numbers-container'),
    clientsTableBody: document.getElementById('clientsTableBody'),
    modalTitle: document.getElementById('modalTitle'),
    confirmMessage: document.getElementById('confirmMessage')
};

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

async function initializeApp() {
    setupEventListeners();
    
    // Verificar se há usuário logado
    const loggedUser = localStorage.getItem('ganfi_logged_user');
    if (loggedUser) {
        showDashboard();
        // Carregar clientes do banco de dados
        try {
            await loadClientsFromDatabase();
            updateStatistics();
            renderClientsTable();
        } catch (error) {
            console.error('Falha ao carregar clientes:', error);
        }
    } else {
        showLogin();
    }
}

function setupEventListeners() {
    // Login
    elements.loginForm.addEventListener('submit', handleLogin);
    elements.logoutBtn.addEventListener('click', handleLogout);
    
    // Navegação
    elements.navBtns.forEach(btn => {
        btn.addEventListener('click', () => switchSection(btn.dataset.section));
    });
    
    // Busca
    elements.searchClients.addEventListener('input', handleSearch);
    
    // Modal do cliente
    elements.addClientBtn.addEventListener('click', () => openClientModal());
    elements.closeModal.addEventListener('click', closeClientModal);
    elements.cancelModal.addEventListener('click', closeClientModal);
    elements.clientForm.addEventListener('submit', handleClientSubmit);
    
    // Botão de atualizar dados
    const refreshBtn = document.getElementById('refreshDataBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', refreshClientsFromServer);
    }
    
    // Adicionar número
    elements.addNumberBtn.addEventListener('click', () => addNumberInput());
    
    // Modal de confirmação
    elements.cancelConfirm.addEventListener('click', closeConfirmModal);
    
    // Fechar modal clicando fora
    elements.clientModal.addEventListener('click', (e) => {
        if (e.target === elements.clientModal) closeClientModal();
    });
    
    elements.confirmModal.addEventListener('click', (e) => {
        if (e.target === elements.confirmModal) closeConfirmModal();
    });
}

// Autenticação
function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    if (email === CONFIG.adminEmail && password === CONFIG.adminPassword) {
        currentUser = { email: email };
        localStorage.setItem('ganfi_logged_user', JSON.stringify(currentUser));
        showDashboard();
        elements.loginError.style.display = 'none';
    } else {
        showLoginError('Email ou senha incorretos');
    }
}

function handleLogout() {
    currentUser = null;
    localStorage.removeItem('ganfi_logged_user');
    showLogin();
}

function showLogin() {
    elements.loginScreen.style.display = 'flex';
    elements.dashboard.style.display = 'none';
    clearLoginForm();
}

async function showDashboard() {
    elements.loginScreen.style.display = 'none';
    elements.dashboard.style.display = 'block';
    
    // Carregar clientes do banco de dados quando mostrar o dashboard
    try {
        await loadClientsFromDatabase();
        updateStatistics();
        renderClientsTable();
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
        // Mostrar dados do cache se disponível
        updateStatistics();
        renderClientsTable();
    }
}

function showLoginError(message) {
    elements.loginError.textContent = message;
    elements.loginError.style.display = 'block';
}

function clearLoginForm() {
    elements.loginForm.reset();
    elements.loginError.style.display = 'none';
}

// Navegação entre seções
function switchSection(sectionName) {
    // Atualizar botões de navegação
    elements.navBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.section === sectionName);
    });
    
    // Atualizar seções
    elements.sections.forEach(section => {
        section.classList.toggle('active', section.id === `${sectionName}Section`);
    });
}

// Gestão de clientes
async function loadClientsFromDatabase() {
    try {
        showNotification('Carregando clientes...', 'info');
        
        const response = await fetch('https://requisicao.grupoganfi.com/webhook/0f8b0045-4bc7-40e0-b902-bd7d2d6c26cf', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Ganfi-Admin/1.0'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const clientsFromDB = await response.json();
        
        // Converter formato do banco para formato interno
        clients = clientsFromDB.map(client => ({
            id: client.id_contato,
            name: client.nome,
            authorizedNumbers: client.numeros_autorizados || [],
            paymentStatus: client.status,
            dueDay: extractDayFromDate(client.data_criacao) || 15, // Default para dia 15 se não tiver
            createdAt: client.data_criacao,
            updatedAt: client.data_qualificacao
        }));
        
        filteredClients = [...clients];
        
        // Salvar no localStorage como cache
        saveClientsToStorage();
        
        showNotification(`${clients.length} clientes carregados com sucesso!`, 'success');
        
        return clients;
        
    } catch (error) {
        console.error('Erro ao carregar clientes do banco:', error);
        showNotification('Erro ao carregar clientes do servidor', 'warning');
        
        // Fallback para localStorage se a API falhar
        loadClientsFromLocalStorage();
        
        throw error;
    }
}

function loadClientsFromLocalStorage() {
    const stored = localStorage.getItem(CONFIG.storageKey);
    if (stored) {
        clients = JSON.parse(stored);
        filteredClients = [...clients];
        showNotification('Carregados clientes do cache local', 'info');
    } else {
        clients = [];
        filteredClients = [];
        showNotification('Nenhum cliente encontrado', 'info');
    }
}

function saveClientsToStorage() {
    localStorage.setItem(CONFIG.storageKey, JSON.stringify(clients));
}

function updateStatistics() {
    const stats = {
        paid: clients.filter(c => c.paymentStatus === 'paid').length,
        pending: clients.filter(c => c.paymentStatus === 'pending').length,
        overdue: clients.filter(c => c.paymentStatus === 'overdue').length,
        total: clients.length
    };
    
    document.getElementById('paidClients').textContent = stats.paid;
    document.getElementById('pendingClients').textContent = stats.pending;
    document.getElementById('overdueClients').textContent = stats.overdue;
    document.getElementById('totalClients').textContent = stats.total;
}

function renderClientsTable() {
    const tbody = elements.clientsTableBody;
    tbody.innerHTML = '';
    
    if (filteredClients.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; padding: 40px; color: #7f8c8d;">
                    <i class="fas fa-users" style="font-size: 2rem; margin-bottom: 10px; display: block;"></i>
                    Nenhum cliente encontrado
                </td>
            </tr>
        `;
        return;
    }
    
    filteredClients.forEach(client => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <strong>${client.name}</strong>
            </td>
            <td>
                <div class="authorized-numbers">
                    ${client.authorizedNumbers.map(number => 
                        `<span class="number-tag">${number}</span>`
                    ).join('')}
                </div>
            </td>
            <td>
                <span class="status-badge status-${client.paymentStatus}">
                    ${getStatusText(client.paymentStatus)}
                </span>
            </td>
            <td>
                Dia ${client.dueDay} de cada mês
                ${isDueThisMonth(client.dueDay) ? '<br><small style="color: #f39c12;">Vence este mês</small>' : ''}
                ${isOverdueThisMonth(client.dueDay) ? '<br><small style="color: #e74c3c;">Vencido este mês</small>' : ''}
            </td>
            <td>
                <div class="action-buttons">
                    <button class="btn-edit" onclick="editClient(${client.id})">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="btn-delete" onclick="confirmDeleteClient(${client.id})">
                        <i class="fas fa-trash"></i> Excluir
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function handleSearch() {
    const searchTerm = elements.searchClients.value.toLowerCase().trim();
    
    if (!searchTerm) {
        filteredClients = [...clients];
    } else {
        filteredClients = clients.filter(client => {
            return (
                client.name.toLowerCase().includes(searchTerm) ||
                client.authorizedNumbers.some(number => 
                    number.toLowerCase().includes(searchTerm)
                ) ||
                getStatusText(client.paymentStatus).toLowerCase().includes(searchTerm)
            );
        });
    }
    
    renderClientsTable();
}

// Modal do cliente
function openClientModal(client = null) {
    editingClient = client;
    
    if (client) {
        elements.modalTitle.textContent = 'Editar Cliente';
        populateClientForm(client);
    } else {
        elements.modalTitle.textContent = 'Novo Cliente';
        clearClientForm();
    }
    
    elements.clientModal.style.display = 'flex';
}

function closeClientModal() {
    elements.clientModal.style.display = 'none';
    editingClient = null;
    clearClientForm();
}

function populateClientForm(client) {
    document.getElementById('clientId').value = client.id;
    document.getElementById('clientName').value = client.name;
    document.getElementById('paymentStatus').value = client.paymentStatus;
    document.getElementById('dueDay').value = client.dueDay;
    
    // Limpar números existentes
    elements.numbersContainer.innerHTML = '';
    
    // Adicionar números do cliente
    client.authorizedNumbers.forEach((number, index) => {
        // Tentar fazer match com diferentes formatos
        let match = number.match(/\((\d{2})\)\s*(\d{4,5})-?(\d{4})/);
        
        if (match) {
            const ddd = match[1];
            const phone = match[2] + '-' + match[3]; // Manter o hífen
            addNumberInput(ddd, phone, index === 0);
        } else {
            // Tentar um formato mais simples
            match = number.match(/\((\d{2})\)\s*(.+)/);
            if (match) {
                const ddd = match[1];
                const phone = match[2];
                addNumberInput(ddd, phone, index === 0);
            } else {
                addNumberInput('', '', index === 0);
            }
        }
    });
    
    // Se não houver números, adicionar um campo vazio
    if (client.authorizedNumbers.length === 0) {
        addNumberInput();
    }
}

function clearClientForm() {
    elements.clientForm.reset();
    
    // Limpar números e adicionar um campo vazio
    elements.numbersContainer.innerHTML = '';
    addNumberInput();
}

function addNumberInput(dddValue = '', phoneValue = '', isFirst = false) {
    const inputGroup = document.createElement('div');
    inputGroup.className = 'number-input-group';
    
    // Criar elementos diretamente
    const phoneInputsDiv = document.createElement('div');
    phoneInputsDiv.className = 'phone-inputs';
    
    const dddInput = document.createElement('input');
    dddInput.type = 'text';
    dddInput.className = 'ddd-input';
    dddInput.placeholder = '11';
    dddInput.maxLength = 2;
    dddInput.value = dddValue;
    
    const phoneInput = document.createElement('input');
    phoneInput.type = 'text';
    phoneInput.className = 'phone-input';
    phoneInput.placeholder = '99999-9999';
    phoneInput.maxLength = 10;
    phoneInput.value = phoneValue;
    
    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'btn-remove-number';
    if (isFirst) removeBtn.style.display = 'none';
    removeBtn.innerHTML = '<i class="fas fa-trash"></i>';
    
    // Montar estrutura
    phoneInputsDiv.appendChild(dddInput);
    phoneInputsDiv.appendChild(phoneInput);
    inputGroup.appendChild(phoneInputsDiv);
    inputGroup.appendChild(removeBtn);
    
    // Adicionar eventos
    dddInput.addEventListener('input', applyDDDMask);
    phoneInput.addEventListener('input', applyPhoneMask);
    
    removeBtn.addEventListener('click', () => {
        inputGroup.remove();
        updateRemoveButtons();
    });
    
    elements.numbersContainer.appendChild(inputGroup);
    updateRemoveButtons();
}

function updateRemoveButtons() {
    const inputGroups = elements.numbersContainer.querySelectorAll('.number-input-group');
    inputGroups.forEach((group, index) => {
        const removeBtn = group.querySelector('.btn-remove-number');
        if (inputGroups.length === 1) {
            removeBtn.style.display = 'none';
        } else {
            removeBtn.style.display = 'block';
        }
    });
}

function applyDDDMask(e) {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 2) {
        value = value.substring(0, 2);
    }
    e.target.value = value;
}

function applyPhoneMask(e) {
    let value = e.target.value.replace(/\D/g, '');
    
    // Limitar a 9 dígitos
    if (value.length > 9) {
        value = value.substring(0, 9);
    }
    
    if (value.length <= 9) {
        if (value.length <= 4) {
            // Não adicionar hífen ainda
            e.target.value = value;
        } else if (value.length <= 8) {
            // Formato: 9999-9999 (8 dígitos)
            e.target.value = value.replace(/(\d{4})(\d{0,4})/, '$1-$2');
        } else {
            // Formato: 99999-9999 (9 dígitos)
            e.target.value = value.replace(/(\d{5})(\d{0,4})/, '$1-$2');
        }
    }
}

function handleClientSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const phoneInputGroups = elements.numbersContainer.querySelectorAll('.number-input-group');
    const authorizedNumbers = [];
    
    phoneInputGroups.forEach(group => {
        const dddInput = group.querySelector('.ddd-input');
        const phoneInput = group.querySelector('.phone-input');
        const ddd = dddInput.value.trim();
        const phone = phoneInput.value.trim();
        
        if (ddd && phone) {
            // Validar DDD
            if (ddd.length !== 2) {
                alert('DDD deve ter 2 dígitos');
                dddInput.focus();
                return;
            }
            
            // Validar telefone
            const phoneClean = phone.replace(/\D/g, '');
            if (phoneClean.length < 8 || phoneClean.length > 9) {
                alert('Número de telefone deve ter 8 ou 9 dígitos');
                phoneInput.focus();
                return;
            }
            
            authorizedNumbers.push(`(${ddd}) ${phone}`);
        }
    });
    
    if (authorizedNumbers.length === 0) {
        alert('É necessário adicionar pelo menos um número autorizado');
        return;
    }
    
    const clientData = {
        name: document.getElementById('clientName').value.trim(),
        authorizedNumbers: authorizedNumbers,
        paymentStatus: document.getElementById('paymentStatus').value,
        dueDay: parseInt(document.getElementById('dueDay').value)
    };
    
    if (editingClient) {
        updateClient(editingClient.id, clientData);
    } else {
        createClient(clientData);
    }
    
    closeClientModal();
}

async function createClient(clientData) {
    const newClient = {
        id: Date.now(),
        ...clientData,
        createdAt: new Date().toISOString()
    };
    
    // Enviar webhook para novo cliente
    await sendWebhook(newClient, 'novo_cliente');
    
    // Recarregar dados do servidor após criar
    setTimeout(async () => {
        await refreshClientsFromServer();
    }, 1000);
    
    showNotification('Cliente criado com sucesso!', 'success');
}

async function updateClient(clientId, clientData) {
    const clientIndex = clients.findIndex(c => c.id === clientId);
    if (clientIndex !== -1) {
        const updatedClient = {
            ...clients[clientIndex],
            ...clientData,
            updatedAt: new Date().toISOString()
        };
        
        // Enviar webhook para cliente atualizado
        await sendWebhook(updatedClient, 'cliente_atualizado');
        
        // Recarregar dados do servidor após atualizar
        setTimeout(async () => {
            await refreshClientsFromServer();
        }, 1000);
        
        showNotification('Cliente atualizado com sucesso!', 'success');
    }
}

function editClient(clientId) {
    const client = clients.find(c => c.id === clientId);
    if (client) {
        openClientModal(client);
    }
}

function confirmDeleteClient(clientId) {
    const client = clients.find(c => c.id === clientId);
    if (client) {
        elements.confirmMessage.textContent = 
            `Tem certeza que deseja excluir o cliente "${client.name}"? Esta ação não pode ser desfeita.`;
        
        elements.confirmAction.onclick = () => {
            deleteClient(clientId);
            closeConfirmModal();
        };
        
        elements.confirmModal.style.display = 'flex';
    }
}

async function deleteClient(clientId) {
    const clientIndex = clients.findIndex(c => c.id === clientId);
    if (clientIndex !== -1) {
        const clientToDelete = clients[clientIndex];
        
        // Enviar webhook antes de excluir
        await sendWebhook(clientToDelete, 'cliente_excluido');
        
        // Recarregar dados do servidor após excluir
        setTimeout(async () => {
            await refreshClientsFromServer();
        }, 1000);
        
        showNotification('Cliente excluído com sucesso!', 'success');
    }
}

function closeConfirmModal() {
    elements.confirmModal.style.display = 'none';
}

// Utilitários
function getStatusText(status) {
    const statusMap = {
        'paid': 'Pagamento em Dia',
        'pending': 'Pagamento Pendente',
        'overdue': 'Pagamento Atrasado'
    };
    return statusMap[status] || status;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
}

function isOverdue(dateString) {
    const today = new Date();
    const dueDate = new Date(dateString);
    today.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate < today;
}

function isDueThisMonth(dueDay) {
    const today = new Date();
    const currentDay = today.getDate();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    // Verificar se o dia de vencimento ainda não passou este mês
    return currentDay < dueDay;
}

function isOverdueThisMonth(dueDay) {
    const today = new Date();
    const currentDay = today.getDate();
    
    // Se o dia atual é maior que o dia de vencimento, está atrasado
    return currentDay > dueDay;
}

function extractDayFromDate(dateString) {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.getDate();
}

// Função para recarregar dados do servidor
async function refreshClientsFromServer() {
    try {
        await loadClientsFromDatabase();
        updateStatistics();
        renderClientsTable();
        showNotification('Dados atualizados!', 'success');
    } catch (error) {
        showNotification('Erro ao atualizar dados', 'warning');
    }
}

function showNotification(message, type = 'info') {
    // Criar elemento de notificação
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'warning' ? 'fa-exclamation-triangle' : 'fa-info-circle'}"></i>
        <span>${message}</span>
    `;
    
    // Adicionar estilos
    const bgColor = type === 'success' ? '#27ae60' : type === 'warning' ? '#f39c12' : '#3498db';
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${bgColor};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
        z-index: 2000;
        display: flex;
        align-items: center;
        gap: 10px;
        animation: slideIn 0.3s ease;
    `;
    
    // Adicionar ao DOM
    document.body.appendChild(notification);
    
    // Remover após 3 segundos
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Adicionar estilos de animação para notificações
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Atualizar status de pagamento automaticamente baseado no dia de vencimento
function updatePaymentStatuses() {
    let updated = false;
    const today = new Date();
    const currentDay = today.getDate();
    
    clients.forEach(client => {
        // Se o pagamento está em dia mas o dia de vencimento já passou, marcar como atrasado
        if (client.paymentStatus === 'paid' && currentDay > client.dueDay) {
            client.paymentStatus = 'overdue';
            updated = true;
        }
        // Se está pendente e o dia de vencimento passou, marcar como atrasado
        else if (client.paymentStatus === 'pending' && currentDay > client.dueDay) {
            client.paymentStatus = 'overdue';
            updated = true;
        }
    });
    
    if (updated) {
        saveClientsToStorage();
        updateStatistics();
        renderClientsTable();
    }
}

// Verificar status de pagamento a cada minuto
setInterval(updatePaymentStatuses, 60000);

// Verificar imediatamente ao carregar
setTimeout(updatePaymentStatuses, 1000);

// Auto-refresh dos dados a cada 30 segundos
setInterval(async () => {
    const loggedUser = localStorage.getItem('ganfi_logged_user');
    if (loggedUser && elements.dashboard.style.display !== 'none') {
        try {
            await loadClientsFromDatabase();
            updateStatistics();
            renderClientsTable();
        } catch (error) {
            console.log('Auto-refresh falhou:', error);
        }
    }
}, 30000); // 30 segundos

// Função para enviar webhook
async function sendWebhook(clientData, evento) {
    const webhookUrl = 'https://requisicao.grupoganfi.com/webhook/50e63045-e679-4ad3-b496-a6700f4c9917';
    
    const payload = {
        evento: evento,
        cliente: {
            id: clientData.id,
            nome: clientData.name,
            numerosAutorizados: clientData.authorizedNumbers,
            statusPagamento: clientData.paymentStatus,
            diaVencimento: clientData.dueDay,
            criadoEm: clientData.createdAt,
            atualizadoEm: clientData.updatedAt || null
        },
        timestamp: new Date().toISOString(),
        origem: 'ganfi-admin-web'
    };
    
    try {
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Ganfi-Admin/1.0'
            },
            body: JSON.stringify(payload)
        });
        
        if (response.ok) {
            console.log('Webhook enviado com sucesso:', evento, clientData.name);
            return true;
        } else {
            console.error('Erro ao enviar webhook:', response.status, response.statusText);
            showNotification('⚠️ Erro ao sincronizar dados', 'warning');
            return false;
        }
    } catch (error) {
        console.error('Erro na requisição do webhook:', error);
        showNotification('⚠️ Erro de conexão na sincronização', 'warning');
    }
}