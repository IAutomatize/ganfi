/**
 * Utilitários para formatação de datas
 */

class DateUtils {
    /**
     * Calcula a próxima data de vencimento baseada no dia
     * @param {number} dueDay - Dia do vencimento (1-31)
     * @returns {Date} Próxima data de vencimento
     */
    static calculateNextDueDate(dueDay) {
        const today = new Date();
        const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, dueDay);
        return nextMonth;
    }

    /**
     * Formata data para padrão brasileiro (DD/MM/YYYY)
     * @param {string|Date} dateString - Data para formatar
     * @returns {string} Data formatada
     */
    static formatDateToBR(dateString) {
        if (!dateString || dateString === null) {
            return 'Data não configurada';
        }
        
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            return 'Data inválida';
        }
        
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    }

    /**
     * Verifica se uma data está vencida
     * @param {string|Date} dateString - Data para verificar
     * @returns {boolean} True se vencida
     */
    static isOverdue(dateString) {
        if (!dateString) return false;
        
        const dueDate = new Date(dateString);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        dueDate.setHours(0, 0, 0, 0);
        
        return dueDate < today;
    }
}

window.DateUtils = DateUtils;