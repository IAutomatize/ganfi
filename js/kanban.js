/**
 * Kanban Script - Página de demonstração
 * Funcionalidades básicas de interação
 */

class KanbanDemo {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.addInteractivity();
        this.showDemoNotification();
    }

    setupEventListeners() {
        // Cards clicáveis
        document.querySelectorAll('.task-card').forEach(card => {
            card.addEventListener('click', () => this.showTaskDetails(card));
        });

        // Botões de adicionar tarefa
        document.querySelectorAll('.add-task-btn').forEach(btn => {
            btn.addEventListener('click', () => this.showAddTaskModal());
        });

        // Menu das colunas
        document.querySelectorAll('.column-menu').forEach(menu => {
            menu.addEventListener('click', (e) => this.showColumnMenu(e));
        });
    }

    addInteractivity() {
        // Animação nos cards
        document.querySelectorAll('.task-card').forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-2px)';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0)';
            });
        });

        // Contador dinâmico
        this.updateTaskCounts();
    }

    updateTaskCounts() {
        document.querySelectorAll('.kanban-column').forEach(column => {
            const tasks = column.querySelectorAll('.task-card').length;
            const counter = column.querySelector('.task-count');
            if (counter) {
                counter.textContent = tasks;
            }
        });
    }

    showTaskDetails(card) {
        const taskTitle = card.querySelector('.task-title').textContent;
        const taskId = card.querySelector('.task-id').textContent;
        
        if (window.UIUtils) {
            UIUtils.showNotification(`📋 Tarefa ${taskId}: ${taskTitle}`, 'info');
        } else {
            alert(`Detalhes da Tarefa ${taskId}:\n${taskTitle}`);
        }
    }

    showAddTaskModal() {
        if (window.UIUtils) {
            UIUtils.showNotification('➕ Em breve: Modal para criar nova tarefa', 'info');
        } else {
            alert('Funcionalidade em desenvolvimento: Criar nova tarefa');
        }
    }

    showColumnMenu(e) {
        e.stopPropagation();
        
        if (window.UIUtils) {
            UIUtils.showNotification('⚙️ Menu da coluna: Renomear, Arquivar, Configurações', 'info');
        } else {
            alert('Menu da coluna: Opções de configuração');
        }
    }

    showDemoNotification() {
        setTimeout(() => {
            if (window.UIUtils) {
                UIUtils.showNotification('🎯 Esta é uma página de demonstração do Kanban. Funcionalidades completas em breve!', 'warning', 5000);
            }
        }, 1000);
    }
}

// Função de logout global
function logout() {
    localStorage.removeItem('ganfi_logged_user');
    window.location.href = 'login.html';
}

// Inicializar quando DOM carregar
document.addEventListener('DOMContentLoaded', () => {
    new KanbanDemo();
});

// Verificar autenticação
document.addEventListener('DOMContentLoaded', () => {
    const loggedUser = localStorage.getItem('ganfi_logged_user');
    if (!loggedUser) {
        window.location.href = 'login.html';
    }
});