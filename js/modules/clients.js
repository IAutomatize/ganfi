/**
 * Módulo de gestão de clientes
 * Gerencia CRUD, modal, validação e sincronização de clientes
 */

class ClientsModule {
    constructor() {
        this.clients = [];
        this.filteredClients = [];
        this.editingClient = null;
        
        this.elements = {
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
            confirmMessage: document.getElementById('confirmMessage'),
            refreshDataBtn: document.getElementById('refreshDataBtn')
        };
    }

    /**
     * Inicializa o módulo de clientes
     */
    init() {
        this.setupEventListeners();
        this.startAutoRefresh();
        
        // Carregar clientes quando dashboard for mostrado
        window.addEventListener('dashboardShown', () => {
            this.loadAndRenderClients();
        });
        
        // Se o dashboard já estiver visível (sessão existente), carregar clientes imediatamente
        const dashboard = document.querySelector('.dashboard-container');
        const loginScreen = document.getElementById('loginScreen');
        
        // Verificar se dashboard já está sendo mostrado (login screen está oculto)
        if (dashboard && loginScreen && loginScreen.classList.contains('hidden')) {
            // Aguardar um tick para garantir que DOM está pronto
            setTimeout(() => {
                this.loadAndRenderClients();
            }, 100);
        }
    }

    /**
     * Configura event listeners
     */
    setupEventListeners() {
        // Busca
        this.elements.searchClients?.addEventListener('input', () => this.handleSearch());
        
        // Modal do cliente
        this.elements.addClientBtn?.addEventListener('click', () => this.openClientModal());
        this.elements.closeModal?.addEventListener('click', () => this.closeClientModal());
        this.elements.cancelModal?.addEventListener('click', () => this.closeClientModal());
        this.elements.clientForm?.addEventListener('submit', (e) => this.handleClientSubmit(e));
        
        // Botão de atualizar dados
        this.elements.refreshDataBtn?.addEventListener('click', () => this.refreshClientsFromServer());
        
        // Adicionar número
        this.elements.addNumberBtn?.addEventListener('click', () => this.addNumberInput());
        
        // Modal de confirmação
        this.elements.cancelConfirm?.addEventListener('click', () => this.closeConfirmModal());
        
        // Fechar modal clicando fora
        this.elements.clientModal?.addEventListener('click', (e) => {
            if (e.target === this.elements.clientModal) this.closeClientModal();
        });
        
        this.elements.confirmModal?.addEventListener('click', (e) => {
            if (e.target === this.elements.confirmModal) this.closeConfirmModal();
        });
    }

    /**
     * Carrega e renderiza clientes
     */
    async loadAndRenderClients() {
        try {
            await this.loadClientsFromDatabase();
            this.updateStatistics();
            this.renderClientsTable();
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
            this.updateStatistics();
            this.renderClientsTable();
        }
    }

    /**
     * Carrega clientes do banco de dados via API
     * @param {boolean} silent - Se true, não exibe notificações
     */
    async loadClientsFromDatabase(silent = false) {
        try {
            if (!silent) {
                UIUtils.showNotification('Carregando clientes...', 'info');
            }
            
            const clientsFromDB = await apiService.loadClients();
            
            // Converter formato do banco para formato interno
            this.clients = clientsFromDB.map(client => {
                // Usar data_vencimento apenas se existir no banco
                let dueDate = null;
                let dueDay = null;
                
                if (client.data_vencimento && client.data_vencimento !== null) {
                    dueDate = client.data_vencimento;
                    dueDay = new Date(client.data_vencimento).getDate();
                }

                return {
                    id: client.id_contato,
                    name: client.nome,
                    authorizedNumbers: client.numeros_autorizados || [],
                    paymentStatus: client.status,
                    dueDay: dueDay,
                    dueDate: dueDate,
                    createdAt: client.data_criacao,
                    updatedAt: client.data_qualificacao
                };
            });
            
            this.filteredClients = [...this.clients];
            
            // Mostrar notificações apenas se necessário
            if (!silent) {
                if (this.clients.length === 0) {
                    // Não mostrar notificação quando não há clientes
                } else {
                    const clientsWithoutDueDate = this.clients.filter(c => !c.dueDate || c.dueDate === null);
                    
                    if (clientsWithoutDueDate.length > 0) {
                        UIUtils.showNotification(
                            `${this.clients.length} clientes carregados. ATENÇÃO: ${clientsWithoutDueDate.length} sem data de vencimento!`, 
                            'warning'
                        );
                    } else {
                        UIUtils.showNotification(
                            `${this.clients.length} clientes carregados diretamente do banco de dados!`, 
                            'success'
                        );
                    }
                }
            }
            
            return this.clients;
            
        } catch (error) {
            console.error('Erro ao carregar clientes do banco:', error);
            if (!silent) {
                UIUtils.showNotification('Erro ao conectar com o banco de dados', 'error');
            }
            
            // Sem fallback - só funciona com banco de dados
            this.clients = [];
            this.filteredClients = [];
            
            throw error;
        }
    }

    /**
     * Atualiza estatísticas do dashboard
     */
    updateStatistics() {
        const stats = {
            paid: this.clients.filter(c => c.paymentStatus === 'paid').length,
            pending: this.clients.filter(c => c.paymentStatus === 'pending').length,
            overdue: this.clients.filter(c => c.paymentStatus === 'overdue').length,
            total: this.clients.length
        };
        
        const paidElement = document.getElementById('paidClients');
        const pendingElement = document.getElementById('pendingClients');
        const overdueElement = document.getElementById('overdueClients');
        const totalElement = document.getElementById('totalClients');
        
        if (paidElement) paidElement.textContent = stats.paid;
        if (pendingElement) pendingElement.textContent = stats.pending;
        if (overdueElement) overdueElement.textContent = stats.overdue;
        if (totalElement) totalElement.textContent = stats.total;
    }

    /**
     * Renderiza tabela de clientes
     */
    renderClientsTable() {
        const tbody = this.elements.clientsTableBody;
        if (!tbody) return;
        
        tbody.innerHTML = '';
        
        if (this.filteredClients.length === 0) {
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
        
        this.filteredClients.forEach(client => {
            const row = document.createElement('tr');
            row.innerHTML = this.generateClientRowHTML(client);
            tbody.appendChild(row);
        });
    }

    /**
     * Gera HTML para linha do cliente
     * @param {Object} client - Dados do cliente
     * @returns {string} HTML da linha
     */
    generateClientRowHTML(client) {
        return `
            <td>
                <strong>${client.name}</strong>
            </td>
            <td>
                <div class="authorized-numbers">
                    ${client.authorizedNumbers.map(number => 
                        `<span class="number-tag">${PhoneUtils.formatForDisplay(number)}</span>`
                    ).join('')}
                </div>
            </td>
            <td>
                <span class="status-badge status-${client.paymentStatus}">
                    ${UIUtils.getStatusText(client.paymentStatus)}
                </span>
            </td>
            <td>
                <div class="due-info">
                    ${client.dueDay && client.dueDate ? 
                        `<strong>Dia ${client.dueDay} de cada mês</strong><br>
                         <small style="color: #7f8c8d;">Próximo: ${DateUtils.formatDateToBR(client.dueDate)}</small>
                         ${DateUtils.isOverdue(client.dueDate) ? '<br><small style="color: #e74c3c;">Vencimento passou</small>' : ''}` 
                        : 
                        `<strong style="color: #e74c3c;">SEM DATA DE VENCIMENTO</strong><br>
                         <small style="color: #e74c3c;">Configure no banco de dados</small>`
                    }
                </div>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="btn-edit" onclick="clientsModule.editClient(${client.id})">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    ${client.dueDay && client.dueDate ? 
                        `<button class="btn-renew" onclick="clientsModule.renewClientPayment(${client.id})" title="Renovar por mais 1 mês">
                            <i class="fas fa-calendar-plus"></i> Renovar
                        </button>` 
                        : 
                        `<button class="btn-renew" disabled title="Sem data de vencimento configurada" style="opacity: 0.5; cursor: not-allowed;">
                            <i class="fas fa-calendar-plus"></i> Renovar
                        </button>`
                    }
                    <button class="btn-delete" onclick="clientsModule.confirmDeleteClient(${client.id})">
                        <i class="fas fa-trash"></i> Excluir
                    </button>
                </div>
            </td>
        `;
    }

    /**
     * Manipula busca de clientes
     */
    handleSearch() {
        const searchTerm = this.elements.searchClients.value.toLowerCase().trim();
        
        if (!searchTerm) {
            this.filteredClients = [...this.clients];
        } else {
            this.filteredClients = this.clients.filter(client => {
                return (
                    client.name.toLowerCase().includes(searchTerm) ||
                    client.authorizedNumbers.some(number => 
                        number.toLowerCase().includes(searchTerm)
                    ) ||
                    UIUtils.getStatusText(client.paymentStatus).toLowerCase().includes(searchTerm)
                );
            });
        }
        
        this.renderClientsTable();
    }

    /**
     * Abre modal do cliente
     * @param {Object|null} client - Cliente para editar ou null para novo
     */
    openClientModal(client = null) {
        this.editingClient = client;
        
        if (client) {
            this.elements.modalTitle.textContent = 'Editar Cliente';
            this.populateClientForm(client);
        } else {
            this.elements.modalTitle.textContent = 'Novo Cliente';
            this.clearClientForm();
        }
        
        this.elements.clientModal.style.display = 'flex';
    }

    /**
     * Fecha modal do cliente
     */
    closeClientModal() {
        this.elements.clientModal.style.display = 'none';
        this.editingClient = null;
        this.clearClientForm();
    }

    /**
     * Popula formulário com dados do cliente
     * @param {Object} client - Dados do cliente
     */
    populateClientForm(client) {
        document.getElementById('clientId').value = client.id;
        document.getElementById('clientName').value = client.name;
        document.getElementById('paymentStatus').value = client.paymentStatus;
        document.getElementById('dueDay').value = client.dueDay || '';
        
        // Limpar números existentes
        this.elements.numbersContainer.innerHTML = '';
        
        // Adicionar números do cliente
        client.authorizedNumbers.forEach((number, index) => {
            const components = PhoneUtils.extractComponents(number);
            this.addNumberInput(components.ddi, components.ddd, components.phone, index === 0);
        });
        
        // Se não houver números, adicionar um campo vazio
        if (client.authorizedNumbers.length === 0) {
            this.addNumberInput();
        }
    }

    /**
     * Limpa formulário do cliente
     */
    clearClientForm() {
        UIUtils.clearForm('clientForm');
        
        // Adicionar um campo de número vazio
        this.elements.numbersContainer.innerHTML = '';
        this.addNumberInput();
    }

    /**
     * Adiciona campo de entrada de número
     */
    addNumberInput(ddiValue = '55', dddValue = '', phoneValue = '', isFirst = false) {
        const inputGroup = document.createElement('div');
        inputGroup.className = 'number-input-group';
        
        // Criar elementos
        const phoneInputsDiv = document.createElement('div');
        phoneInputsDiv.className = 'phone-inputs';
        
        const ddiInput = document.createElement('input');
        ddiInput.type = 'text';
        ddiInput.className = 'ddi-input';
        ddiInput.placeholder = '55';
        ddiInput.maxLength = 3;
        ddiInput.value = ddiValue;
        
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
        
        // Adicionar atributos name para validação
        const inputIndex = this.elements.numbersContainer.querySelectorAll('.number-input-group').length;
        ddiInput.name = `ddi_${inputIndex}`;
        dddInput.name = `ddd_${inputIndex}`;
        phoneInput.name = `phone_${inputIndex}`;
        
        // Montar estrutura
        phoneInputsDiv.appendChild(ddiInput);
        phoneInputsDiv.appendChild(dddInput);
        phoneInputsDiv.appendChild(phoneInput);
        inputGroup.appendChild(phoneInputsDiv);
        inputGroup.appendChild(removeBtn);
        
        // Adicionar eventos
        ddiInput.addEventListener('input', this.applyDDIMask);
        dddInput.addEventListener('input', this.applyDDDMask);
        phoneInput.addEventListener('input', this.applyPhoneMask);
        
        removeBtn.addEventListener('click', () => {
            inputGroup.remove();
            this.updateRemoveButtons();
        });
        
        this.elements.numbersContainer.appendChild(inputGroup);
        this.updateRemoveButtons();
    }

    /**
     * Atualiza visibilidade dos botões de remoção e índices dos campos
     */
    updateRemoveButtons() {
        const inputGroups = this.elements.numbersContainer.querySelectorAll('.number-input-group');
        inputGroups.forEach((group, index) => {
            const removeBtn = group.querySelector('.btn-remove-number');
            const ddiInput = group.querySelector('.ddi-input');
            const dddInput = group.querySelector('.ddd-input');
            const phoneInput = group.querySelector('.phone-input');
            
            // Atualizar atributos name
            ddiInput.name = `ddi_${index}`;
            dddInput.name = `ddd_${index}`;
            phoneInput.name = `phone_${index}`;
            
            // Atualizar visibilidade do botão
            if (inputGroups.length === 1) {
                removeBtn.style.display = 'none';
            } else {
                removeBtn.style.display = 'block';
            }
        });
    }

    /**
     * Aplica máscara no campo DDI
     */
    applyDDIMask(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 3) {
            value = value.substring(0, 3);
        }
        if (value === '') {
            value = '55';
        }
        e.target.value = value;
    }

    /**
     * Aplica máscara no campo DDD
     */
    applyDDDMask(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 2) {
            value = value.substring(0, 2);
        }
        e.target.value = value;
    }

    /**
     * Aplica máscara no campo de telefone
     */
    applyPhoneMask(e) {
        let value = e.target.value.replace(/\D/g, '');
        
        // Limitar a 9 dígitos
        if (value.length > 9) {
            value = value.substring(0, 9);
        }
        
        if (value.length <= 9) {
            if (value.length <= 4) {
                e.target.value = value;
            } else if (value.length <= 8) {
                e.target.value = value.replace(/(\d{4})(\d{0,4})/, '$1-$2');
            } else {
                e.target.value = value.replace(/(\d{5})(\d{0,4})/, '$1-$2');
            }
        }
    }

    /**
     * Manipula submissão do formulário de cliente
     */
    async handleClientSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const validation = UIUtils.validateClientForm(formData);
        
        if (!validation.isValid) {
            alert(validation.errors.join('\n'));
            return;
        }

        const dueDayValue = document.getElementById('dueDay').value;
        const dueDay = dueDayValue ? parseInt(dueDayValue) : null;
        
        const clientData = {
            name: document.getElementById('clientName').value.trim(),
            authorizedNumbers: validation.numbers,
            paymentStatus: document.getElementById('paymentStatus').value,
            dueDay: dueDay,
            dueDate: dueDay ? DateUtils.calculateNextDueDate(dueDay).toISOString() : null
        };
        
        try {
            if (this.editingClient) {
                await this.updateClient(this.editingClient.id, clientData);
            } else {
                await this.createClient(clientData);
            }
            
            this.closeClientModal();
        } catch (error) {
            console.error('Erro ao salvar cliente:', error);
            UIUtils.showNotification('Erro ao salvar cliente', 'error');
        }
    }

    /**
     * Cria novo cliente
     */
    async createClient(clientData) {
        const newClient = {
            id: Date.now(),
            ...clientData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        await this.sendWebhook(newClient, 'novo_cliente');
        
        // Recarregar dados do servidor
        setTimeout(async () => {
            await this.refreshClientsFromServer(true);
        }, 1000);
        
        UIUtils.showNotification('Cliente criado com sucesso!', 'success');
    }

    /**
     * Atualiza cliente existente
     */
    async updateClient(clientId, clientData) {
        const clientIndex = this.clients.findIndex(c => c.id === clientId);
        if (clientIndex !== -1) {
            const updatedClient = {
                ...this.clients[clientIndex],
                ...clientData,
                updatedAt: new Date().toISOString()
            };
            
            await this.sendWebhook(updatedClient, 'cliente_atualizado');
            
            // Recarregar dados do servidor
            setTimeout(async () => {
                await this.refreshClientsFromServer(true);
            }, 1000);
            
            UIUtils.showNotification('Cliente atualizado com sucesso!', 'success');
        }
    }

    /**
     * Edita cliente
     */
    editClient(clientId) {
        const client = this.clients.find(c => c.id === clientId);
        if (client) {
            this.openClientModal(client);
        }
    }

    /**
     * Confirma exclusão de cliente
     */
    confirmDeleteClient(clientId) {
        const client = this.clients.find(c => c.id === clientId);
        if (client) {
            this.elements.confirmMessage.textContent = 
                `Tem certeza que deseja excluir o cliente "${client.name}"? Esta ação não pode ser desfeita.`;
            
            this.elements.confirmAction.onclick = () => {
                this.deleteClient(clientId);
                this.closeConfirmModal();
            };
            
            this.elements.confirmModal.style.display = 'flex';
        }
    }

    /**
     * Exclui cliente
     */
    async deleteClient(clientId) {
        const clientIndex = this.clients.findIndex(c => c.id === clientId);
        if (clientIndex !== -1) {
            const clientToDelete = this.clients[clientIndex];
            
            await this.sendWebhook(clientToDelete, 'cliente_excluido');
            
            // Recarregar dados do servidor
            setTimeout(async () => {
                await this.refreshClientsFromServer(true);
            }, 1000);
            
            UIUtils.showNotification('Cliente excluído com sucesso!', 'success');
        }
    }

    /**
     * Fecha modal de confirmação
     */
    closeConfirmModal() {
        this.elements.confirmModal.style.display = 'none';
    }

    /**
     * Renova vencimento do cliente
     */
    async renewClientPayment(clientId) {
        try {
            const client = this.clients.find(c => c.id === clientId);
            if (!client) return;

            if (!client.dueDate || client.dueDate === null) {
                UIUtils.showNotification('ERRO: Cliente não tem data de vencimento configurada no banco!', 'error');
                return;
            }

            // Calcular nova data de vencimento
            const currentDueDate = new Date(client.dueDate);
            const newDueDate = new Date(currentDueDate.getFullYear(), currentDueDate.getMonth() + 1, currentDueDate.getDate());
            
            client.dueDate = newDueDate.toISOString();
            client.dueDay = newDueDate.getDate();

            await this.sendWebhook(client, 'cliente_atualizado');

            UIUtils.showNotification('Vencimento renovado com sucesso!', 'success');
            
            // Recarregar dados
            setTimeout(async () => {
                await this.refreshClientsFromServer(true);
            }, 1000);

        } catch (error) {
            console.error('Erro ao renovar vencimento:', error);
            UIUtils.showNotification('Erro ao renovar vencimento', 'error');
        }
    }

    /**
     * Atualiza clientes do servidor
     */
    async refreshClientsFromServer(silent = false) {
        try {
            await this.loadClientsFromDatabase(silent);
            this.updateStatistics();
            this.renderClientsTable();
            if (!silent) {
                UIUtils.showNotification('Dados atualizados!', 'success');
            }
        } catch (error) {
            if (!silent) {
                UIUtils.showNotification('Erro ao atualizar dados', 'warning');
            }
        }
    }

    /**
     * Envia webhook para sincronização
     */
    async sendWebhook(clientData, evento) {
        const webhookUrl = 'https://requisicao.grupoganfi.com/webhook/50e63045-e679-4ad3-b496-a6700f4c9917';
        
        // Converter números para formato API
        const numerosFormatados = clientData.authorizedNumbers.map(numero => {
            let numeroLimpo = numero.replace(/[^\d]/g, '');
            
            if (numeroLimpo.length === 13 && numeroLimpo.startsWith('55')) {
                return numeroLimpo;
            }
            
            if (numeroLimpo.length >= 10) {
                return '55' + numeroLimpo;
            }
            
            return numeroLimpo;
        });
        
        const payload = {
            evento: evento,
            cliente: {
                id: clientData.id,
                nome: clientData.name,
                numerosAutorizados: numerosFormatados,
                statusPagamento: clientData.paymentStatus,
                diaVencimento: clientData.dueDay,
                dataVencimento: clientData.dueDate,
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
                UIUtils.showNotification('⚠️ Erro ao sincronizar dados', 'warning');
                return false;
            }
        } catch (error) {
            console.error('Erro na requisição do webhook:', error);
            UIUtils.showNotification('⚠️ Erro de conexão na sincronização', 'warning');
        }
    }

    /**
     * Inicia refresh automático
     */
    startAutoRefresh() {
        setInterval(async () => {
            const loggedUser = localStorage.getItem('ganfi_logged_user');
            const dashboard = document.getElementById('dashboard');
            
            if (loggedUser && dashboard && dashboard.style.display !== 'none') {
                try {
                    await this.loadClientsFromDatabase(true);
                    this.updateStatistics();
                    this.renderClientsTable();
                } catch (error) {
                    console.log('Auto-refresh falhou:', error);
                }
            }
        }, 30000); // 30 segundos
    }
}

window.ClientsModule = ClientsModule;