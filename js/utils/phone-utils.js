/**
 * Utilitários para formatação de telefones
 */

class PhoneUtils {
    /**
     * Formata número de telefone para exibição
     * @param {string} phoneNumber - Número para formatar
     * @returns {string} Número formatado
     */
    static formatForDisplay(phoneNumber) {
        if (!phoneNumber || typeof phoneNumber !== 'string') {
            return '';
        }
        
        // Limpar o número
        let cleanNumber = phoneNumber.replace(/\D/g, '');
        
        // Se tem 13 dígitos, remover DDI 55 do Brasil
        if (cleanNumber.length === 13 && cleanNumber.startsWith('55')) {
            cleanNumber = cleanNumber.substring(2);
        }
        
        // Formatar como (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
        if (cleanNumber.length >= 10) {
            const ddd = cleanNumber.substring(0, 2);
            const restOfNumber = cleanNumber.substring(2);
            
            if (restOfNumber.length === 9) {
                const formatted = restOfNumber.substring(0, 5) + '-' + restOfNumber.substring(5);
                return `(${ddd}) ${formatted}`;
            } else if (restOfNumber.length === 8) {
                const formatted = restOfNumber.substring(0, 4) + '-' + restOfNumber.substring(4);
                return `(${ddd}) ${formatted}`;
            }
        }
        
        // Se não conseguiu formatar, retornar como veio
        return phoneNumber;
    }

    /**
     * Extrai componentes DDI, DDD e número do telefone
     * @param {string} phoneNumber - Número completo
     * @returns {Object} Objeto com ddi, ddd e phone
     */
    static extractComponents(phoneNumber) {
        if (!phoneNumber || typeof phoneNumber !== 'string') {
            return { ddi: '55', ddd: '', phone: '' };
        }

        let ddi = '55'; // padrão Brasil
        let ddd = '';
        let phone = '';
        
        // Limpar o número removendo formatação
        let cleanNumber = phoneNumber.replace(/\D/g, '');
        
        // Processar número completo DDI+DDD+NUMERO
        if (cleanNumber.length >= 10) {
            // Se tem 13 dígitos, extrair DDI
            if (cleanNumber.length === 13) {
                ddi = cleanNumber.substring(0, 2);
                ddd = cleanNumber.substring(2, 4);
                const restOfNumber = cleanNumber.substring(4);
                
                if (restOfNumber.length === 9) {
                    phone = restOfNumber.substring(0, 5) + '-' + restOfNumber.substring(5);
                } else if (restOfNumber.length === 8) {
                    phone = restOfNumber.substring(0, 4) + '-' + restOfNumber.substring(4);
                } else {
                    phone = restOfNumber;
                }
            }
            // Se tem 11 dígitos, assumir DDD+NUMERO (sem DDI)
            else if (cleanNumber.length === 11) {
                ddi = '55';
                ddd = cleanNumber.substring(0, 2);
                const restOfNumber = cleanNumber.substring(2);
                
                if (restOfNumber.length === 9) {
                    phone = restOfNumber.substring(0, 5) + '-' + restOfNumber.substring(5);
                } else {
                    phone = restOfNumber;
                }
            }
            // Se tem 10 dígitos, assumir DDD+NUMERO (8 dígitos)
            else if (cleanNumber.length === 10) {
                ddi = '55';
                ddd = cleanNumber.substring(0, 2);
                const restOfNumber = cleanNumber.substring(2);
                phone = restOfNumber.substring(0, 4) + '-' + restOfNumber.substring(4);
            }
        } else {
            // Fallback para formato já formatado (XX) XXXXX-XXXX
            let match = phoneNumber.match(/\((\d{2})\)\s*(.+)/);
            if (match) {
                ddi = '55';
                ddd = match[1];
                phone = match[2].trim();
            }
        }

        return { ddi, ddd, phone };
    }

    /**
     * Combina DDI, DDD e número em um número completo
     * @param {string} ddi - Código do país
     * @param {string} ddd - Código da área
     * @param {string} phone - Número do telefone
     * @returns {string} Número completo
     */
    static combineComponents(ddi, ddd, phone) {
        if (!ddd || !phone) return '';
        
        const cleanDdi = (ddi || '55').replace(/\D/g, '');
        const cleanDdd = ddd.replace(/\D/g, '');
        const cleanPhone = phone.replace(/\D/g, '');
        
        return `${cleanDdi}${cleanDdd}${cleanPhone}`;
    }
}

window.PhoneUtils = PhoneUtils;