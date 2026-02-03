# 📦 Configuração do Banco de Dados PostgreSQL

## Pré-requisitos

- PostgreSQL 12+ instalado
- Usuário `postgres` com senha configurada

## Passos para Configuração

### 1. Verificar se o PostgreSQL está rodando

```powershell
Get-Service -Name *postgres*
```

### 2. Configurar a senha do usuário postgres

Se você não lembra a senha do postgres, será necessário redefini-la:

1. Abra o pgAdmin (ferramenta gráfica do PostgreSQL)
2. Ou use o psql e redefina a senha

### 3. Atualizar o arquivo .env

Certifique-se de que o arquivo `.env` na raiz do backend tenha as credenciais corretas:

```env
DB_USER=postgres
DB_HOST=localhost
DB_DATABASE=restaurante_db
DB_PASSWORD=SUA_SENHA_AQUI
DB_PORT=5432
```

### 4. Criar o banco de dados

#### Opção A: Usando pgAdmin (Recomendado para iniciantes)

1. Abra o pgAdmin
2. Conecte-se ao servidor PostgreSQL
3. Clique com botão direito em "Databases" → "Create" → "Database"
4. Nome: `restaurante_db`
5. Clique em "Save"

#### Opção B: Usando linha de comando (Windows)

```powershell
# Localizar o psql (geralmente está em C:\Program Files\PostgreSQL\16\bin\)
cd "C:\Program Files\PostgreSQL\16\bin\"

# Criar o banco de dados
.\psql.exe -U postgres -c "CREATE DATABASE restaurante_db;"
```

### 5. Executar o script de inicialização

#### Opção A: Usando pgAdmin

1. No pgAdmin, conecte-se ao banco `restaurante_db`
2. Clique em "Query Tool" (ícone de raio)
3. Abra o arquivo `init-database.sql`
4. Execute o script (tecla F5)

#### Opção B: Usando linha de comando

```powershell
cd "C:\Program Files\PostgreSQL\16\bin\"
.\psql.exe -U postgres -d restaurante_db -f "C:\Users\joaol\OneDrive\Desktop\repos\APIs_RESTful_with_JavaScript\restaurante-api-demo\backend\init-database.sql"
```

### 6. Verificar a instalação

Teste a conexão com o Node.js:

```bash
cd backend
node -e "const { Pool } = require('pg'); const pool = new Pool({ user: 'postgres', host: 'localhost', database: 'restaurante_db', password: 'SUA_SENHA', port: 5432 }); pool.query('SELECT * FROM cardapio', (err, res) => { if (err) { console.error('Erro:', err.message); } else { console.log('✅ Banco configurado! Total de itens:', res.rowCount); console.table(res.rows); } pool.end(); });"
```

### 7. Iniciar o servidor

```bash
npm run dev
```

## Troubleshooting

### Erro: "password authentication failed"

- Verifique se a senha no `.env` está correta
- Tente redefinir a senha do usuário postgres

### Erro: "database does not exist"

- Execute o passo 4 para criar o banco de dados
- Verifique se o nome está correto: `restaurante_db`

### Erro: "relation cardapio does not exist"

- Execute o script `init-database.sql` (passo 5)
- Verifique se conectou ao banco correto antes de executar

## 🎉 Sucesso!

Se tudo funcionou, você deve ver no console:
```
📦 Conectado ao PostgreSQL com sucesso!
🚀 Servidor rodando na porta 4000
```
