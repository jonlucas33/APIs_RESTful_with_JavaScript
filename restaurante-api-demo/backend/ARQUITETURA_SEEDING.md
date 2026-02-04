# 🎓 ARQUITETURA PROFISSIONAL DE DATA SEEDING

## 📁 Estrutura de Diretórios

```
backend/
└── src/
    ├── seed.js                          ← 🎭 MAESTRO (Orquestrador)
    │
    ├── database/
    │   ├── mocks/                       ← 📦 DADOS BRUTOS (apenas arrays)
    │   │   ├── cardapio.mock.js
    │   │   └── comandas.mock.js
    │   │
    │   └── seeds/                       ← 🌱 LÓGICA DE INSERÇÃO (apenas SQL)
    │       ├── cardapio.seeder.js
    │       └── comandas.seeder.js
    │
    └── services/
        ├── database.js                  ← Conexão Pool (para API)
        └── database_mock.js             ← (LEGADO - pode remover)
```

---

## 🎯 Separação de Responsabilidades

### 📦 Camada 1: MOCKS (Dados Brutos)

**Arquivos:** `mocks/*.mock.js`

**Responsabilidade:**
- Armazenar APENAS dados brutos (arrays de objetos)
- NÃO conhece SQL
- NÃO conhece PostgreSQL
- NÃO faz INSERT

**Exemplo:**
```javascript
// cardapio.mock.js
const cardapioData = [
  { nome: 'Pizza', preco: 40.00, descricao: 'Margherita' }
];
module.exports = cardapioData;
```

**Vantagens:**
- ✅ Pode ser usado em testes unitários (sem banco)
- ✅ Pode ser versionado independentemente
- ✅ Facilita adicionar/remover dados
- ✅ Reutilizável em diferentes contextos

---

### 🌱 Camada 2: SEEDERS (Lógica de Inserção)

**Arquivos:** `seeds/*.seeder.js`

**Responsabilidade:**
- Importar dados dos mocks
- Executar queries SQL (TRUNCATE + INSERT)
- Usar prepared statements ($1, $2)
- NÃO gerenciar transações (recebe client como parâmetro)

**Exemplo:**
```javascript
// cardapio.seeder.js
const cardapioData = require('../mocks/cardapio.mock');

async function seedCardapio(client) {  // ← Recebe client!
  await client.query('TRUNCATE TABLE cardapio RESTART IDENTITY CASCADE');
  
  for (const item of cardapioData) {
    await client.query(
      'INSERT INTO cardapio (nome, preco, descricao) VALUES ($1, $2, $3)',
      [item.nome, item.preco, item.descricao]
    );
  }
}

module.exports = seedCardapio;
```

**Características:**
- ✅ Transaction-aware (usa client, não pool)
- ✅ Seguro contra SQL Injection
- ✅ Isolado e testável
- ✅ Reutilizável em diferentes contextos

---

### 🎭 Camada 3: MAESTRO (Orquestrador)

**Arquivo:** `src/seed.js`

**Responsabilidade:**
- Coordenar TODOS os seeders
- Gerenciar TRANSAÇÕES (BEGIN/COMMIT/ROLLBACK)
- Definir ORDEM de execução
- Validar configurações (.env)
- Tratar erros globalmente

**Fluxo:**
```javascript
// seed.js
const client = await pool.connect();

try {
  await client.query('BEGIN');           // Inicia transação
  
  await seedCardapio(client);            // Seeder 1
  await seedComandas(client);            // Seeder 2
  
  await client.query('COMMIT');          // Confirma tudo
} catch (error) {
  await client.query('ROLLBACK');        // Reverte tudo
}
```

---

## 🔄 Fluxo Completo de Execução

```
┌─────────────────────────────────────────────────────────────┐
│  EXECUÇÃO: npm run seed                                     │
└─────────────────────────────────────────────────────────────┘

ETAPA 1: Validação
├── Verifica variáveis de ambiente (.env)
└── Se faltando → ABORTA com mensagem de erro

ETAPA 2: Conexão
├── Obtém client do Pool
└── Conexão dedicada para a transação

ETAPA 3: BEGIN (Inicia Transação)
├── Todas as operações a partir daqui são TEMPORÁRIAS
└── Nada é gravado no disco ainda

ETAPA 4: Execução dos Seeders (NA ORDEM)
│
├── 🔹 seedCardapio(client)
│   ├── TRUNCATE TABLE cardapio
│   └── INSERT 6 itens
│
└── 🔹 seedComandas(client)
    ├── TRUNCATE TABLE comandas
    └── INSERT 3 comandas

ETAPA 5A: Se SUCESSO → COMMIT
├── Grava TODAS as mudanças no disco
├── Dados são permanentes
└── Exibe mensagem de sucesso

ETAPA 5B: Se ERRO → ROLLBACK
├── REVERTE TODAS as mudanças
├── Banco volta ao estado ANTES do BEGIN
├── Exibe mensagem de erro + dicas
└── Encerra com código 1 (falha)

ETAPA 6: Limpeza
├── Libera o client (client.release())
├── Fecha o pool (pool.end())
└── Encerra processo (process.exit())
```

---

## 🎓 Por Que Esta Arquitetura?

### ❌ Problema: Seeders Soltos

**Modo antigo:**
```bash
node seeds/cardapio.js  # Insere cardápio
node seeds/comandas.js  # ERRO! → cardápio já foi inserido
```

**Problemas:**
1. **Inconsistência:** Se o segundo falhar, o primeiro JÁ foi salvo
2. **Duplicação:** Rodar novamente duplica dados (sem TRUNCATE)
3. **Ordem Manual:** Desenvolvedor precisa lembrar a sequência
4. **Performance:** Abre/fecha conexão para cada script

---

### ✅ Solução: Maestro com Transação

**Modo profissional:**
```bash
npm run seed  # Executa TUDO em uma transação atômica
```

**Vantagens:**
1. **Atomicidade:** Tudo ou nada (ACID)
2. **Ordem Garantida:** Maestro define sequência correta
3. **Rollback Automático:** Erro em qualquer etapa reverte tudo
4. **Performance:** Uma conexão para tudo

---

## 🔒 Conceitos ACID Aplicados

### A - Atomicidade (Tudo ou Nada)

```javascript
// Sem transação (RUIM):
await insertCardapio();  // ✅ Sucesso (SALVO no banco)
await insertComandas();  // ❌ ERRO (cardápio fica órfão!)

// Com transação (BOM):
BEGIN;
  INSERT INTO cardapio...  // ✅ Temporário
  INSERT INTO comandas...  // ❌ ERRO
ROLLBACK;  // Cardápio também é REVERTIDO!
```

---

### C - Consistência (Estado Válido)

```javascript
// Cenário: Comandas referenciam itens do cardápio

// Sem transação:
- Cardápio inserido ✅
- Comandas com IDs [1,2,3] ✅
- Cardápio tem erro e é deletado ❌
- Comandas ficam com IDs inválidos! 💥

// Com transação:
- TUDO inserido ou NADA inserido
- Dados sempre consistentes ✅
```

---

### I - Isolamento (Não Afeta Outros)

```javascript
// Durante a transação:
- Outras conexões NÃO veem os dados temporários
- Apenas quando fizer COMMIT os dados aparecem
- Evita leituras "sujas" de dados parciais
```

---

### D - Durabilidade (Permanente Após COMMIT)

```javascript
// Após COMMIT:
- Dados são gravados no disco físico
- Mesmo se o servidor cair, dados permanecem
- PostgreSQL garante escrita em disco
```

---

## 🚀 Como Usar

### Executar Seed Completo

```bash
cd backend/
npm run seed
```

**Saída esperada:**
```
🌱 INICIANDO PROCESSO DE SEEDING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔄 Iniciando transação SQL (BEGIN)...

   📋 Populando tabela: cardapio...
      🧹 Tabela limpa
      ✅ 6 itens inseridos no cardápio

   📝 Populando tabela: comandas...
      🧹 Tabela limpa
      ✅ 3 comandas inseridas

✅ Todos os seeders executados com sucesso!
💾 Fazendo COMMIT da transação...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎉 SEEDING CONCLUÍDO COM SUCESSO!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

👋 Conexão com o banco encerrada.
```

---

### Adicionar Novo Seeder

**Passo 1:** Criar mock de dados
```javascript
// src/database/mocks/usuarios.mock.js
const usuariosData = [
  { nome: 'Admin', email: 'admin@restaurante.com', senha: 'hash...' }
];
module.exports = usuariosData;
```

**Passo 2:** Criar seeder
```javascript
// src/database/seeds/usuarios.seeder.js
const usuariosData = require('../mocks/usuarios.mock');

async function seedUsuarios(client) {
  await client.query('TRUNCATE TABLE usuarios RESTART IDENTITY CASCADE');
  
  for (const usuario of usuariosData) {
    await client.query(
      'INSERT INTO usuarios (nome, email, senha) VALUES ($1, $2, $3)',
      [usuario.nome, usuario.email, usuario.senha]
    );
  }
}

module.exports = seedUsuarios;
```

**Passo 3:** Adicionar ao Maestro
```javascript
// src/seed.js
const seedUsuarios = require('./database/seeds/usuarios.seeder');

async function runSeeders() {
  // ...
  await seedCardapio(client);
  await seedComandas(client);
  await seedUsuarios(client);  // ← Nova linha
  // ...
}
```

---

## 🛡️ Segurança: Prepared Statements

### ❌ NUNCA faça (Vulnerável):

```javascript
// SQL INJECTION RISK!
const nome = "Pizza'; DROP TABLE cardapio; --";
await client.query(`INSERT INTO cardapio (nome) VALUES ('${nome}')`);

// SQL gerado:
// INSERT INTO cardapio (nome) VALUES ('Pizza'; DROP TABLE cardapio; --')
//                                     ^^^^^^   ^^^^^^^^^^^^^^^^^^^^
//                                     Texto    COMANDO MALICIOSO!
```

---

### ✅ SEMPRE faça (Seguro):

```javascript
// SEGURO COM PREPARED STATEMENTS
const nome = "Pizza'; DROP TABLE cardapio; --";
await client.query(
  'INSERT INTO cardapio (nome) VALUES ($1)',
  [nome]
);

// PostgreSQL trata $1 como TEXTO LITERAL, não código SQL
// Resultado: Insere a string exata (inofensiva) no banco
```

---

## 📊 Comparação: Antes vs Depois

| Aspecto | ❌ Antes (Monolítico) | ✅ Depois (Arquitetura) |
|---------|------------------------|--------------------------|
| **Estrutura** | 1 arquivo seed.js | 3 camadas separadas |
| **Dados** | Hardcoded no seeder | Arquivos mock dedicados |
| **Transação** | Nenhuma | BEGIN/COMMIT/ROLLBACK |
| **Ordem** | Manual/Aleatória | Definida pelo Maestro |
| **Rollback** | Impossível | Automático em erro |
| **Reutilização** | Difícil | Mocks reusáveis |
| **Testabilidade** | Baixa | Alta (cada camada isolada) |
| **Manutenção** | Difícil | Fácil (Separation of Concerns) |

---

## 🎯 Exercícios para Alunos

### Exercício 1: Adicionar Tabela de Categorias

1. Crie `categorias.mock.js` com: Pratos Principais, Bebidas, Sobremesas
2. Crie `categorias.seeder.js`
3. Adicione ao Maestro ANTES do cardápio (dependência)
4. Execute `npm run seed` e valide

---

### Exercício 2: Simular Erro e Observar Rollback

1. No `comandas.seeder.js`, adicione um erro proposital:
   ```javascript
   throw new Error('Erro simulado para teste!');
   ```
2. Execute `npm run seed`
3. Observe que o cardápio NÃO foi inserido (rollback funcionou!)
4. Remova o erro e execute novamente

---

### Exercício 3: Refatorar Seeder Antigo

Se você tem um projeto antigo com seeder monolítico:
1. Identifique os dados hardcoded
2. Extraia para arquivos mock
3. Crie seeders individuais
4. Crie o maestro com transação
5. Compare antes/depois

---
