/**
 * Serviço de API para comunicação com o backend
 * Gerencia todas as requisições HTTP e endpoints
 */

class ApiService {
    constructor() {
        this.baseUrl = 'https://requisicao.grupoganfi.com/webhook';
        this.readEndpoint = '0f8b0045-4bc7-40e0-b902-bd7d2d6c26cf';
        this.writeEndpoint = 'b4bd72da-f55e-4f5d-bee7-f453ea263428';
        this.headers = {
            'Content-Type': 'application/json',
            'User-Agent': 'Ganfi-Admin/1.0'
        };
    }

    /**
     * Carrega clientes do banco de dados
     * @returns {Promise<Array>} Lista de clientes
     */
    async loadClients() {
        try {
            const response = await fetch(`${this.baseUrl}/${this.readEndpoint}`, {
                method: 'GET',
                headers: this.headers
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Erro ao carregar clientes:', error);
            throw error;
        }
    }

    /**
     * Salva ou atualiza um cliente
     * @param {Object} clientData - Dados do cliente
     * @returns {Promise<Object>} Resposta da API
     */
    async saveClient(clientData) {
        try {
            const response = await fetch(`${this.baseUrl}/${this.writeEndpoint}`, {
                method: 'POST',
                headers: this.headers,
                body: JSON.stringify(clientData)
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Erro ao salvar cliente:', error);
            throw error;
        }
    }

    /**
     * Exclui um cliente
     * @param {number} clientId - ID do cliente
     * @returns {Promise<Object>} Resposta da API
     */
    async deleteClient(clientId) {
        try {
            const deleteData = {
                action: 'delete',
                id_contato: clientId
            };

            const response = await fetch(`${this.baseUrl}/${this.writeEndpoint}`, {
                method: 'POST',
                headers: this.headers,
                body: JSON.stringify(deleteData)
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Erro ao excluir cliente:', error);
            throw error;
        }
    }
}

// Exportar instância singleton
window.apiService = new ApiService();