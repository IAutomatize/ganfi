/**
 * Login Script - Grupo Ganfi CRM
 * Gerencia autenticação e redirecionamento
 */

class LoginManager {
    constructor() {
        this.config = {
            adminEmail: 'adminganfi@gmail.com',
            adminPassword: 'ganfiadmin*'
        };
        
        this.elements = {
            loginForm: document.getElementById('loginForm'),
            emailInput: document.getElementById('email'),
            passwordInput: document.getElementById('password'),
            togglePassword: document.getElementById('togglePassword'),
            rememberMe: document.getElementById('rememberMe'),
            loginButton: document.querySelector('.btn-login'),
            loginError: document.getElementById('loginError')
        };
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkExistingSession();
        this.loadRememberedEmail();
    }

    setupEventListeners() {
        // Submit do formulário
        this.elements.loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        
        // Toggle de senha
        this.elements.togglePassword.addEventListener('click', () => this.togglePasswordVisibility());
        
        // Enter nos campos
        this.elements.emailInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.elements.passwordInput.focus();
        });
        
        // Limpar erro ao digitar
        this.elements.emailInput.addEventListener('input', () => this.clearError());
        this.elements.passwordInput.addEventListener('input', () => this.clearError());
        
        // Animação de foco
        this.setupFocusAnimations();
    }

    setupFocusAnimations() {
        const inputs = [this.elements.emailInput, this.elements.passwordInput];
        
        inputs.forEach(input => {
            input.addEventListener('focus', () => {
                input.parentElement.classList.add('focused');
            });
            
            input.addEventListener('blur', () => {
                if (!input.value) {
                    input.parentElement.classList.remove('focused');
                }
            });
        });
    }

    checkExistingSession() {
        const loggedUser = localStorage.getItem('ganfi_logged_user');
        if (loggedUser) {
            // Usuário já logado, redirecionar diretamente
            this.redirectToDashboard();
        }
    }

    loadRememberedEmail() {
        const rememberedEmail = localStorage.getItem('ganfi_remembered_email');
        if (rememberedEmail) {
            this.elements.emailInput.value = rememberedEmail;
            this.elements.rememberMe.checked = true;
            this.elements.passwordInput.focus();
        }
    }

    async handleLogin(e) {
        e.preventDefault();
        
        const email = this.elements.emailInput.value.trim();
        const password = this.elements.passwordInput.value;
        
        // Validações
        if (!this.validateInputs(email, password)) {
            return;
        }
        
        // Mostrar estado de loading
        this.setLoadingState(true);
        
        try {
            // Simular delay de autenticação (pode ser removido em produção)
            await this.sleep(800);
            
            if (email === this.config.adminEmail && password === this.config.adminPassword) {
                await this.handleSuccessfulLogin(email);
            } else {
                this.showError('Email ou senha incorretos');
                this.setLoadingState(false);
            }
        } catch (error) {
            this.showError('Erro interno. Tente novamente.');
            this.setLoadingState(false);
        }
    }

    validateInputs(email, password) {
        if (!email) {
            this.showError('Digite seu email');
            this.elements.emailInput.focus();
            return false;
        }
        
        if (!this.isValidEmail(email)) {
            this.showError('Digite um email válido');
            this.elements.emailInput.focus();
            return false;
        }
        
        if (!password) {
            this.showError('Digite sua senha');
            this.elements.passwordInput.focus();
            return false;
        }
        
        if (password.length < 6) {
            this.showError('Senha deve ter pelo menos 6 caracteres');
            this.elements.passwordInput.focus();
            return false;
        }
        
        return true;
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    async handleSuccessfulLogin(email) {
        // Salvar sessão
        const userData = {
            email: email,
            loginTime: new Date().toISOString(),
            permissions: ['admin']
        };
        
        localStorage.setItem('ganfi_logged_user', JSON.stringify(userData));
        
        // Salvar email se "Lembrar de mim" estiver marcado
        if (this.elements.rememberMe.checked) {
            localStorage.setItem('ganfi_remembered_email', email);
        } else {
            localStorage.removeItem('ganfi_remembered_email');
        }
        
        // Animação de sucesso
        await this.showSuccessAnimation();
        
        // Redirecionar
        this.redirectToDashboard();
    }

    async showSuccessAnimation() {
        const button = this.elements.loginButton;
        const originalText = button.innerHTML;
        
        button.innerHTML = `
            <i class="fas fa-check btn-icon"></i>
            <span class="btn-text">Login realizado!</span>
        `;
        
        button.style.background = 'linear-gradient(135deg, #10b981, #059669)';
        
        await this.sleep(1000);
    }

    redirectToDashboard() {
        // Animação de saída
        document.body.style.opacity = '0.7';
        document.body.style.transform = 'scale(0.98)';
        document.body.style.transition = 'all 0.3s ease';
        
        setTimeout(() => {
            window.location.href = 'assessoria-tributaria.html';
        }, 300);
    }

    togglePasswordVisibility() {
        const isPassword = this.elements.passwordInput.type === 'password';
        const icon = this.elements.togglePassword.querySelector('i');
        
        if (isPassword) {
            this.elements.passwordInput.type = 'text';
            icon.className = 'fas fa-eye-slash';
        } else {
            this.elements.passwordInput.type = 'password';
            icon.className = 'fas fa-eye';
        }
        
        // Manter foco no input
        this.elements.passwordInput.focus();
    }

    setLoadingState(loading) {
        const button = this.elements.loginButton;
        const icon = button.querySelector('.btn-icon');
        
        if (loading) {
            button.classList.add('loading');
            button.disabled = true;
            icon.className = 'fas fa-spinner';
        } else {
            button.classList.remove('loading');
            button.disabled = false;
            icon.className = 'fas fa-arrow-right';
        }
    }

    showError(message) {
        const errorElement = this.elements.loginError;
        errorElement.textContent = message;
        errorElement.style.display = 'block';
        
        // Auto esconder após 5 segundos
        setTimeout(() => {
            this.clearError();
        }, 5000);
    }

    clearError() {
        this.elements.loginError.style.display = 'none';
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Inicializar quando DOM carregar
document.addEventListener('DOMContentLoaded', () => {
    new LoginManager();
});

// Adicionar estilos de foco dinâmicos
const style = document.createElement('style');
style.textContent = `
    .input-wrapper.focused .input-icon {
        color: #3b82f6;
        transform: scale(1.1);
    }
    
    .input-wrapper.focused .form-control {
        border-color: #3b82f6;
        box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
    }
`;
document.head.appendChild(style);