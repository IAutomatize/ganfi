# 📊 Ganfi Admin - Sistema de Administração

Sistema de administração web para gerenciamento de clientes da empresa Grupo Ganfi, focado no controle de acesso ao assistente tributário via WhatsApp.

## 🚀 Funcionalidades

### 🔐 **Sistema de Login**
- **Email**: `adminganfi@gmail.com`
- **Senha**: `ganfiadmin*`
- **Sessão persistente**: Mantém login após fechar o navegador
- **Logout seguro**: Limpa sessão e redireciona para login

### 👥 **Gestão de Clientes**
- **Cadastro de clientes** com validação completa
- **Edição** de dados existentes
- **Exclusão** com confirmação de segurança
- **Busca inteligente** por nome, número ou status
- **Listagem responsiva** em tabela moderna

### 📱 **Números Autorizados**
- **Múltiplos números** por cliente
- **Validação de DDD** (2 dígitos obrigatórios)
- **Validação de telefone** (8 ou 9 dígitos)
- **Máscaras automáticas** de formatação
- **Adição/remoção dinâmica** de números

### 💳 **Controle de Pagamentos**
- **Status de pagamento**:
  - 🟢 Pagamento em Dia
  - 🟡 Pagamento Pendente  
  - 🔴 Pagamento Atrasado
- **Dia de vencimento** (1-31 do mês)
- **Atualização automática** de status baseada na data
- **Indicadores visuais** na tabela

### 📊 **Dashboard e Estatísticas**
- **Cards informativos** com contadores
- **Estatísticas em tempo real**
- **Interface responsiva** para mobile
- **Notificações visuais** para ações do usuário

## 🌐 **Integração com API**

### 📡 **Webhook de Sincronização**
**Endpoint**: `https://requisicao.grupoganfi.com/webhook/50e63045-e679-4ad3-b496-a6700f4c9917`

**Eventos enviados**:
```json
{
  "evento": "novo_cliente" | "cliente_atualizado" | "cliente_excluido",
  "cliente": {
    "id": 123456789,
    "nome": "Nome do Cliente",
    "numerosAutorizados": ["(11) 99999-9999"],
    "statusPagamento": "paid" | "pending" | "overdue",
    "diaVencimento": 15,
    "criadoEm": "2025-09-25T10:30:00.000Z",
    "atualizadoEm": "2025-09-25T10:30:00.000Z"
  },
  "timestamp": "2025-09-25T10:30:00.000Z",
  "origem": "ganfi-admin-web"
}
```

### 📥 **Carregamento de Dados**
**Endpoint**: `https://requisicao.grupoganfi.com/webhook/0f8b0045-4bc7-40e0-b902-bd7d2d6c26cf`

**Método**: GET
**Response esperado**:
```json
[
  {
    "id_contato": 11,
    "nome": "Nome Cliente",
    "numero_telefone": null,
    "email": null,
    "data_qualificacao": null,
    "data_criacao": "2025-09-25T15:27:30.997Z",
    "cpf": null,
    "status": "paid",
    "numeros_autorizados": ["(15) 99171-6525"]
  }
]
```

## ⚡ **Recursos Avançados**

### 🔄 **Auto-Refresh**
- **Frequência**: A cada 30 segundos
- **Inteligente**: Só atualiza quando logado e dashboard visível
- **Silencioso**: Não interrompe o usuário
- **Manual**: Botão "Atualizar" disponível

### 💾 **Cache Local**
- **LocalStorage**: Backup dos dados no navegador
- **Fallback**: Usa cache se API estiver indisponível
- **Sincronização**: Sempre prioriza dados do servidor

### 🔔 **Sistema de Notificações**
- **Tipos**: Sucesso, Info, Warning
- **Auto-dismiss**: Remove após 3 segundos
- **Animações**: Slide in/out suaves
- **Posicionamento**: Canto superior direito

## 🎨 **Interface e Design**

### 🎯 **Características**
- **Design moderno**: Visual limpo e profissional
- **Responsivo**: Adapta-se a qualquer dispositivo
- **Acessível**: Contraste adequado e navegação por teclado
- **Intuitivo**: Fluxo de navegação natural

### 🎨 **Paleta de Cores**
- **Primária**: Gradiente azul/roxo (#667eea → #764ba2)
- **Sucesso**: Verde (#27ae60)
- **Warning**: Laranja (#f39c12)  
- **Erro**: Vermelho (#e74c3c)
- **Info**: Azul (#3498db)

### 📱 **Componentes Personalizados**
- **Selects modernos**: Com setas SVG customizadas
- **Inputs responsivos**: Bordas arredondadas e focus states
- **Botões**: Gradientes e efeitos hover
- **Modais**: Overlay com blur e animações

## 🛠️ **Tecnologias Utilizadas**

### 📋 **Frontend**
- **HTML5**: Semântico e estruturado
- **CSS3**: Grid, Flexbox, animações
- **JavaScript ES6+**: Modular e assíncrono
- **Font Awesome**: Ícones vetoriais

### 🔧 **Funcionalidades JS**
- **Fetch API**: Requisições HTTP assíncronas
- **LocalStorage**: Persistência de dados
- **Event Listeners**: Interatividade completa
- **Async/Await**: Programação assíncrona moderna

## 📁 **Estrutura de Arquivos**

```
ganfi-admin/
├── index.html          # Página principal
├── styles.css          # Estilos CSS
├── script.js           # Lógica JavaScript  
└── README.md           # Esta documentação
```

## 🚀 **Como Usar**

### 1️⃣ **Instalação**
```bash
# Clone o repositório
git clone https://github.com/IAutomatize/ganfi.git

# Abra o arquivo no navegador
open index.html
```

### 2️⃣ **Login**
1. Acesse `index.html` no navegador
2. Use as credenciais:
   - **Email**: `adminganfi@gmail.com`
   - **Senha**: `ganfiadmin*`

### 3️⃣ **Gestão de Clientes**
1. **Adicionar**: Clique em "Novo Cliente"
2. **Editar**: Clique no botão "Editar" na tabela
3. **Excluir**: Clique em "Excluir" e confirme
4. **Buscar**: Use a barra de pesquisa

### 4️⃣ **Atualização Manual**
- Clique em "Atualizar" para sincronizar com o servidor

## 🔍 **Validações e Regras de Negócio**

### 📞 **Números de Telefone**
- **DDD**: Exatamente 2 dígitos
- **Número**: 8 ou 9 dígitos
- **Formato**: (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
- **Múltiplos**: Cliente pode ter vários números

### 📅 **Vencimento**
- **Dia**: 1 a 31 do mês
- **Renovação**: Automática todo mês no mesmo dia
- **Status**: Atualizado automaticamente baseado na data

### ✅ **Campos Obrigatórios**
- Nome do cliente
- Pelo menos um número autorizado
- Status do pagamento
- Dia de vencimento

## 🛡️ **Segurança e Tratamento de Erros**

### 🔒 **Segurança**
- **Validação client-side**: Previne dados inválidos
- **Sanitização**: Limpeza de inputs
- **Sessão segura**: Logout automático

### 🚨 **Tratamento de Erros**
- **API indisponível**: Fallback para cache local
- **Dados inválidos**: Mensagens de erro claras
- **Timeout**: Notificação de problemas de conexão
- **Logs**: Console detalhado para debug

## 📊 **Monitoramento e Debug**

### 🔍 **Logs do Console**
- **Sucesso**: Operações bem-sucedidas
- **Erros**: Falhas de API e validação
- **Debug**: Informações de desenvolvimento

### 📈 **Métricas**
- **Estatísticas**: Contadores em tempo real
- **Performance**: Tempos de resposta
- **Uso**: Ações do usuário

## 🔄 **Fluxo de Dados**

### 📥 **Carregamento Inicial**
1. Login do usuário
2. Requisição GET para buscar clientes
3. Mapeamento de dados (formato DB → formato interno)
4. Renderização da tabela e estatísticas

### 📤 **Operações CRUD**
1. **Criar/Editar/Excluir** cliente
2. **Enviar webhook** com dados da operação
3. **Aguardar 1 segundo** (processamento no servidor)
4. **Recarregar dados** do servidor
5. **Atualizar interface**

### 🔄 **Auto-Refresh**
1. **Timer de 30 segundos**
2. **Verificar se usuário está logado**
3. **Requisição silenciosa** ao servidor
4. **Atualização automática** da interface

## 🎯 **Casos de Uso**

### 👤 **Administrador**
- Controla acesso ao assistente tributário
- Gerencia status de pagamento dos clientes
- Monitora vencimentos mensais
- Autoriza números de WhatsApp

### 🤖 **Sistema Automatizado**
- Recebe webhooks das operações
- Sincroniza dados em tempo real
- Valida números autorizados
- Controla acesso baseado no status

## 📚 **Considerações Técnicas**

### ⚡ **Performance**
- **Cache inteligente**: Reduz requisições desnecessárias
- **Debounce**: Busca otimizada com delay
- **Lazy loading**: Carregamento sob demanda

### 🌐 **Compatibilidade**
- **Browsers modernos**: Chrome, Firefox, Safari, Edge
- **Mobile**: Totalmente responsivo
- **PWA-ready**: Pode ser convertido em app

### 🔧 **Manutenção**
- **Código modular**: Fácil de manter
- **Comentários**: Documentação inline
- **Padrões**: ES6+ e boas práticas

## 🚀 **Possíveis Melhorias Futuras**

### 📈 **Funcionalidades**
- [ ] Relatórios de pagamento
- [ ] Exportação de dados (CSV, PDF)
- [ ] Histórico de alterações
- [ ] Backup automático
- [ ] Multi-usuários com permissões

### 🎨 **Interface**
- [ ] Tema escuro
- [ ] Customização de cores
- [ ] Atalhos de teclado
- [ ] Drag & drop
- [ ] Filtros avançados

### 🔧 **Técnicas**
- [ ] Service Workers (offline)
- [ ] WebSockets (real-time)
- [ ] Compressão de dados
- [ ] Criptografia adicional
- [ ] Testes automatizados

---

## 👨‍💻 **Desenvolvido por**

**Grupo Ganfi** - Sistema de Administração de Clientes
**Versão**: 1.0.0
**Data**: Setembro 2025

---

*Este sistema foi desenvolvido especificamente para o controle de acesso ao assistente tributário do Grupo Ganfi via WhatsApp.*