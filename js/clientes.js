/**
 * Clientes Script - Página de demonstração
 * Funcionalidades de interface para gestão de clientes
 */

class ClientesDemo {
    constructor() {
        this.currentFilter = 'todos';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.addInteractivity();
        this.showDemoNotification();
    }

    setupEventListeners() {
        // Filtros
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => this.handleFilterChange(btn));
        });

        // Busca
        const searchInput = document.querySelector('.search-box input');
        searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));

        // Checkboxes
        const selectAll = document.querySelector('.select-all');
        selectAll.addEventListener('change', (e) => this.handleSelectAll(e.target.checked));

        // Botões de ação
        document.querySelectorAll('.btn-action').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleAction(btn, e));
        });

        // Botões da tabela
        document.querySelectorAll('.btn-icon').forEach(btn => {
            btn.addEventListener('click', () => this.handleTableAction(btn));
        });

        // Paginação
        document.querySelectorAll('.pagination-btn').forEach(btn => {
            btn.addEventListener('click', () => this.handlePagination(btn));
        });
    }

    addInteractivity() {
        // Hover nos cards de stats
        document.querySelectorAll('.stat-card').forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-2px)';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0)';
            });
        });

        // Hover nas linhas da tabela
        document.querySelectorAll('.table-row').forEach(row => {
            row.addEventListener('click', () => {
                const checkbox = row.querySelector('input[type="checkbox"]');
                checkbox.checked = !checkbox.checked;
                this.updateSelectionCount();
            });
        });

        // Atualizar contagem de seleção
        this.updateSelectionCount();
    }

    handleFilterChange(btn) {
        // Remover classe active de todos
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        
        // Adicionar active no clicado
        btn.classList.add('active');
        
        // Simular filtro
        const filterType = btn.textContent.toLowerCase().trim().split(' ')[0];
        this.currentFilter = filterType;
        
        if (window.UIUtils) {
            UIUtils.showNotification(`📊 Filtro aplicado: ${filterType}`, 'info');
        }
        
        // Aqui seria aplicado o filtro real na tabela
        this.applyFilter(filterType);
    }

    applyFilter(filterType) {
        const rows = document.querySelectorAll('.table-row');
        
        rows.forEach(row => {
            const status = row.querySelector('.status-badge');
            const shouldShow = this.shouldShowRow(status, filterType);
            
            row.style.display = shouldShow ? '' : 'none';
        });
    }

    shouldShowRow(statusElement, filterType) {
        if (filterType === 'todos') return true;
        
        const statusText = statusElement.textContent.toLowerCase();
        
        switch(filterType) {
            case 'ativos':
                return statusText.includes('ativo') && !statusText.includes('inativo');
            case 'inativos':
                return statusText.includes('inativo');
            case 'prospects':
                return statusText.includes('prospect');
            default:
                return true;
        }
    }

    handleSearch(searchTerm) {
        const rows = document.querySelectorAll('.table-row');
        const term = searchTerm.toLowerCase();
        
        rows.forEach(row => {
            const clientName = row.querySelector('.client-name').textContent.toLowerCase();
            const clientEmail = row.querySelector('.client-email').textContent.toLowerCase();
            const companyName = row.querySelector('.company-name').textContent.toLowerCase();
            
            const matches = clientName.includes(term) || 
                           clientEmail.includes(term) || 
                           companyName.includes(term);
            
            row.style.display = matches ? '' : 'none';
        });
    }

    handleSelectAll(checked) {
        document.querySelectorAll('.table-row input[type="checkbox"]').forEach(checkbox => {
            checkbox.checked = checked;
        });
        this.updateSelectionCount();
    }

    updateSelectionCount() {
        const selected = document.querySelectorAll('.table-row input[type="checkbox"]:checked').length;
        
        if (selected > 0 && window.UIUtils) {
            UIUtils.showNotification(`✓ ${selected} cliente(s) selecionado(s)`, 'info', 2000);
        }
    }

    handleAction(btn, e) {
        e.stopPropagation();
        
        const row = btn.closest('.table-row');
        const clientName = row.querySelector('.client-name').textContent;
        const action = btn.classList.contains('view') ? 'Visualizar' :
                      btn.classList.contains('edit') ? 'Editar' : 'Excluir';
        
        if (window.UIUtils) {
            const icon = action === 'Visualizar' ? '👁️' : action === 'Editar' ? '✏️' : '🗑️';
            UIUtils.showNotification(`${icon} ${action}: ${clientName}`, 'info');
        } else {
            alert(`${action} cliente: ${clientName}`);
        }
    }

    handleTableAction(btn) {
        const hasFilter = btn.querySelector('.fa-filter');
        const hasSort = btn.querySelector('.fa-sort');
        const hasColumns = btn.querySelector('.fa-columns');
        
        let action = '';
        if (hasFilter) action = '🔍 Filtros avançados';
        else if (hasSort) action = '📊 Ordenação';
        else if (hasColumns) action = '📋 Configurar colunas';
        
        if (window.UIUtils) {
            UIUtils.showNotification(action, 'info');
        }
    }

    handlePagination(btn) {
        const hasLeft = btn.querySelector('.fa-chevron-left');
        const direction = hasLeft ? 'anterior' : 'próxima';
        
        if (window.UIUtils) {
            UIUtils.showNotification(`📄 Página ${direction}`, 'info');
        }
    }

    showDemoNotification() {
        setTimeout(() => {
            if (window.UIUtils) {
                UIUtils.showNotification('👥 Esta é uma página de demonstração de Clientes. Dados são fictícios!', 'warning', 5000);
            }
        }, 1000);
    }

    // Métodos para simular funcionalidades
    exportData() {
        if (window.UIUtils) {
            UIUtils.showNotification('📥 Exportando dados dos clientes...', 'info');
        }
    }

    addNewClient() {
        if (window.UIUtils) {
            UIUtils.showNotification('➕ Modal de novo cliente será aberto em breve!', 'info');
        }
    }
}

// Função de logout global
function logout() {
    localStorage.removeItem('ganfi_logged_user');
    window.location.href = 'login.html';
}

// Inicializar quando DOM carregar
document.addEventListener('DOMContentLoaded', () => {
    new ClientesDemo();
    
    // Adicionar funcionalidades aos botões do header
    document.querySelector('.header-actions .btn-secondary').addEventListener('click', () => {
        if (window.clientesDemo) {
            clientesDemo.exportData();
        }
    });
    
    document.querySelector('.header-actions .btn-primary').addEventListener('click', () => {
        if (window.clientesDemo) {
            clientesDemo.addNewClient();
        }
    });
});

// Verificar autenticação
document.addEventListener('DOMContentLoaded', () => {
    const loggedUser = localStorage.getItem('ganfi_logged_user');
    if (!loggedUser) {
        window.location.href = 'login.html';
    }
});

// Expor instância global
let clientesDemo;
document.addEventListener('DOMContentLoaded', () => {
    clientesDemo = new ClientesDemo();
});