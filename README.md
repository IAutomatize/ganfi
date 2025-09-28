# Grupo Ganfi - Sistema de Assessoria Tributária

Sistema web modular para gerenciamento de clientes da assessoria tributária via WhatsApp. Arquitetura escalável com módulos organizados para facilitar manutenção e expansão.

## Arquitetura do Sistema

### Estrutura de Arquivos Organizada
```
ganfi-admin/
├── assessoria-tributaria.html              # Interface principal da assessoria
├── css/
│   ├── common.css                          # Estilos base e componentes reutilizáveis
│   └── assessoria-tributaria.css           # Estilos específicos da assessoria
├── js/
│   ├── assessoria-tributaria.js            # Aplicação principal e orquestração
│   ├── services/
│   │   └── api.js                          # Serviços de comunicação com API
│   ├── modules/
│   │   ├── auth.js                         # Módulo de autenticação
│   │   ├── navigation.js                   # Módulo de navegação
│   │   └── clients.js                      # Módulo de gestão de clientes
│   └── utils/
│       ├── date-utils.js                   # Utilitários para datas
│       ├── phone-utils.js                  # Utilitários para telefones
│       └── ui-utils.js                     # Utilitários para interface
├── script.js.backup                        # Backup do script monolítico original
└── README.md                               # Documentação técnica
```

### Tecnologias e Padrões
- **Frontend**: HTML5, CSS3, JavaScript ES6+ modular
- **API**: Fetch API com classes de serviço organizadas  
- **Arquitetura**: Módulos isolados com responsabilidades únicas
- **Storage**: Database-first (localStorage apenas para sessão)
- **Icons**: Font Awesome CDN
- **CSS**: Variáveis CSS customizadas e sistema de design reutilizável

## Benefícios da Nova Arquitetura

### Escalabilidade
- **Módulos Independentes**: Cada funcionalidade em arquivo separado
- **Reutilização**: CSS comum para múltiplas páginas
- **Extensibilidade**: Fácil adição de novos módulos e páginas

### Manutenibilidade  
- **Separação de Responsabilidades**: Auth, Navegação, Clientes em módulos distintos
- **Código Limpo**: Utilitários organizados por função (datas, telefones, UI)
- **Debugging Simplificado**: Erros isolados por módulo

### Performance
- **Carregamento Modular**: Scripts carregados conforme necessidade
- **Cache Otimizado**: CSS comum cacheable entre páginas
- **Inicialização Inteligente**: Módulos inicializados de forma assíncrona

### Compatibilidade GitHub Pages
- **Arquivos Estáticos**: Somente HTML, CSS e JavaScript puro
- **Sem Dependências**: Não requer Node.js, TypeScript ou build tools
- **Deploy Simples**: Push direto para GitHub Pages funciona

## Credenciais de Acesso
- **Email**: `adminganfi@gmail.com`
- **Senha**: `ganfiadmin*`

## Integração com API

### Endpoint de Leitura (GET)
```
URL: https://requisicao.grupoganfi.com/webhook/0f8b0045-4bc7-40e0-b902-bd7d2d6c26cf
Método: GET
```

**Formato de Resposta do Banco**:
```json
[
  {
    "id_contato": 11,
    "nome": "Nome Cliente", 
    "status": "paid|pending|overdue",
    "numeros_autorizados": ["(15) 99171-6525", "1599171-6525"],
    "data_vencimento": "2025-10-15T03:00:00.000Z"
  }
]
```

### Endpoint de Escrita (POST)
```
URL: https://requisicao.grupoganfi.com/webhook/50e63045-e679-4ad3-b496-a6700f4c9917
Método: POST
```

**Formato de Envio para API**:
```json
{
  "evento": "novo_cliente|cliente_atualizado|cliente_excluido",
  "cliente": {
    "id": 123456789,
    "nome": "Nome do Cliente",
    "numerosAutorizados": ["5511999171625"],
    "statusPagamento": "paid|pending|overdue",
    "diaVencimento": 15,
    "dataVencimento": "2025-10-15T03:00:00.000Z"
  },
  "timestamp": "2025-09-25T10:30:00.000Z",
  "origem": "ganfi-admin-web"
}
```

### Tratamento de Números de Telefone

O sistema separa completamente a **apresentação visual** do **formato de envio**:

**Banco de Dados → Sistema**:
- Recebe: `["(15) 99171-6525", "15 99171-6525", "1599171625"]`
- Processa: Remove formatação, valida estrutura
- Apresenta: `(15) 99171-6525` (formato padronizado)

**Sistema → API**:
- Coleta: `(15) 99171-6525` (formato visual)
- Converte: `5511599171625` (DDI + DDD + Número)
- Envia: String numérica sem formatação

### Funções de Transformação

**Localização**: `script.js` linhas 45-85

```javascript
// Conversão: Visual → API
function formatToWebhook(ddd, numero)     // Linha 45

// Conversão: Banco → Visual  
function formatFromDatabase(numeroCompleto) // Linha 65

// Validação de estrutura
function validarNumero(ddd, numero)       // Linha 85
```

## Mapa de Funcionalidades

### Sistema de Autenticação
**Arquivo**: `script.js` linhas 15-40
```javascript
function checkAuth()           // Linha 15 - Verificação de sessão
function handleLogin()         // Linha 25 - Processo de login  
function logout()              // Linha 35 - Logout e limpeza
```

### Gerenciamento de Clientes
**Arquivo**: `script.js` linhas 100-300

```javascript
function loadClients()         // Linha 100 - Carrega dados da API
function mapDatabaseToClient() // Linha 120 - Converte formato BD → Sistema
function renderClientTable()   // Linha 140 - Renderiza tabela HTML
function searchClients()       // Linha 160 - Filtro de busca
function addClient()           // Linha 180 - Adiciona novo cliente
function editClient()          // Linha 220 - Edição de cliente existente
function deleteClient()        // Linha 260 - Exclusão com confirmação
function populateClientForm()  // Linha 280 - Preenche formulário de edição
function renewClientPayment()  // Linha 300 - Renovação de vencimento (+ 1 mês)
```

### Sistema de Números Telefônicos
**Arquivo**: `script.js` linhas 320-400

```javascript
function addPhoneNumber()      // Linha 320 - Adiciona campo de número
function removePhoneNumber()   // Linha 340 - Remove campo específico
function validatePhoneNumber() // Linha 360 - Validação DDD+Número
function formatPhoneDisplay()  // Linha 380 - Formatar para exibição
```

### Integração com Webhooks  
**Arquivo**: `script.js` linhas 450-520

```javascript
function sendWebhook()              // Linha 450 - Envia eventos para API
function refreshClientsFromServer() // Linha 470 - Atualização do banco (30s)
function loadClientsFromDatabase()  // Linha 490 - Carrega dados do banco
function handleApiError()           // Linha 510 - Tratamento de erros
```

### Interface e Componentes
**Arquivo**: `styles.css` linhas organizadas por seção

```css
/* Componentes Base */
.dashboard-card              /* Linha 50 - Cards do dashboard */
.client-table               /* Linha 120 - Tabela de clientes */  
.modal-overlay              /* Linha 200 - Modais de formulário */
.form-group                 /* Linha 280 - Grupos de campos */
.custom-select              /* Linha 350 - Selects personalizados */
.notification               /* Linha 420 - Sistema de notificações */

/* Layout Responsivo */  
@media (max-width: 768px)   /* Linha 500 - Adaptação mobile */
```

## Fluxograma do Sistema

### Inicialização
```
1. Carregamento da página (index.html)
2. Verificação de autenticação (checkAuth)
3. Se autenticado → Dashboard | Se não → Tela de Login
4. Carregamento inicial de dados (loadClients)
5. Auto-refresh ativado (30s)
```

### Operações CRUD
```
Criar/Editar Cliente:
1. Validação de formulário (validateForm)
2. Formatação de números (formatToWebhook) 
3. Envio para API (sendWebhook)
4. Aguardo processamento (1s delay)
5. Recarregamento de dados (loadClients)
6. Atualização da interface (renderClientTable)

Exclusão:
1. Confirmação do usuário
2. Envio evento "cliente_excluido"
3. Atualização automática
```

### Processamento de Números
```
Entrada do Banco → Sistema:
"(15) 99171-6525" → Regex parsing → Display "(15) 99171-6525"

Sistema → API:
"(15) 99171-6525" → Remove formatação → "1599171625" → Adiciona DDI → "551599171625"
```

### Sistema de Renovação de Vencimento
```
Renovação Manual:
1. Usuário clica em "Renovar" na tabela
2. Sistema adiciona 1 mês à data atual de vencimento
3. Envia webhook "cliente_atualizado" com nova dataVencimento
4. Recarrega dados do servidor
5. Interface atualiza automaticamente

Cálculo de Vencimento:
- Novo Cliente: dataVencimento = próximo mês no dia escolhido
- Renovação: dataVencimento = data atual + 1 mês
- Banco: Retorna data_vencimento em timestamp
- Interface: Mostra "Próximo: DD/MM/AAAA"
```

## Validações e Regras de Negócio

### Números de Telefone
```javascript
// Validação: script.js linha 360
- DDD: 2 dígitos (11-99)
- Número: 8 ou 9 dígitos
- Formato visual: (XX) XXXXX-XXXX | (XX) XXXX-XXXX  
- Formato API: 55XXXXXXXXXXX (DDI + DDD + Número)
```

### Status de Pagamento
```javascript
// Valores permitidos: script.js linha 25
"paid"     → Pago (Verde)
"pending"  → Pendente (Amarelo)  
"overdue"  → Atrasado (Vermelho)
```

### Campos Obrigatórios
```javascript
// Validação: script.js linha 180
- Nome do cliente (string, não vazio)
- Pelo menos 1 número autorizado
- Status de pagamento (enum válido)
- Dia de vencimento (1-31)
```

## Tratamento de Erros

### Tratamento de Falhas
```javascript
// Implementação: script.js linha 490
1. Requisição à API (banco de dados)
2. Se falhar → Array vazio + notificação de erro
3. Sem fallback de cache - sempre dados reais
4. Usuário deve aguardar conexão com banco
```

### Códigos de Resposta
```javascript
// Mapeamento: script.js linha 500
200: Sucesso
404: Endpoint não encontrado  
500: Erro interno do servidor
Network Error: Problema de conectividade
```

## Sincronização com Banco de Dados

### Sistema Real-Time (Sem Cache)
```javascript  
// Timer: script.js linha 470
Intervalo: 30 segundos
Condição: Usuário logado && Dashboard visível
Comportamento: Sempre busca dados direto do banco
Manual: Botão "Atualizar" disponível
Fallback: Nenhum - apenas dados do servidor
```

## Configuração e Deploy

### Requisitos
- Servidor web (Apache, Nginx, ou similar)
- Suporte a arquivos estáticos (HTML, CSS, JS)
- Conexão HTTPS (recomendado para APIs externas)

### Variáveis de Ambiente
```javascript
// Configuração: script.js linhas 5-10
API_READ_ENDPOINT: "https://requisicao.grupoganfi.com/webhook/0f8b0045..."
API_WRITE_ENDPOINT: "https://requisicao.grupoganfi.com/webhook/50e63045..." 
LOGIN_EMAIL: "adminganfi@gmail.com"
LOGIN_PASSWORD: "ganfiadmin*"
```

### Instalação
```bash
# 1. Clone o repositório
git clone https://github.com/IAutomatize/ganfi.git

# 2. Configure servidor web apontando para a pasta
# 3. Acesse via navegador: http://localhost/ganfi-admin
```

---

**Sistema de Administração Grupo Ganfi**  
**Versão**: 1.0.0 | **Arquitetura**: SPA Frontend | **API**: REST Webhooks