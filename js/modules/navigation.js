/**
 * Módulo de navegação
 * Gerencia navegação entre seções do dashboard
 */

class NavigationModule {
    constructor() {
        this.elements = {
            navBtns: document.querySelectorAll('.nav-btn'),
            sections: document.querySelectorAll('.dashboard-section')
        };
        this.currentSection = 'clients';
    }

    /**
     * Inicializa o módulo de navegação
     */
    init() {
        this.setupEventListeners();
        this.setActiveSection(this.currentSection);
    }

    /**
     * Configura event listeners
     */
    setupEventListeners() {
        this.elements.navBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const section = btn.dataset.section;
                this.switchSection(section);
            });
        });
    }

    /**
     * Troca de seção ativa
     * @param {string} sectionName - Nome da seção
     */
    switchSection(sectionName) {
        this.currentSection = sectionName;
        this.setActiveSection(sectionName);
        
        // Disparar evento personalizado
        window.dispatchEvent(new CustomEvent('sectionChanged', {
            detail: { section: sectionName }
        }));
    }

    /**
     * Define seção ativa
     * @param {string} sectionName - Nome da seção
     */
    setActiveSection(sectionName) {
        // Atualizar botões de navegação
        this.elements.navBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.section === sectionName);
        });
        
        // Atualizar seções
        this.elements.sections.forEach(section => {
            section.classList.toggle('active', section.id === `${sectionName}Section`);
        });
    }

    /**
     * Obtém seção atual
     * @returns {string} Nome da seção atual
     */
    getCurrentSection() {
        return this.currentSection;
    }
}

window.NavigationModule = NavigationModule;