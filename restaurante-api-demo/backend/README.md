# 🍽️ API RESTful Didática - Restaurante

Projeto didático full-stack que simula operações de um restaurante através de uma API RESTful.

## 📁 Estrutura do Projeto

```
/restaurante-api-demo
  /backend           ← Passo 1 - Concluído
  /frontend          ← Será implementado no Passo 2
```

---

## 🎯 Passo 1: Back-end (Concluído) ✅

### 🛠️ Tecnologias

- **Node.js** - Runtime JavaScript
- **Express** - Framework web minimalista
- **CORS** - Permite conexão entre front-end e back-end
- **Nodemon** - Reinicia automaticamente o servidor durante desenvolvimento

### 📂 Estrutura do Back-end

```
/backend
  /src
    /controllers        ← "Chefes de Cozinha" (lógica de negócio)
      - cardapio.controller.js
      - comandas.controller.js
    /routes            ← "Livro de Pedidos" (endpoints)
      - api.routes.js
    /services          ← "Banco de Dados" temporário
      - database.js
  - server.js          ← Arquivo principal do servidor
  - package.json
```

---

## 🚀 Como Rodar o Back-end

### 1. Instalar Dependências

```bash
cd backend
npm install
```

### 2. Iniciar o Servidor

```bash
npm run dev
```

O servidor estará rodando em: **http://localhost:4000**

---

## 📡 Endpoints da API

### 🏠 Rota Raiz
- **GET** `/` - Informações sobre a API

### 📋 Cardápio
- **GET** `/api/cardapio` - Retorna todos os itens do menu
- **GET** `/api/cardapio/:id` - Retorna um item específico

### 📝 Comandas (Pedidos)
- **GET** `/api/comandas` - Lista todas as comandas
- **POST** `/api/comandas` - Cria uma nova comanda
- **PATCH** `/api/comandas/:id` - Atualiza o status de uma comanda
- **DELETE** `/api/comandas/:id` - Deleta uma comanda

---

## 🧪 Testando a API

### Usando o Navegador
Acesse: `http://localhost:4000/api/cardapio`

### Usando cURL

**1. Ver o Cardápio:**
```bash
curl http://localhost:4000/api/cardapio
```

**2. Criar uma Comanda:**
```bash
curl -X POST http://localhost:4000/api/comandas \
  -H "Content-Type: application/json" \
  -d "{\"mesa\":\"Mesa 5\",\"itens\":[1,2],\"total\":33.00}"
```

---

## 📊 Formato dos Dados

### Cardápio (Resposta do GET)
```json
{
  "sucesso": true,
  "mensagem": "Cardápio recuperado com sucesso",
  "dados": [
    {
      "id": 1,
      "nome": "Prato Feito",
      "preco": 25.00,
      "descricao": "Arroz, feijão, bife e salada"
    }
  ]
}
```

### Criar Comanda (Body do POST)
```json
{
  "mesa": "Mesa 5",
  "itens": [1, 2],
  "total": 33.00
}
```

### Comanda Criada (Resposta)
```json
{
  "sucesso": true,
  "mensagem": "Comanda criada com sucesso",
  "dados": {
    "id": 1,
    "mesa": "Mesa 5",
    "itens": [1, 2],
    "total": 33.00,
    "status": "pendente",
    "dataPedido": "2025-11-16T10:30:00.000Z"
  }
}
```

---

## 🎓 Conceitos Didáticos

### 🔄 O que é uma API RESTful?
Uma interface que permite comunicação entre sistemas usando HTTP e princípios REST (URLs lógicas, verbos HTTP, JSON).

### 📦 Arquitetura MVC Simplificada

- **Model** (database.js) - Dados
- **Controller** (cardapio/comandas.controller.js) - Lógica
- **Routes** (api.routes.js) - Mapeamento de URLs

### 🌐 CORS (Cross-Origin Resource Sharing)
Permite que o front-end (porta 3000) se comunique com o back-end (porta 4000).

### 🔄 Express Middlewares

1. **cors()** - Habilita CORS
2. **express.json()** - Interpreta JSON no corpo das requisições

---

## 📝 Próximos Passos (Passo 2)

- [ ] Criar o Front-end (interface visual)
- [ ] Conectar Front-end com esta API
- [ ] Implementar interface para visualizar cardápio
- [ ] Implementar interface para fazer pedidos

---

