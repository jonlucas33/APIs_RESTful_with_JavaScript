# 🌱 Guia de Uso: DDL e SEED

## 📋 Estrutura de Arquivos Criada

```
backend/
├── init-database.sql           # ✅ DDL - Apenas estrutura (tabelas, índices)
├── src/
│   ├── seed.js                 # ✅ SEED - Script de alimentação do banco
│   └── services/
│       ├── database.js         # ✅ Conexão com PostgreSQL (Pool)
│       └── database_mock.js    # ✅ Backup dos dados originais
```

---

## 🚀 Como Usar

### **Passo 1: Criar a Estrutura (DDL)**

Execute o arquivo SQL para criar as tabelas:

```bash
# Conecte ao PostgreSQL e execute o DDL
psql -U postgres -d restaurante_db -f init-database.sql
```

**O que acontece:**
- ✅ Cria tabela `cardapio` (id, nome, preco, descricao)
- ✅ Cria tabela `comandas` (id, mesa, status, itens, total)
- ✅ Cria índices para performance

**Importante:** Execute este passo **apenas 1 vez** por ambiente!

---

### **Passo 2: Popular os Dados (SEED)**

Execute o script Node.js para inserir os dados iniciais:

```bash
npm run seed
```

**O que acontece:**
- 🧹 Limpa a tabela `cardapio` (TRUNCATE)
- 📝 Insere 6 itens do mock de forma segura
- ✅ Valida que todos os dados foram inseridos
- 👋 Encerra a conexão automaticamente

**Importante:** Execute este passo **sempre que quiser resetar os dados**!

---

## 🔄 Fluxo de Trabalho Típico

### Ambiente de Desenvolvimento (DEV)

```bash
# 1. Primeira vez - Criar estrutura
psql -U postgres -d restaurante_db -f init-database.sql

# 2. Popular dados iniciais
npm run seed

# 3. Desenvolver e testar...

# 4. Resetar dados quando necessário
npm run seed  # Limpa e repopula
```

---

### Ambiente de Testes Automatizados

```javascript
// No arquivo de teste (antes de cada teste)
beforeEach(async () => {
  // Limpa e repopula o banco
  await exec('npm run seed');
});
```

---

### Ambiente de Produção

```bash
# 1. Criar estrutura (apenas na primeira implantação)
psql -U usuario_prod -d restaurante_db -f init-database.sql

# 2. NÃO executar seed em produção!
# Os dados reais vêm das operações do sistema
```

---

## 📚 Entendendo Cada Arquivo

### `init-database.sql` - DDL (Estrutura)

**Propósito:** Define a estrutura das tabelas

**Contém:**
- `CREATE TABLE cardapio` - Estrutura da tabela de itens
- `CREATE TABLE comandas` - Estrutura da tabela de pedidos
- `CREATE INDEX` - Índices para performance

**Quando executar:**
- ✅ Primeira implantação
- ✅ Após mudanças na estrutura (migrations)

**NÃO contém:**
- ❌ INSERT (dados)
- ❌ Dados de teste

---

### `src/services/database_mock.js` - Dados de Backup

**Propósito:** Mantém os dados originais do sistema

**Contém:**
```javascript
const cardapio = [
  { nome: 'Prato Feito', preco: 13.00, ... },
  // ... outros itens
];
```

**Uso:**
- ✅ Fonte de dados para o seed
- ✅ Backup dos dados originais
- ✅ Testes unitários (sem precisar de banco real)

---

### `src/seed.js` - Script de Alimentação

**Propósito:** Popula o banco com dados iniciais

**Processo (ETL):**
1. **Extract:** Lê dados de `database_mock.js`
2. **Transform:** Formata para queries parametrizadas
3. **Load:** Insere no PostgreSQL

**Uso:**
```bash
npm run seed  # Executa o script
```

**Segurança:**
- ✅ Usa queries parametrizadas (`$1, $2`)
- ✅ Protegido contra SQL Injection
- ✅ Validação de erros com try/catch

---

## 🔐 Segurança: Queries Parametrizadas

### ❌ NUNCA faça:

```javascript
// VULNERÁVEL a SQL Injection!
const nome = req.body.nome;
await db.query(`INSERT INTO cardapio VALUES ('${nome}')`);
```

### ✅ SEMPRE faça:

```javascript
// SEGURO com queries parametrizadas
const nome = req.body.nome;
await db.query('INSERT INTO cardapio (nome) VALUES ($1)', [nome]);
```

**Por quê?**
- O PostgreSQL trata `$1` como **literal** (texto), não como **código SQL**
- Impossível injetar comandos maliciosos como `'; DROP TABLE cardapio; --`

---

## 🧪 Testando o Sistema

### Verificar se a estrutura foi criada

```sql
-- Listar tabelas
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- Ver estrutura da tabela cardapio
\d cardapio
```

### Verificar se os dados foram inseridos

```sql
-- Contar itens
SELECT COUNT(*) FROM cardapio;

-- Ver todos os itens
SELECT * FROM cardapio ORDER BY id;
```

### Verificar logs do seed

```bash
npm run seed
```

**Saída esperada:**
```
🌱 Iniciando o Seeding do Cardápio...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🧹 Limpando tabela cardapio...
✅ Tabela limpa com sucesso!

📝 Inserindo itens do cardápio...

   ✅ Item adicionado: Prato Feito            | R$ 13.00
   ✅ Item adicionado: Suco de Laranja        | R$ 8.00
   ...

🚀 Seed concluído com sucesso!
```

---

## ⚠️ Troubleshooting

### Erro: "relation cardapio does not exist"

**Causa:** Tabela não foi criada (DDL não foi executado)

**Solução:**
```bash
psql -U postgres -d restaurante_db -f init-database.sql
```

---

### Erro: "password authentication failed"

**Causa:** Credenciais erradas no `.env`

**Solução:** Verifique o arquivo `.env`:
```env
DB_USER=postgres
DB_HOST=localhost
DB_DATABASE=restaurante_db
DB_PASSWORD=sua_senha_correta
DB_PORT=5432
```

---

### Erro: "connect ECONNREFUSED"

**Causa:** PostgreSQL não está rodando

**Solução:**
```bash
# Linux
sudo systemctl start postgresql
sudo systemctl status postgresql

# Windows
# Services → PostgreSQL → Start
```

---

## 📖 Leitura Complementar

Para entender em profundidade os conceitos de DDL vs SEED, consulte:

- [CONCEITOS_DDL_SEED.md](../CONCEITOS_DDL_SEED.md) - Material didático completo
- [GABARITO_IMPLANTACAO.md](../../GABARITO_IMPLANTACAO.md) - Guia de implantação

---

**Material Didático - Implantação de Sistemas**  
**Versão:** 1.0 | Fevereiro 2026
