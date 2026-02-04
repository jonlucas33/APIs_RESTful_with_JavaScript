# 📊 RESUMO VISUAL: DDL vs SEED

## 🎯 Analogia do Restaurante

Imagine que você está montando um restaurante físico:

```
┌─────────────────────────────────────────────────────────────┐
│                    MONTANDO UM RESTAURANTE                  │
└─────────────────────────────────────────────────────────────┘

📋 DDL = CONSTRUÇÃO DO PRÉDIO
   ├── Construir a cozinha (estrutura)
   ├── Instalar mesas e cadeiras (tabelas)
   ├── Criar o sistema de ventilação (índices)
   └── Definir o layout (constraints)
   
   ❓ Frequência: 1x (ou quando precisar reformar)
   📁 Arquivo: init-database.sql


🌱 SEED = ABASTECER A COZINHA
   ├── Comprar ingredientes iniciais (dados)
   ├── Preparar o cardápio do dia (mock)
   ├── Colocar os itens nas prateleiras (INSERT)
   └── Limpar e reabastecer quando necessário (TRUNCATE)
   
   ❓ Frequência: Sempre que precisar resetar
   📁 Arquivo: src/seed.js
```

---

## 🔄 Fluxo Completo

```
┌─────────────────────────────────────────────────────────────┐
│  AMBIENTE NOVO (Primeira vez)                               │
└─────────────────────────────────────────────────────────────┘

PASSO 1: Executar DDL
┌──────────────────────────────────────┐
│ psql -f init-database.sql            │
│                                      │
│ ✅ Cria tabela cardapio             │
│ ✅ Cria tabela comandas             │
│ ✅ Cria índices                     │
└──────────────────────────────────────┘
           ↓
           
PASSO 2: Executar SEED
┌──────────────────────────────────────┐
│ npm run seed                         │
│                                      │
│ ✅ Insere 6 itens no cardápio       │
│ ✅ Valida inserção                  │
└──────────────────────────────────────┘
           ↓
           
PASSO 3: Sistema Funcionando!
┌──────────────────────────────────────┐
│ npm run dev                          │
│                                      │
│ ✅ API rodando                       │
│ ✅ GET /api/cardapio → retorna itens│
└──────────────────────────────────────┘
```

---

## 🔁 Durante o Desenvolvimento

```
┌─────────────────────────────────────────────────────────────┐
│  RESETAR DADOS (sem recriar estrutura)                      │
└─────────────────────────────────────────────────────────────┘

Situação: "Fiz testes e agora o banco está bagunçado"

❌ NÃO FAÇA ISSO:
┌──────────────────────────────────────┐
│ DROP TABLE cardapio;                 │
│ CREATE TABLE cardapio (...);         │
│ INSERT ...                           │
│                                      │
│ ⏱️ Tempo: ~500ms                     │
│ ⚠️ Perde índices, constraints        │
└──────────────────────────────────────┘

✅ FAÇA ISSO:
┌──────────────────────────────────────┐
│ npm run seed                         │
│                                      │
│ (Internamente faz TRUNCATE)          │
│ ⏱️ Tempo: ~50ms (10x mais rápido!)  │
│ ✅ Mantém estrutura intacta          │
└──────────────────────────────────────┘
```

---

## 📁 Estrutura de Arquivos

```
backend/
│
├── 📋 init-database.sql          ← DDL (Estrutura)
│   └── CREATE TABLE cardapio (...)
│   └── CREATE TABLE comandas (...)
│   └── CREATE INDEX idx_* (...)
│
├── 🌱 src/seed.js                ← SEED (Dados)
│   └── TRUNCATE TABLE cardapio
│   └── INSERT INTO cardapio VALUES (...)
│
└── 📦 src/services/
    │
    ├── database.js               ← Conexão (Pool)
    │   └── Pool de conexões PostgreSQL
    │
    └── database_mock.js          ← Backup (Dados originais)
        └── const cardapio = [...]
```

---

## ⚖️ Comparação Rápida

| Aspecto | DDL | SEED |
|---------|-----|------|
| **🎯 Propósito** | Criar estrutura | Inserir dados |
| **📝 Comandos** | CREATE, ALTER, DROP | INSERT |
| **📁 Arquivo** | `.sql` | `.js` |
| **⏱️ Execução** | 1x por ambiente | N vezes |
| **🔐 Permissões** | DBA (elevadas) | App (limitadas) |
| **🏭 Produção** | Sim, na implantação | Não (dados reais) |
| **🧪 Testes** | 1x (setup) | N vezes (reset) |

---

## 🛡️ Segurança: Queries Parametrizadas

```javascript
┌─────────────────────────────────────────────────────────────┐
│  ❌ CÓDIGO INSEGURO (Vulnerável a SQL Injection)            │
└─────────────────────────────────────────────────────────────┘

const nome = req.body.nome; // Usuário envia: "Pizza'; DROP TABLE cardapio; --"

await db.query(`INSERT INTO cardapio (nome) VALUES ('${nome}')`);

// SQL gerado:
// INSERT INTO cardapio (nome) VALUES ('Pizza'; DROP TABLE cardapio; --')
//                                     ^^^^^   ^^^^^^^^^^^^^^^^^^^
//                                     Item    TABELA DELETADA! 💀

┌─────────────────────────────────────────────────────────────┐
│  ✅ CÓDIGO SEGURO (Com Queries Parametrizadas)              │
└─────────────────────────────────────────────────────────────┘

const nome = req.body.nome; // Usuário envia: "Pizza'; DROP TABLE cardapio; --"

await db.query('INSERT INTO cardapio (nome) VALUES ($1)', [nome]);
                                               ^^^        ^^^^^^
                                            Placeholder   Valor escapado

// PostgreSQL trata $1 como TEXTO, não como CÓDIGO SQL
// Resultado: INSERT bem-sucedido com texto literal
// "Pizza'; DROP TABLE cardapio; --" é salvo como STRING! ✅
```

---

## 📊 Exemplo Completo do Projeto

```javascript
// ============================================================
// 1️⃣ database_mock.js - Fonte de Dados (Backup)
// ============================================================
const cardapio = [
  { nome: 'Pizza', preco: 40.00 },
  { nome: 'Suco', preco: 8.00 }
];
module.exports = { cardapio };


// ============================================================
// 2️⃣ seed.js - Script de Alimentação
// ============================================================
const db = require('./services/database');
const { cardapio } = require('./services/database_mock');

async function popularBanco() {
  // Limpa dados (mantém estrutura)
  await db.query('TRUNCATE TABLE cardapio RESTART IDENTITY CASCADE');
  
  // Insere dados do mock
  for (const item of cardapio) {
    await db.query(
      'INSERT INTO cardapio (nome, preco) VALUES ($1, $2)',
      [item.nome, item.preco]  // ← Seguro contra SQL Injection!
    );
  }
  
  process.exit(); // Encerra script
}

popularBanco();


// ============================================================
// 3️⃣ Executar
// ============================================================
// Terminal:
// npm run seed

// Saída:
// 🌱 Iniciando o Seeding...
// ✅ Item adicionado: Pizza | R$ 40.00
// ✅ Item adicionado: Suco | R$ 8.00
// 🚀 Seed concluído!
```

---

## 🎓 Checklist do Aluno

Marque conforme você completa cada passo:

### Entendimento Conceitual
- [ ] Sei diferenciar DDL de DML/SEED
- [ ] Entendo por que separar estrutura de dados
- [ ] Sei quando usar TRUNCATE vs DROP TABLE
- [ ] Entendo o risco de SQL Injection

### Implementação Prática
- [ ] Executei `init-database.sql` com sucesso
- [ ] Executei `npm run seed` com sucesso
- [ ] Verifiquei os dados inseridos com `SELECT`
- [ ] Testei resetar dados múltiplas vezes

### Segurança
- [ ] Sempre uso queries parametrizadas (`$1, $2`)
- [ ] Nunca concateno strings em SQL
- [ ] Tenho `.env` configurado corretamente
- [ ] `.env` está no `.gitignore`

### Próximos Passos
- [ ] Entender Migrations (versionamento de DDL)
- [ ] Implementar seeds para tabela `comandas`
- [ ] Criar testes automatizados com seed

---

## 📚 Glossário Visual

```
┌────────────────────────────────────────────────────────────┐
│ TERMO              │ O QUE É                               │
├────────────────────┼───────────────────────────────────────┤
│ DDL                │ Comandos que CRIAM estrutura          │
│ DML                │ Comandos que MANIPULAM dados          │
│ SEED               │ Script que POPULA dados iniciais      │
│ TRUNCATE           │ Limpa dados (mantém estrutura)        │
│ DROP               │ Deleta tudo (estrutura + dados)       │
│ SERIAL             │ Auto-incremento (id automático)       │
│ Pool               │ Conjunto de conexões reutilizáveis    │
│ Query Parametrizada│ SQL seguro com placeholders ($1, $2)  │
│ SQL Injection      │ Ataque que injeta código malicioso    │
│ Migration          │ Versionamento de mudanças no banco    │
└────────────────────┴───────────────────────────────────────┘
```

---

**Material Didático - Implantação de Sistemas**  
**Versão:** 1.0 | Fevereiro 2026
