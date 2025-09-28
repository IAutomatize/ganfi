/**
 * Tarefas Script - Sistema de gestão de tarefas entre setores
 * Demonstração estilo ClickUp/Monday.com
 */

class TasksDemo {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupInteractivity();
        this.showDemoNotification();
        this.checkAuthentication();
    }

    setupEventListeners() {
        // View controls
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', () => this.switchView(btn));
        });

        // Group selector
        const groupSelect = document.querySelector('.group-select');
        if (groupSelect) {
            groupSelect.addEventListener('change', () => this.handleGroupChange());
        }

        // Task checkboxes
        document.querySelectorAll('.task-checkbox input').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => this.handleTaskComplete(e));
        });

        // Task rows
        document.querySelectorAll('.task-row').forEach(row => {
            row.addEventListener('click', (e) => this.handleTaskClick(e, row));
        });

        // Add task buttons
        document.querySelectorAll('.add-task-row').forEach(btn => {
            btn.addEventListener('click', () => this.showAddTaskModal());
        });

        // Group menus
        document.querySelectorAll('.group-menu').forEach(menu => {
            menu.addEventListener('click', (e) => this.showGroupMenu(e));
        });

        // Logout
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.logout());
        }
    }

    setupInteractivity() {
        // Hover effects on task rows
        document.querySelectorAll('.task-row').forEach(row => {
            row.addEventListener('mouseenter', () => {
                row.style.transform = 'translateX(2px)';
            });
            
            row.addEventListener('mouseleave', () => {
                row.style.transform = 'translateX(0)';
            });
        });

        // Drag and drop simulation (visual only)
        this.setupDragAndDrop();
        
        // Update counters
        this.updateTaskCounters();
    }

    switchView(selectedBtn) {
        // Remove active from all buttons
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Add active to selected
        selectedBtn.classList.add('active');
        
        const viewType = selectedBtn.textContent.trim();
        
        if (window.UIUtils) {
            UIUtils.showNotification(`📋 Visualização alterada para: ${viewType}`, 'info');
        } else {
            console.log(`View switched to: ${viewType}`);
        }
    }

    handleGroupChange() {
        const select = document.querySelector('.group-select');
        const selectedValue = select.value;
        const groupNames = {
            'status': 'Status',
            'assignee': 'Responsável',
            'priority': 'Prioridade',
            'department': 'Setor'
        };
        
        if (window.UIUtils) {
            UIUtils.showNotification(`🔄 Reagrupando por: ${groupNames[selectedValue]}`, 'info');
        } else {
            console.log(`Grouping by: ${selectedValue}`);
        }
        
        // Simular reordenação
        setTimeout(() => {
            this.animateRegroup();
        }, 500);
    }

    handleTaskComplete(e) {
        const checkbox = e.target;
        const taskRow = checkbox.closest('.task-row');
        const taskTitle = taskRow.querySelector('.task-title').textContent;
        
        if (checkbox.checked) {
            taskRow.classList.add('completed');
            
            if (window.UIUtils) {
                UIUtils.showNotification(`✅ Tarefa concluída: ${taskTitle}`, 'success');
            }
            
            // Animar para seção concluído após delay
            setTimeout(() => {
                this.moveTaskToCompleted(taskRow);
            }, 1000);
        } else {
            taskRow.classList.remove('completed');
            
            if (window.UIUtils) {
                UIUtils.showNotification(`🔄 Tarefa reaberta: ${taskTitle}`, 'warning');
            }
        }
        
        this.updateTaskCounters();
    }

    handleTaskClick(e, row) {
        // Evitar ação se clicou no checkbox
        if (e.target.type === 'checkbox' || e.target.closest('.task-checkbox')) {
            return;
        }
        
        // Remove active de todas as tasks
        document.querySelectorAll('.task-row').forEach(r => {
            r.classList.remove('active');
        });
        
        // Adiciona active na selecionada
        row.classList.add('active');
        
        const taskTitle = row.querySelector('.task-title').textContent;
        const taskId = row.querySelector('.task-id').textContent;
        
        if (window.UIUtils) {
            UIUtils.showNotification(`📝 Tarefa selecionada: ${taskId} - ${taskTitle}`, 'info');
        }
    }

    showAddTaskModal() {
        if (window.UIUtils) {
            UIUtils.showNotification('➕ Em breve: Modal para criar nova tarefa com assignee e setor', 'info');
        } else {
            alert('Funcionalidade em desenvolvimento: Nova Tarefa');
        }
    }

    showGroupMenu(e) {
        e.stopPropagation();
        
        if (window.UIUtils) {
            UIUtils.showNotification('⚙️ Menu do grupo: Renomear, Configurar, Arquivar', 'info');
        } else {
            alert('Menu do grupo: Opções avançadas');
        }
    }

    moveTaskToCompleted(taskRow) {
        const completedGroup = document.querySelector('.task-group:last-child .task-list');
        
        if (completedGroup) {
            // Animar saída
            taskRow.style.opacity = '0.5';
            taskRow.style.transform = 'translateX(20px)';
            
            setTimeout(() => {
                // Mover para grupo concluído
                completedGroup.appendChild(taskRow);
                taskRow.style.opacity = '1';
                taskRow.style.transform = 'translateX(0)';
                
                this.updateTaskCounters();
            }, 300);
        }
    }

    animateRegroup() {
        const taskGroups = document.querySelectorAll('.task-group');
        
        taskGroups.forEach((group, index) => {
            group.style.opacity = '0.7';
            group.style.transform = 'scale(0.98)';
            
            setTimeout(() => {
                group.style.opacity = '1';
                group.style.transform = 'scale(1)';
            }, index * 100);
        });
    }

    updateTaskCounters() {
        // Atualizar contadores dos grupos
        document.querySelectorAll('.task-group').forEach(group => {
            const tasks = group.querySelectorAll('.task-row').length;
            const counter = group.querySelector('.task-count');
            if (counter) {
                counter.textContent = tasks;
            }
        });

        // Atualizar summary
        const totalTasks = document.querySelectorAll('.task-row').length;
        const inProgress = document.querySelectorAll('.task-row.active').length;
        const overdue = document.querySelectorAll('.field-due-date.overdue').length;

        const summaryItems = document.querySelectorAll('.summary-item');
        if (summaryItems[0]) summaryItems[0].querySelector('.summary-count').textContent = totalTasks;
        if (summaryItems[1]) summaryItems[1].querySelector('.summary-count').textContent = inProgress;
        if (summaryItems[2]) summaryItems[2].querySelector('.summary-count').textContent = overdue;
    }

    setupDragAndDrop() {
        // Simulação visual de drag and drop
        document.querySelectorAll('.task-row').forEach(row => {
            row.addEventListener('dragstart', (e) => {
                row.classList.add('dragging');
                e.dataTransfer.effectAllowed = 'move';
            });

            row.addEventListener('dragend', () => {
                row.classList.remove('dragging');
            });

            // Tornar arrastável
            row.draggable = true;
        });

        // Drop zones
        document.querySelectorAll('.task-list').forEach(list => {
            list.addEventListener('dragover', (e) => {
                e.preventDefault();
                list.classList.add('drop-zone');
            });

            list.addEventListener('dragleave', () => {
                list.classList.remove('drop-zone');
            });

            list.addEventListener('drop', (e) => {
                e.preventDefault();
                list.classList.remove('drop-zone');
                
                if (window.UIUtils) {
                    UIUtils.showNotification('🔄 Tarefa movida! (Demo - funcionalidade completa em breve)', 'info');
                }
            });
        });
    }

    checkAuthentication() {
        const loggedUser = localStorage.getItem('ganfi_logged_user');
        if (!loggedUser) {
            window.location.href = 'login.html';
        }
    }

    logout() {
        localStorage.removeItem('ganfi_logged_user');
        window.location.href = 'login.html';
    }

    showDemoNotification() {
        setTimeout(() => {
            if (window.UIUtils) {
                UIUtils.showNotification('🎯 Demo de Tarefas: Gestão entre setores estilo ClickUp. Funcionalidades completas em breve!', 'warning', 6000);
            }
        }, 1500);
    }
}

// Inicializar quando DOM carregar
document.addEventListener('DOMContentLoaded', () => {
    new TasksDemo();
});

// Adicionar estilos dinâmicos
const style = document.createElement('style');
style.textContent = `
    .task-row.dragging {
        opacity: 0.6;
        transform: rotate(2deg) scale(1.02);
        z-index: 1000;
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
    }
    
    .task-list.drop-zone {
        background: rgba(59, 130, 246, 0.05);
        border: 2px dashed var(--color-primary);
        border-radius: var(--radius-md);
    }
    
    .task-row {
        transition: all 0.2s ease;
    }
    
    .task-group {
        transition: all 0.3s ease;
    }
    
    .progress-fill-65 {
        width: 65%;
    }
`;
document.head.appendChild(style);