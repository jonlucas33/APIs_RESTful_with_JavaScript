# 🍽️ API RESTful Didática - Restaurante (Full-Stack)

Projeto didático completo que simula operações de um restaurante através de uma API RESTful, demonstrando a conexão entre Back-end e Front-end.

## 📁 Estrutura do Projeto

```
/restaurante-api-demo
  /backend          ← API RESTful com Node.js + Express (Porta 4000)
  /frontend         ← Interface React + Vite (Porta 5173)
```

## 🎯 Objetivos Didáticos

Este projeto demonstra:
- ✅ Criação de API RESTful com Node.js e Express
- ✅ Testes automatizados com Jest e Supertest (TDD)
- ✅ Front-end React consumindo a API
- ✅ Comunicação HTTP (GET, POST)
- ✅ Estados de Loading e Error Handling
- ✅ Padrão de projeto (Services, Controllers, Routes)

## 🚀 Como Rodar o Projeto Completo

### Pré-requisitos
- Node.js instalado (versão 16+)

### 1️⃣ Iniciar o Back-end (Terminal 1)

```bash
cd backend
npm install
npm run dev
```

O servidor estará rodando em: `http://localhost:4000`

### 2️⃣ Iniciar o Front-end (Terminal 2)

```bash
cd frontend
npm install
npm run dev
```

O front-end estará disponível em: `http://localhost:5173`

### 3️⃣ Acessar a Aplicação

Abra o navegador em `http://localhost:5173` e você verá o cardápio sendo exibido!

## 📡 Endpoints da API (Back-end)

| Método | Endpoint | Descrição |
|--------|----------|--------|
| GET | `/api/cardapio` | Retorna todo o cardápio |
| GET | `/api/cardapio/:id` | Retorna um item específico |
| GET | `/api/comandas` | Lista todas as comandas |
| POST | `/api/comandas` | Cria uma nova comanda |
| PATCH | `/api/comandas/:id` | Atualiza o status de uma comanda |
| DELETE | `/api/comandas/:id` | Deleta uma comanda |

## 🧪 Testando a API

O back-end possui testes automatizados com Jest:

```bash
cd backend
npm test
```

**Resultado esperado:** 13 testes passando ✅

## 🛠️ Tecnologias

### Back-end
- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **CORS** - Habilita comunicação entre portas diferentes
- **Jest** - Framework de testes
- **Supertest** - Testes de API HTTP

### Front-end
- **React** - Biblioteca UI
- **Vite** - Build tool moderna
- **Axios** - Cliente HTTP
- **CSS3** - Estilização moderna

## 📚 Etapas do Projeto

### ✅ Passo 1: Back-end (API REST)
- Estrutura de pastas (MVC simplificado)
- Rotas RESTful
- Controladores
- "Banco de dados" em memória

### ✅ Passo 1.5: Testes (TDD)
- Configuração Jest + Supertest
- Refatoração para testabilidade
- Testes de regressão
- Ciclo TDD (Red → Green) para novo endpoint

### ✅ Passo 2.1: Front-end (Leitura)
- Configuração React + Vite
- Serviço de API (Axios)
- Componente de exibição do cardápio
- Estados de Loading e Error

### ✅ Passo 2.2: Front-end (Criação de Pedidos)
- Estado de comanda (carrinho)
- Botões para adicionar itens ao carrinho
- Exibição da comanda com total calculado
- Função POST para enviar pedidos
- Limpeza do carrinho após envio
- Validações e feedback ao usuário

### ✅ Passo 2.3: Front-end (Painel da Cozinha)
- Componente PainelCozinha para listar pedidos
- Atualização automática via prop refreshTrigger
- Exibição de todos os detalhes do pedido
- Design escuro para simular ambiente de cozinha
- Grid responsivo com scroll customizado

### ✅ Passo 3.0: Back-end (TDD - Update de Comandas) - Completo!
- Testes escritos primeiro (Fase RED)
- Endpoint PATCH /api/comandas/:id implementado
- Função updateComandaStatus no controlador
- Todos os testes passando (Fase GREEN)
- Validação de dados e erro 404
- 10 testes no total (3 novos)

### ✅ Passo 3.1: Front-end (Botões de Status) - Completo!
- Função updateComandaStatus no serviço de API
- Handler handleMudarStatus no componente PainelCozinha
- Botões condicionais baseados no status atual
- Atualização instantânea da UI (sem novo GET)
- Estilos dinâmicos com cores por status
- Renderização condicional (pendente → Em Preparo → Concluído)

### ✅ Passo 4.0: Back-end (TDD - Delete de Comandas) - Completo!
- Testes escritos primeiro (Fase RED)
- Endpoint DELETE /api/comandas/:id implementado
- Função deleteComanda no controlador
- Todos os testes passando (Fase GREEN)
- Validação de existência e erro 404
- 13 testes no total (3 novos para DELETE)

### ✅ Passo 4.1: Front-end (Botão de Delete) - Completo!
- Função deleteComanda no serviço de API
- Handler handleCancelarPedido com confirmação
- Botão "Cancelar Pedido" (vermelho) no painel
- Janela de confirmação (window.confirm)
- Atualização instantânea com filter()
- Proteção: botão não aparece em pedidos "Concluído"

### 🎉 Projeto Completo!
- CRUD full-stack implementado
- Testes automatizados (13 no back-end)
- Interface completa e funcional
- Pronto para demonstração e extensões futuras

## 🔗 Fluxo de Comunicação

```
┌─────────────┐                    ┌─────────────┐
│  Front-end  │    HTTP Request    │  Back-end   │
│  (React)    │ ──────────────────>│  (Express)  │
│  :5173      │                    │  :4000      │
│             │<────────────────── │             │
└─────────────┘    JSON Response   └─────────────┘
```

1. **Front-end** faz requisição GET para `http://localhost:4000/api/cardapio`
2. **Back-end** recebe, processa e retorna JSON
3. **Front-end** atualiza a interface com os dados

## 🎓 Conceitos Aprendidos

- **API RESTful**: Princípios REST, verbos HTTP, status codes
- **Async/Await**: Programação assíncrona em JavaScript
- **React Hooks**: useState, useEffect
- **TDD**: Test-Driven Development (Red → Green → Refactor)
- **Separation of Concerns**: Organização em camadas
- **CORS**: Cross-Origin Resource Sharing
- **Error Handling**: Tratamento de erros no front e back

## 🐛 Troubleshooting

### Front-end não conecta ao back-end

1. Verifique se o back-end está rodando em `http://localhost:4000`
2. Abra o console do navegador (F12) para ver erros
3. Confirme que o CORS está habilitado no back-end

### Testes falhando

1. Certifique-se de estar na pasta `backend`
2. Execute `npm install` novamente
3. Verifique se não há outro processo usando a porta 4000

## 📖 Documentação Detalhada

- [Back-end README](./backend/README.md)
- [Front-end README](./frontend/README.md)

## 👨‍💻 Autor

Projeto didático para ensino de desenvolvimento Full-Stack com JavaScript.

---

**🎯 Próximo Passo:** Implementar o formulário de pedidos no front-end (Passo 2.2)
