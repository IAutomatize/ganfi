/**
 * Utilitários para notificações e UI
 */

class UIUtils {
    /**
     * Mostra notificação temporária
     * @param {string} message - Mensagem a exibir
     * @param {string} type - Tipo: success, error, warning, info
     * @param {number} duration - Duração em ms (padrão: 3000)
     */
    static showNotification(message, type = 'info', duration = 3000) {
        // Remove notificação existente se houver
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        // Criar elemento de notificação
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;

        // Adicionar ao DOM
        document.body.appendChild(notification);

        // Mostrar com animação
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);

        // Remover após duração especificada
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, duration);
    }

    /**
     * Converte status do cliente para texto legível
     * @param {string} status - Status do pagamento
     * @returns {string} Texto do status
     */
    static getStatusText(status) {
        const statusMap = {
            'paid': 'Pagamento em Dia',
            'pending': 'Pagamento Pendente',
            'overdue': 'Pagamento em Atraso'
        };
        return statusMap[status] || status;
    }

    /**
     * Converte texto do status para código
     * @param {string} text - Texto do status
     * @returns {string} Código do status
     */
    static getStatusCode(text) {
        const textMap = {
            'Pagamento em Dia': 'paid',
            'Pagamento Pendente': 'pending', 
            'Pagamento em Atraso': 'overdue'
        };
        return textMap[text] || text;
    }

    /**
     * Limpa formulário de cliente
     * @param {string} formId - ID do formulário
     */
    static clearForm(formId) {
        const form = document.getElementById(formId);
        if (!form) return;

        form.reset();
        
        // Limpar container de números
        const numbersContainer = form.querySelector('.numbers-container');
        if (numbersContainer) {
            numbersContainer.innerHTML = '';
        }

        // Limpar ID oculto
        const clientIdField = document.getElementById('clientId');
        if (clientIdField) {
            clientIdField.value = '';
        }
    }

    /**
     * Valida formulário de cliente
     * @param {FormData} formData - Dados do formulário
     * @returns {Object} Resultado da validação
     */
    static validateClientForm(formData) {
        const errors = [];
        
        const name = formData.get('name');
        if (!name || name.trim().length < 2) {
            errors.push('Nome deve ter pelo menos 2 caracteres');
        }

        const numbers = [];
        let index = 0;
        while (formData.has(`ddi_${index}`)) {
            const ddi = formData.get(`ddi_${index}`);
            const ddd = formData.get(`ddd_${index}`);
            const phone = formData.get(`phone_${index}`);
            
            if (ddd || phone) {
                if (!ddd || ddd.length !== 2) {
                    errors.push(`DDD do telefone ${index + 1} deve ter 2 dígitos`);
                }
                if (!phone || phone.replace(/\D/g, '').length < 8) {
                    errors.push(`Telefone ${index + 1} deve ter pelo menos 8 dígitos`);
                }
                if (ddd && phone) {
                    numbers.push(PhoneUtils.combineComponents(ddi, ddd, phone));
                }
            }
            index++;
        }

        if (numbers.length === 0) {
            errors.push('Pelo menos um número de telefone é obrigatório');
        }

        return {
            isValid: errors.length === 0,
            errors,
            numbers
        };
    }
}

window.UIUtils = UIUtils;