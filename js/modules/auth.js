/**
 * Módulo de autenticação
 * Gerencia login, logout e sessões de usuário
 */

class AuthModule {
    constructor() {
        this.config = {
            adminEmail: 'adminganfi@gmail.com',
            adminPassword: 'ganfiadmin*'
        };
        this.currentUser = null;
        this.storageKey = 'ganfi_logged_user';
        
        this.elements = {
            loginScreen: document.getElementById('loginScreen'),
            dashboard: document.getElementById('dashboard'),
            loginForm: document.getElementById('loginForm'),
            loginError: document.getElementById('loginError'),
            logoutBtn: document.getElementById('logoutBtn')
        };
    }

    /**
     * Inicializa o módulo de autenticação
     */
    init() {
        this.setupEventListeners();
        this.checkExistingSession();
    }

    /**
     * Configura event listeners
     */
    setupEventListeners() {
        this.elements.loginForm?.addEventListener('submit', (e) => this.handleLogin(e));
        this.elements.logoutBtn?.addEventListener('click', () => this.handleLogout());
    }

    /**
     * Verifica se existe sessão ativa
     */
    checkExistingSession() {
        const loggedUser = localStorage.getItem(this.storageKey);
        if (loggedUser) {
            this.currentUser = JSON.parse(loggedUser);
            this.showDashboard();
        } else {
            this.showLogin();
        }
    }

    /**
     * Manipula tentativa de login
     * @param {Event} e - Evento do formulário
     */
    handleLogin(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        if (email === this.config.adminEmail && password === this.config.adminPassword) {
            this.currentUser = { email: email };
            localStorage.setItem(this.storageKey, JSON.stringify(this.currentUser));
            this.showDashboard();
            this.hideLoginError();
        } else {
            this.showLoginError('Email ou senha incorretos');
        }
    }

    /**
     * Manipula logout
     */
    handleLogout() {
        this.currentUser = null;
        localStorage.removeItem(this.storageKey);
        this.showLogin();
    }

    /**
     * Mostra tela de login
     */
    showLogin() {
        this.elements.loginScreen.classList.remove('hidden');
        this.elements.dashboard.classList.add('hidden');
        this.clearLoginForm();
    }

    /**
     * Mostra dashboard
     */
    showDashboard() {
        this.elements.loginScreen.classList.add('hidden');
        this.elements.dashboard.classList.remove('hidden');
        
        // Disparar evento personalizado para outros módulos
        window.dispatchEvent(new CustomEvent('dashboardShown'));
    }

    /**
     * Mostra erro de login
     * @param {string} message - Mensagem de erro
     */
    showLoginError(message) {
        this.elements.loginError.textContent = message;
        this.elements.loginError.style.display = 'block';
    }

    /**
     * Esconde erro de login
     */
    hideLoginError() {
        this.elements.loginError.style.display = 'none';
    }

    /**
     * Limpa formulário de login
     */
    clearLoginForm() {
        this.elements.loginForm.reset();
        this.hideLoginError();
    }

    /**
     * Verifica se usuário está logado
     * @returns {boolean} Status de autenticação
     */
    isAuthenticated() {
        return !!this.currentUser;
    }

    /**
     * Obtém usuário atual
     * @returns {Object|null} Dados do usuário
     */
    getCurrentUser() {
        return this.currentUser;
    }
}

window.AuthModule = AuthModule;