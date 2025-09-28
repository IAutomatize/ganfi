/**
 * Aplicação Principal - Sistema de Assessoria Tributária Ganfi
 * Gerencia inicialização e coordenação de módulos
 */

class AssessoriaTributariaApp {
    constructor() {
        this.modules = {};
        this.isInitialized = false;
    }

    /**
     * Inicializa a aplicação
     */
    async init() {
        try {
            console.log('🚀 Iniciando Sistema de Assessoria Tributária Ganfi...');
            
            // Aguardar carregamento completo do DOM
            if (document.readyState === 'loading') {
                await new Promise(resolve => {
                    document.addEventListener('DOMContentLoaded', resolve);
                });
            }

            // Inicializar módulos na ordem correta
            await this.initializeModules();
            
            // Configurar estilos globais
            this.setupGlobalStyles();
            
            // Marcar como inicializado
            this.isInitialized = true;
            
            console.log('✅ Sistema inicializado com sucesso!');
            
        } catch (error) {
            console.error('❌ Erro ao inicializar aplicação:', error);
            this.showCriticalError('Falha na inicialização do sistema');
        }
    }

    /**
     * Inicializa todos os módulos
     */
    async initializeModules() {
        try {
            // Verificar se dependências estão disponíveis
            this.checkDependencies();

            // 1. Módulo de Autenticação (deve ser primeiro)
            this.modules.auth = new AuthModule();
            this.modules.auth.init();

            // 2. Módulo de Navegação
            this.modules.navigation = new NavigationModule();
            this.modules.navigation.init();

            // 3. Módulo de Clientes (principal funcionalidade)
            this.modules.clients = new ClientsModule();
            this.modules.clients.init();

            // Expor instâncias globalmente para compatibilidade
            window.authModule = this.modules.auth;
            window.navigationModule = this.modules.navigation;
            window.clientsModule = this.modules.clients;

            console.log('📦 Módulos inicializados:', Object.keys(this.modules));

        } catch (error) {
            console.error('Erro ao inicializar módulos:', error);
            throw error;
        }
    }

    /**
     * Verifica se dependências estão disponíveis
     */
    checkDependencies() {
        const requiredDependencies = [
            'apiService',
            'DateUtils', 
            'PhoneUtils',
            'UIUtils',
            'AuthModule',
            'NavigationModule', 
            'ClientsModule'
        ];

        const missing = requiredDependencies.filter(dep => !window[dep]);
        
        if (missing.length > 0) {
            throw new Error(`Dependências ausentes: ${missing.join(', ')}`);
        }
    }

    /**
     * Configura estilos globais para notificações
     */
    setupGlobalStyles() {
        const style = document.createElement('style');
        style.textContent = `
            /* Estilos para notificações */
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 15px 20px;
                border-radius: 8px;
                box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
                z-index: 2000;
                display: flex;
                align-items: center;
                gap: 10px;
                color: white;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                font-size: 14px;
                max-width: 400px;
                word-wrap: break-word;
                opacity: 0;
                transform: translateX(100%);
                transition: all 0.3s ease;
            }

            .notification.show {
                opacity: 1;
                transform: translateX(0);
            }

            .notification-success {
                background: linear-gradient(135deg, #27ae60, #2ecc71);
            }

            .notification-error {
                background: linear-gradient(135deg, #e74c3c, #c0392b);
            }

            .notification-warning {
                background: linear-gradient(135deg, #f39c12, #e67e22);
            }

            .notification-info {
                background: linear-gradient(135deg, #3498db, #2980b9);
            }

            /* Animações */
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

            /* Estilos para campos de formulário com erro */
            .form-field-error {
                border-color: #e74c3c !important;
                box-shadow: 0 0 5px rgba(231, 76, 60, 0.3) !important;
            }

            /* Melhorias no modal */
            .modal {
                backdrop-filter: blur(5px);
            }

            /* Loading spinner */
            .loading-spinner {
                display: inline-block;
                width: 20px;
                height: 20px;
                border: 3px solid rgba(255,255,255,.3);
                border-radius: 50%;
                border-top-color: #fff;
                animation: spin 1s ease-in-out infinite;
            }

            @keyframes spin {
                to { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Mostra erro crítico
     */
    showCriticalError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(231, 76, 60, 0.95);
            color: white;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            z-index: 9999;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        `;
        
        errorDiv.innerHTML = `
            <i class="fas fa-exclamation-triangle" style="font-size: 4rem; margin-bottom: 20px;"></i>
            <h2 style="margin: 0 0 10px 0;">Erro do Sistema</h2>
            <p style="margin: 0; font-size: 18px;">${message}</p>
            <button onclick="location.reload()" style="
                margin-top: 30px;
                padding: 12px 24px;
                background: white;
                color: #e74c3c;
                border: none;
                border-radius: 6px;
                font-size: 16px;
                cursor: pointer;
            ">Recarregar Página</button>
        `;
        
        document.body.appendChild(errorDiv);
    }

    /**
     * Obtém instância de módulo
     */
    getModule(name) {
        return this.modules[name];
    }

    /**
     * Verifica se aplicação está inicializada
     */
    isReady() {
        return this.isInitialized;
    }
}

// Inicializar aplicação quando scripts carregarem
window.app = new AssessoriaTributariaApp();

// Auto-inicializar
(async function() {
    try {
        await window.app.init();
    } catch (error) {
        console.error('Falha na inicialização automática:', error);
    }
})();