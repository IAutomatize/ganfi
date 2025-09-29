# Grupo Ganfi - Sistema de Assessoria Tributária

Sistema web modular para gerenciamento de clientes da assessoria tributária via WhatsApp. Arquitetura escalável com módulos organizados para facilitar manutenção e expansão.

## Arquitetura do Sistema

### Estrutura de Arquivos Atualizada
```
ganfi-admin/
├── assessoria-tributaria.html              # Interface principal da assessoria
├── kanban.html                             # Dashboard Kanban (demo)
├── clientes.html                           # Gestão de clientes (demo)  
├── tarefas.html                            # Sistema de tarefas (demo)
├── css/
│   ├── common.css                          # Estilos base e sidebar consistente
│   ├── assessoria-tributaria.css           # Estilos específicos da assessoria
│   ├── kanban.css                          # Estilos do dashboard Kanban
│   ├── clientes.css                        # Estilos da gestão de clientes
│   └── tarefas.css                         # Estilos do sistema de tarefas
├── js/
│   ├── assessoria-tributaria.js            # Aplicação principal e orquestração
│   ├── services/
│   │   └── api.js                          # Serviços de comunicação webhook
│   ├── modules/
│   │   ├── auth.js                         # Autenticação e sessão
│   │   ├── navigation.js                   # Navegação entre seções
│   │   └── clients.js                      # Gestão completa de clientes
│   └── utils/
│       ├── date-utils.js                   # Formatação e cálculos de datas
│       ├── phone-utils.js                  # Formatação de números telefônicos
│       └── ui-utils.js                     # Notificações e componentes UI
├── script.js.backup                        # Backup do sistema monolítico
├── README.md                               # Documentação principal
└── TECHNICAL.md                            # Documentação técnica detalhada
```

### Tecnologias e Padrões
- **Frontend**: HTML5, CSS3, JavaScript ES6+ modular
- **API**: Webhook REST com auto-refresh (30s) e operações CRUD
- **Arquitetura**: Módulos independentes com inicialização assíncrona
- **Storage**: Database-first com sincronização automática
- **Design**: Glassmorphism moderno com sidebar consistente
- **Icons**: Font Awesome 6.0+ e componentes responsivos

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
Auto-refresh: 30 segundos
```

**Formato de Resposta do Banco**:
```json
[
  {
    "id_contato": 11,
    "nome": "Nome Cliente", 
    "status": "paid|pending|overdue",
    "numeros_autorizados": ["(15) 99171-6525"],
    "data_vencimento": "2025-10-15T03:00:00.000Z",
    "data_criacao": "2025-09-25T15:27:30.997Z",
    "data_qualificacao": null
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

## Arquitetura Modular

### Sistema de Autenticação
**Arquivo**: `js/modules/auth.js`
- Verificação de sessão existente com carregamento automático
- Login/logout com persistência no localStorage
- Eventos personalizados para coordenação entre módulos

### Gestão de Clientes  
**Arquivo**: `js/modules/clients.js`
- CRUD completo com validação de dados
- Auto-refresh com sincronização em tempo real
- Busca/filtro instantâneo e estatísticas automáticas
- Carregamento inteligente: inicial automático + manual sob demanda

### Serviços de API
**Arquivo**: `js/services/api.js`
- Comunicação webhook com tratamento de erros robusto
- Formatação automática de dados (DB ↔ Sistema ↔ API)
- Headers e timeouts configurados para produção

### Utilitários Especializados
**Arquivos**: `js/utils/`
- **phone-utils.js**: Formatação (15) 99171-6525 ↔ 5515991716525
- **date-utils.js**: Cálculos de vencimento e formatação BR
- **ui-utils.js**: Notificações, modais e componentes visuais

### Interface Moderna
**Arquivos CSS**:
- **common.css**: Sidebar padronizada e componentes base
- **assessoria-tributaria.css**: Glassmorphism e layout responsivo

## Fluxos do Sistema

### Inicialização Modular
```
1. AssessoriaTributariaApp.init()
2. Módulos carregados sequencialmente: Auth → Navigation → Clients  
3. Verificação automática de sessão existente
4. Carregamento inteligente: se logado → clientes automáticos
5. Auto-refresh ativo (30s) + manual sob demanda
```

### Operações CRUD Otimizadas
```
Criar/Editar:
1. Validação client-side completa
2. Formatação automática de números
3. Webhook POST com retry automático
4. Sincronização imediata com banco
5. UI atualizada em tempo real

Exclusão:
1. Confirmação modal obrigatória  
2. Webhook "cliente_excluido"
3. Remoção instantânea da interface
```

### Sistema de Vencimentos
```
Novo Cliente: 
- Data calculada automaticamente (próximo mês no dia escolhido)
- Status inicial configurável (paid/pending/overdue)

Renovação:
- +1 mês a partir da data atual de vencimento
- Webhook automático de atualização
- Interface reflete mudanças instantaneamente
```

## Validações e Regras

### Números de Telefone
```javascript
// PhoneUtils.js - Formatação automática
- Input: DDD + Número (validação em tempo real)
- Display: (15) 99171-6525 (formato brasileiro padronizado)
- API: 5515991716525 (DDI 55 + DDD + número limpo)
- Validação: DDD 11-99, Número 8-9 dígitos
```

### Status de Pagamento  
```javascript
// Mapeamento visual automático
"paid"     → "Pagamento em Dia" (badge verde)
"pending"  → "Pagamento Pendente" (badge amarelo)
"overdue"  → "Pagamento Atrasado" (badge vermelho)
```

### Campos Obrigatórios
```javascript
// Validação client-side completa
✓ Nome do cliente (não vazio)
✓ Mínimo 1 número autorizado (formato válido)  
✓ Status de pagamento (enum)
✓ Dia de vencimento (1-31)
```

## Sistema de Sincronização

### Auto-Refresh Inteligente
```javascript
// ClientsModule - Timer otimizado
✓ Intervalo: 30 segundos (configurável)
✓ Condição: Dashboard ativo + usuário logado
✓ Silencioso: Sem notificações excessivas  
✓ Manual: Botão "Atualizar" sempre disponível
✓ Carregamento inicial: Automático após F5/login
```

### Tratamento de Erros Robusto
```javascript
// ApiService - Recuperação automática
✓ Retry automático em falhas temporárias
✓ Notificações contextuais (sucesso/erro/warning)
✓ Fallback: Interface mantém dados anteriores
✓ Logs estruturados para debugging
```

## Configuração e Deploy

### Tecnologia Stack
- **Frontend**: HTML5 + CSS3 + JavaScript ES6+ puro
- **Deploy**: GitHub Pages ready (arquivos estáticos)
- **APIs**: Webhook REST com HTTPS obrigatório
- **Compatibilidade**: Chrome 80+, Firefox 75+, Safari 13+

### Configurações Centralizadas
```javascript
// js/modules/auth.js + js/services/api.js
✓ Endpoints webhook configurados
✓ Credenciais de login hardcoded (seguras para demo)
✓ Timeouts e headers otimizados  
✓ Auto-refresh configurável (30s padrão)
```

### Deploy Simples
```bash
# GitHub Pages - Deploy automático
git push origin main
# → Disponível em: https://iautomatize.github.io/ganfi/

# Localhost - Desenvolvimento
python -m http.server 8080
# → Acesse: http://localhost:8080/assessoria-tributaria.html
```

## Status Atual

### ✅ Funcionalidades Implementadas
- **Autenticação**: Login/logout com sessão persistente
- **Gestão de Clientes**: CRUD completo com webhooks
- **Sincronização**: Auto-refresh + manual sob demanda  
- **Interface**: Design moderno responsivo com glassmorphism
- **Validação**: Client-side completa com formatação automática
- **Navegação**: Sidebar consistente entre páginas

### 🔧 Correções Aplicadas
- **Carregamento inicial**: Clientes carregam automaticamente após F5
- **Timing de inicialização**: Módulos coordenados corretamente
- **Sidebar padronizada**: Layout consistente em todas as páginas
- **Event listeners**: Fluxo de eventos otimizado entre módulos

---

**Ganfi Admin System v1.1.0**  
**Arquitetura Modular** • **Webhook Integration** • **Real-time Sync**