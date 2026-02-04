# 🎓 Arquitetura Profissional de Data Seeding - Resumo Executivo

## 📁 Estrutura Criada

```
backend/src/
│
├── seed.js                              🎭 MAESTRO (Orquestrador)
│
└── database/
    ├── mocks/                           📦 DADOS BRUTOS
    │   ├── cardapio.mock.js             ├─ 6 itens do cardápio
    │   └── comandas.mock.js             └─ 3 comandas de exemplo
    │
    └── seeds/                           🌱 LÓGICA DE INSERÇÃO
        ├── cardapio.seeder.js           ├─ INSERT cardápio
        └── comandas.seeder.js           └─ INSERT comandas
```

---

## 🚀 Como Executar

```bash
# Na pasta backend/
npm run seed
```

**O que acontece:**
1. ✅ Valida variáveis de ambiente (.env)
2. ✅ Conecta ao PostgreSQL
3. ✅ Inicia transação (BEGIN)
4. ✅ Limpa e popula tabela `cardapio` (6 itens)
5. ✅ Limpa e popula tabela `comandas` (3 pedidos)
6. ✅ Confirma transação (COMMIT)
7. ✅ Encerra conexão

---

## 🎯 Princípios Aplicados

### 1. **Separation of Concerns** (Separação de Responsabilidades)

| Camada | Responsabilidade | Exemplo |
|--------|------------------|---------|
| **Mocks** | Armazenar dados | `cardapio.mock.js` |
| **Seeders** | Inserir dados (SQL) | `cardapio.seeder.js` |
| **Maestro** | Coordenar tudo | `seed.js` |

### 2. **ACID Transactions** (Garantia de Integridade)

- **A**tomicidade: Tudo ou nada (se falhar, reverte tudo)
- **C**onsistência: Dados sempre válidos
- **I**solamento: Não afeta outras operações
- **D**urabilidade: Permanente após COMMIT

### 3. **Prepared Statements** (Segurança contra SQL Injection)

```javascript
// ✅ Seguro
await client.query('INSERT INTO cardapio (nome) VALUES ($1)', [nome]);

// ❌ Vulnerável
await client.query(`INSERT INTO cardapio (nome) VALUES ('${nome}')`);
```

---

## 📚 Conceitos Ensinados

### Por que um "Maestro" (Orquestrador)?

**Sem Maestro:**
```bash
node cardapio.seeder.js  # Insere cardápio ✅
node comandas.seeder.js  # ERRO! → mas cardápio já foi inserido ❌
# Resultado: Dados inconsistentes!
```

**Com Maestro:**
```bash
npm run seed  # Executa TUDO em uma transação
# Se qualquer seeder falhar → ROLLBACK em tudo ✅
# Resultado: Dados sempre consistentes!
```

---

### Por que Transações?

**Cenário:** Comandas referenciam itens do cardápio

**Sem Transação:**
```javascript
await insertCardapio();  // ✅ SALVO
await insertComandas();  // ❌ ERRO
// Cardápio ficou órfão no banco! 💥
```

**Com Transação:**
```javascript
BEGIN;
  await insertCardapio();  // ⏳ Temporário
  await insertComandas();  // ❌ ERRO
ROLLBACK;  // Cardápio também é revertido! ✅
```

---

## 📖 Documentação Completa

1. **[ARQUITETURA_SEEDING.md](ARQUITETURA_SEEDING.md)** - Explicação detalhada (3 camadas, ACID, exercícios)
2. **[DIAGRAMA_SEEDING.md](DIAGRAMA_SEEDING.md)** - Diagramas visuais (fluxogramas, comparações)

---

## 🔧 Adicionar Novo Seeder

### Passo 1: Criar Mock
```javascript
// src/database/mocks/categorias.mock.js
const categoriasData = [
  { nome: 'Pratos Principais' },
  { nome: 'Bebidas' },
  { nome: 'Sobremesas' }
];
module.exports = categoriasData;
```

### Passo 2: Criar Seeder
```javascript
// src/database/seeds/categorias.seeder.js
const categoriasData = require('../mocks/categorias.mock');

async function seedCategorias(client) {
  await client.query('TRUNCATE TABLE categorias RESTART IDENTITY CASCADE');
  
  for (const cat of categoriasData) {
    await client.query(
      'INSERT INTO categorias (nome) VALUES ($1)',
      [cat.nome]
    );
  }
}

module.exports = seedCategorias;
```

### Passo 3: Adicionar ao Maestro
```javascript
// src/seed.js
const seedCategorias = require('./database/seeds/categorias.seeder');

// Dentro de runSeeders():
await seedCategorias(client);  // ANTES do cardápio (dependência)
await seedCardapio(client);
await seedComandas(client);
```

---

## ⚠️ Ordem de Dependências

**IMPORTANTE:** Sempre execute seeders na ordem correta!

```javascript
// ✅ CORRETO (respeita dependências)
await seedCategorias(client);  // 1º (não depende de nada)
await seedCardapio(client);    // 2º (depende de categorias)
await seedComandas(client);    // 3º (depende de cardápio)

// ❌ ERRADO (quebra dependências)
await seedComandas(client);    // ERRO! cardápio não existe ainda
await seedCardapio(client);
```

---

## 🔐 Segurança

### SQL Injection - Exemplo Prático

```javascript
// ❌ VULNERÁVEL
const nome = "Pizza'; DROP TABLE cardapio; --";
await db.query(`INSERT INTO cardapio (nome) VALUES ('${nome}')`);
// SQL executado: INSERT INTO cardapio (nome) VALUES ('Pizza'; DROP TABLE cardapio; --')
//                                                     ^^^^^^   ^^^^^^^^^^^^^^^^^^^^
//                                                     Texto    TABELA DELETADA! 💀

// ✅ SEGURO
const nome = "Pizza'; DROP TABLE cardapio; --";
await db.query('INSERT INTO cardapio (nome) VALUES ($1)', [nome]);
// PostgreSQL trata $1 como STRING LITERAL
// Resultado: Insere "Pizza'; DROP TABLE cardapio; --" como texto comum ✅
```

---

## 🧪 Testando

### Verificar dados inseridos

```sql
-- Contar registros
SELECT COUNT(*) FROM cardapio;  -- Deve retornar 6
SELECT COUNT(*) FROM comandas;  -- Deve retornar 3

-- Ver todos os dados
SELECT * FROM cardapio ORDER BY id;
SELECT * FROM comandas ORDER BY id;
```

### Simular erro e verificar ROLLBACK

1. Edite `comandas.seeder.js` e adicione:
   ```javascript
   throw new Error('Teste de ROLLBACK!');
   ```

2. Execute `npm run seed`

3. Verifique que NENHUM dado foi inserido:
   ```sql
   SELECT COUNT(*) FROM cardapio;  -- 0 (rollback funcionou!)
   SELECT COUNT(*) FROM comandas;  -- 0
   ```

4. Remova o erro e execute novamente

---
