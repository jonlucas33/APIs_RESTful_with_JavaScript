# 🍽️ Front-end - Restaurante API

Interface React que se comunica com a API RESTful do restaurante.

## 🚀 Como Rodar

### Pré-requisitos
- Node.js instalado
- Back-end rodando em `http://localhost:4000`

### Passos

1. **Instalar dependências** (se ainda não fez):
```bash
npm install
```

2. **Iniciar o servidor de desenvolvimento**:
```bash
npm run dev
```

3. **Abrir no navegador**:
O Vite mostrará a URL (geralmente `http://localhost:5173`)

## 📁 Estrutura do Projeto

```
/frontend
  /src
    /components
      - PainelCozinha.jsx  ← Painel que lista pedidos
    /services
      - api.js             ← Comunicação com o back-end
    - App.jsx              ← Componente principal
    - App.css              ← Estilos
    - main.jsx             ← Ponto de entrada
```

## 🔗 Conexão com o Back-end

O front-end se comunica com o back-end através do arquivo `src/services/api.js`:

- **Base URL**: `http://localhost:4000/api`
- **Endpoints usados**: 
  - `GET /cardapio` - Buscar cardápio
  - `POST /comandas` - Criar novo pedido
  - `GET /comandas` - Listar todos os pedidos

## 🎨 Funcionalidades Implementadas

### Passo 2.1 - Leitura
- ✅ Buscar e exibir cardápio completo
- ✅ Loading state (carregando...)
- ✅ Error handling (se o back-end não responder)
- ✅ Design responsivo
- ✅ Efeitos hover nos cards

### Passo 2.2 - Criação de Pedidos
- ✅ Adicionar itens ao carrinho (comanda)
- ✅ Exibir carrinho com itens selecionados
- ✅ Calcular total do pedido automaticamente
- ✅ Enviar pedido para o back-end (POST)
- ✅ Limpar carrinho após pedido bem-sucedido
- ✅ Validação de carrinho vazio
- ✅ Feedback visual com alertas

### Passo 2.3 - Painel da Cozinha (Novo!)
- ✅ Listar todos os pedidos feitos
- ✅ Atualização automática ao fazer novo pedido
- ✅ Exibição de detalhes (número, mesa, status, itens, total, data)
- ✅ Design escuro para simular painel da cozinha
- ✅ Grid responsivo de pedidos
- ✅ Scroll customizado para lista de pedidos

### Passo 3.1 - Botões de Status (Novo!)
- ✅ Função updateComandaStatus integrada com endpoint PATCH
- ✅ Botões de ação condicionais:
  - "Marcar 'Em Preparo'" - Visível quando status = "pendente"
  - "Marcar 'Concluído'" - Visível quando status = "Em Preparo"
  - "Pedido Finalizado!" - Mensagem quando status = "Concluído"
- ✅ Atualização instantânea do estado local (sem novo GET)
- ✅ Feedback visual com cores dinâmicas:
  - Pendente = Amarelo/Laranja
  - Em Preparo = Azul
  - Concluído = Verde
- ✅ Cada pedido pode ter status independente

### Passo 4.1 - Botão de Cancelar (Novo!)
- ✅ Função deleteComanda integrada com endpoint DELETE
- ✅ Botão "Cancelar Pedido" (vermelho)
- ✅ Janela de confirmação antes de deletar (window.confirm)
- ✅ Atualização instantânea com filter() (sem novo GET)
- ✅ Proteção: botão não aparece em pedidos "Concluído"
- ✅ Feedback com alert de sucesso
- ✅ **CRUD completo no front-end**

## 🔧 Tecnologias

- **React** - Biblioteca UI
- **Vite** - Build tool e dev server
- **Axios** - Cliente HTTP
- **CSS3** - Estilização com gradientes e animações

## 🐛 Troubleshooting

### Erro: "A Cozinha (Back-end) não respondeu"

**Solução:**
1. Verifique se o back-end está rodando:
   ```bash
   cd ../backend
   npm run dev
   ```
2. Confirme que o servidor está em `http://localhost:4000`
3. Verifique o console do navegador (F12) para mais detalhes

### CORS Error

Se você ver erro de CORS no console, verifique se o back-end tem o middleware `cors()` configurado em `app.js`.

## 📝 Próximos Passos (Passo 2.4)

- [ ] Adicionar botão para atualizar status do pedido (pendente → preparando → pronto)
- [ ] Adicionar campo para escolher número da mesa dinamicamente
- [ ] Implementar botão para remover itens do carrinho
- [ ] Adicionar filtros no cardápio (por preço, tipo)
- [ ] Implementar busca de itens do cardápio
- [ ] Adicionar notificações/toasts em vez de alertas

## 👨‍💻 Desenvolvimento

Para adicionar novas funcionalidades:

1. **Adicione a função no serviço** (`src/services/api.js`)
2. **Use a função no componente** (com `useState` e `useEffect`)
3. **Estilize no CSS** (`src/App.css`)
