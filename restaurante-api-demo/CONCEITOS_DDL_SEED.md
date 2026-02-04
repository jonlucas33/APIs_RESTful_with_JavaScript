# 📚 AULA: DDL vs SEED - Conceitos de Implantação de Bancos de Dados

## 🎯 Objetivos de Aprendizagem

Ao final desta aula, você será capaz de:
- Diferenciar DDL (estrutura) de DML/Seed (dados)
- Explicar por que separar criação de tabelas de inserção de dados
- Aplicar boas práticas de versionamento de banco de dados
- Implementar scripts de seed seguros usando queries parametrizadas

---

## 📖 1. Fundamentos: DDL vs DML vs SEED

### DDL - Data Definition Language (Linguagem de Definição de Dados)

**Responsabilidade:** Define a **ESTRUTURA** do banco de dados.

**Comandos SQL:**
```sql
CREATE TABLE
ALTER TABLE
DROP TABLE
CREATE INDEX
ADD CONSTRAINT
```

**Exemplo Prático:**
```sql
-- Isto é DDL: define COMO os dados serão armazenados
CREATE TABLE cardapio (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  preco DECIMAL(10, 2) NOT NULL
);
```

**Características:**
- ✅ Executa RARAMENTE (criação inicial, migrações)
- ✅ Requer permissões ELEVADAS (DBA)
- ✅ Versionado via **migrations** (Flyway, Liquibase, Knex.js)
- ✅ Testado em DEV → STAGING → PRODUÇÃO

---

### DML - Data Manipulation Language (Linguagem de Manipulação de Dados)

**Responsabilidade:** Manipula os **DADOS** dentro das tabelas.

**Comandos SQL:**
```sql
INSERT
UPDATE
DELETE
SELECT
```

**Exemplo Prático:**
```sql
-- Isto é DML: insere DADOS na estrutura criada
INSERT INTO cardapio (nome, preco) 
VALUES ('Prato Feito', 13.00);
```

---

### SEED - Alimentação Inicial de Dados

**Responsabilidade:** Popular o banco com **dados iniciais** necessários para o sistema funcionar.

**Quando usar:**
- Dados de configuração (ex: lista de estados, categorias)
- Dados de teste para desenvolvimento
- Dados de demonstração para staging

**Exemplo Prático (Node.js):**
```javascript
// Script de seed separado do DDL
async function popularBanco() {
  await db.query('INSERT INTO cardapio VALUES ($1, $2)', ['Pizza', 40.00]);
}
```

---

## ⚖️ 2. Comparação Lado a Lado

| Aspecto | DDL (Estrutura) | SEED (Dados) |
|---------|-----------------|--------------|
| **O que é?** | Cria tabelas, índices, constraints | Insere dados iniciais |
| **Frequência** | Raramente (versões do sistema) | Frequentemente (testes, demos) |
| **Arquivo** | `init-database.sql` | `seed.js` ou `seeds.sql` |
| **Execução** | Migrations (1x por ambiente) | Scripts on-demand (várias vezes) |
| **Exemplo** | `CREATE TABLE usuarios` | `INSERT INTO usuarios VALUES (...)` |
| **Versionamento** | Git + Migrations | Pode variar por ambiente |
| **Produção** | Sim, sempre | Geralmente NÃO |

---

## 🚫 3. Por que NÃO misturar DDL e SEED?

### ❌ Problema 1: Poluição de Ambiente

**Cenário:**
```sql
-- Arquivo misturado (RUIM)
CREATE TABLE cardapio (...);

INSERT INTO cardapio VALUES ('Pizza', 40.00);
INSERT INTO cardapio VALUES ('Suco', 8.00);
-- ... 100 linhas de INSERT
```

**Impacto:**
- 🔴 Em PRODUÇÃO: Você NÃO quer inserir dados de teste
- 🔴 Em TESTES: Você quer LIMPAR e REPOPULAR, não RECRIAR a tabela toda vez

---

### ❌ Problema 2: Perda de Performance

**Cenário:**
```sql
-- Toda vez que preciso resetar dados de teste:
DROP TABLE cardapio; -- Apaga estrutura E dados
CREATE TABLE cardapio (...); -- Recria estrutura
INSERT ... -- Reinsere dados
```

**Solução Separada:**
```sql
-- Muito mais rápido:
TRUNCATE TABLE cardapio; -- Apenas limpa dados
-- Estrutura permanece intacta
```

**Benchmark:**
- `DROP + CREATE`: ~500ms
- `TRUNCATE`: ~50ms (10x mais rápido!)

---

### ❌ Problema 3: Controle de Versão Confuso

**Cenário:** Arquivo misturado no Git

```sql
-- v1.0 - init.sql
CREATE TABLE cardapio (...);
INSERT INTO cardapio VALUES ('Pizza', 30.00);

-- v1.1 - Alguém alterou o preço
CREATE TABLE cardapio (...);
INSERT INTO cardapio VALUES ('Pizza', 40.00); -- Mudou!
```

**Impacto:**
- 🔴 Git diff mostra mudança estrutural, mas era só dado
- 🔴 Code review fica confuso: "mudou a estrutura ou só dados?"
- 🔴 Rollback difícil (se quiser voltar estrutura mas manter dados novos)

**Solução Separada:**
```
📁 migrations/
  └── 001_create_cardapio.sql  (DDL - versionado rígido)
📁 seeds/
  └── cardapio_seed.js          (Dados - versionado flexível)
```

---

### ❌ Problema 4: Ambientes com Necessidades Diferentes

| Ambiente | DDL (Estrutura) | SEED (Dados) |
|----------|-----------------|--------------|
| **DEV** | ✅ Mesma estrutura | 🧪 Muitos dados de teste |
| **STAGING** | ✅ Mesma estrutura | 📸 Cópia dos dados reais |
| **PRODUÇÃO** | ✅ Mesma estrutura | ❌ SEM seed (dados reais) |

**Se misturar:**
- 🔴 Rodar DDL em produção insere dados de teste acidentalmente
- 🔴 Não consegue ter seeds diferentes por ambiente

---

## ✅ 4. Boas Práticas de Separação

### Estrutura de Arquivos Profissional

```
backend/
├── migrations/              # DDL versionado
│   ├── 001_create_cardapio.sql
│   ├── 002_add_column_categoria.sql
│   └── 003_create_comandas.sql
│
├── seeds/                   # Dados iniciais
│   ├── cardapio.seed.js
│   └── usuarios.seed.js
│
├── src/
│   └── services/
│       ├── database.js      # Conexão (Pool)
│       └── database_mock.js # Dados de teste
│
└── init-database.sql        # DDL inicial (apenas estrutura)
```

---

### Fluxo de Trabalho Recomendado

```bash
# 1. Criar estrutura (DDL) - 1x por ambiente
psql -U postgres -d restaurante_db -f migrations/001_create_cardapio.sql

# 2. Popular dados (SEED) - quantas vezes precisar
npm run seed
# ou
node src/seed.js

# 3. Em testes: limpar e repopular
npm run seed:reset  # TRUNCATE + INSERT
```

---

## 🔐 5. Segurança: Queries Parametrizadas

### ❌ NUNCA faça assim (Vulnerável a SQL Injection)

```javascript
// CÓDIGO INSEGURO - NÃO USE!
const nome = "Pizza'; DROP TABLE cardapio; --";
await db.query(`INSERT INTO cardapio (nome) VALUES ('${nome}')`);
// Executa: INSERT INTO cardapio (nome) VALUES ('Pizza'; DROP TABLE cardapio; --')
// Resultado: TABELA DELETADA! 💀
```

---

### ✅ SEMPRE use Queries Parametrizadas

```javascript
// CÓDIGO SEGURO ✅
const nome = "Pizza'; DROP TABLE cardapio; --";
const queryText = 'INSERT INTO cardapio (nome, preco) VALUES ($1, $2)';
const values = [nome, 40.00];

await db.query(queryText, values);
// PostgreSQL trata $1 como LITERAL (string), não como comando SQL
// Resultado: INSERT bem-sucedido, tabela segura! ✅
```

**Como funciona:**
1. PostgreSQL recebe a query com placeholders `$1, $2`
2. PostgreSQL recebe os valores em array separado
3. PostgreSQL **ESCAPA** os valores automaticamente
4. PostgreSQL substitui placeholders pelos valores escapados
5. **Impossível** injetar código SQL malicioso

---

## 🧪 6. Exemplo Completo: Nosso Projeto Restaurante

### Arquivo 1: `init-database.sql` (DDL)

```sql
-- APENAS ESTRUTURA
CREATE TABLE cardapio (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  preco DECIMAL(10, 2) NOT NULL
);

CREATE INDEX idx_cardapio_nome ON cardapio(nome);
```

**Execução:** `psql -U postgres -d restaurante_db -f init-database.sql`

---

### Arquivo 2: `database_mock.js` (Fonte de Dados)

```javascript
// Backup dos dados originais
const cardapio = [
  { nome: 'Pizza', preco: 40.00, descricao: 'Margherita' },
  { nome: 'Suco', preco: 8.00, descricao: 'Laranja 500ml' }
];

module.exports = { cardapio };
```

---

### Arquivo 3: `seed.js` (Alimentação)

```javascript
const db = require('./services/database');
const { cardapio } = require('./services/database_mock');

async function popularBanco() {
  try {
    // 1. Limpa dados (mantém estrutura)
    await db.query('TRUNCATE TABLE cardapio RESTART IDENTITY CASCADE');
    
    // 2. Insere dados do mock de forma segura
    for (const item of cardapio) {
      const queryText = 'INSERT INTO cardapio (nome, preco, descricao) VALUES ($1, $2, $3)';
      const values = [item.nome, item.preco, item.descricao];
      await db.query(queryText, values);
    }
    
    console.log('✅ Seed concluído!');
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    process.exit(); // Encerra script
  }
}

popularBanco();
```

**Execução:** `node src/seed.js`

---

## 📝 7. Checklist de Validação

Seu projeto está seguindo boas práticas se:

- [ ] DDL está em arquivo `.sql` separado
- [ ] SEED está em arquivo `.js` ou `.sql` separado
- [ ] `.env` contém credenciais de banco (não hardcoded)
- [ ] Script de seed usa queries parametrizadas (`$1, $2`)
- [ ] Script de seed usa `TRUNCATE` (não `DROP TABLE`)
- [ ] Script de seed tem `try/catch` + `process.exit()`
- [ ] Dados de teste estão em arquivo mock separado
- [ ] Não há `INSERT` no arquivo DDL principal

---

## 🎓 Exercícios Práticos

### Exercício 1: Identificar o Tipo
Classifique os comandos SQL como **DDL** ou **DML**:

```sql
a) CREATE TABLE produtos (id SERIAL);
b) INSERT INTO produtos VALUES (1, 'Notebook');
c) ALTER TABLE produtos ADD COLUMN preco DECIMAL;
d) DELETE FROM produtos WHERE id = 1;
e) CREATE INDEX idx_preco ON produtos(preco);
```

<details>
<summary>Resposta</summary>

- a) DDL (cria estrutura)
- b) DML (insere dados)
- c) DDL (altera estrutura)
- d) DML (remove dados)
- e) DDL (cria índice)
</details>

---

### Exercício 2: Corrigir Código Inseguro
Refatore este código vulnerável para usar queries parametrizadas:

```javascript
// CÓDIGO VULNERÁVEL
const nome = req.body.nome;
await db.query(`INSERT INTO cardapio (nome) VALUES ('${nome}')`);
```

<details>
<summary>Resposta</summary>

```javascript
// CÓDIGO SEGURO
const nome = req.body.nome;
const queryText = 'INSERT INTO cardapio (nome) VALUES ($1)';
await db.query(queryText, [nome]);
```
</details>

---

### Exercício 3: Projetar Estrutura de Arquivos
Você está iniciando um projeto de e-commerce. Desenhe a estrutura de pastas para DDL e SEED.

<details>
<summary>Resposta Sugerida</summary>

```
ecommerce-api/
├── migrations/
│   ├── 001_create_produtos.sql
│   ├── 002_create_pedidos.sql
│   └── 003_create_usuarios.sql
├── seeds/
│   ├── produtos.seed.js
│   ├── categorias.seed.js
│   └── usuarios_admin.seed.js
└── src/
    └── services/
        ├── database.js
        └── mocks/
            ├── produtos.mock.js
            └── usuarios.mock.js
```
</details>

---

## 📚 Resumo Final

| **Conceito** | **Resumo** |
|--------------|------------|
| **DDL** | Cria estrutura (tabelas, índices) - arquivo `.sql` |
| **SEED** | Popula dados iniciais - arquivo `.js` ou `.sql` |
| **Separação** | DDL roda 1x, SEED roda N vezes |
| **Segurança** | Sempre use queries parametrizadas (`$1, $2`) |
| **TRUNCATE** | Limpa dados sem destruir estrutura |
| **process.exit()** | Encerra script após seed |

---

**Próxima Aula:** Migrations com Knex.js e Versionamento de Banco de Dados

---

**Autor:** Material Didático - Implantação de Sistemas  
**Versão:** 1.0 | Fevereiro 2026
