# 📋 GABARITO DE IMPLANTAÇÃO - SISTEMA RESTAURANTE API

> **Disciplina:** Implantação de Sistemas  
> **Projeto:** API RESTful de Restaurante com Express e PostgreSQL  
> **Público-alvo:** Alunos de Nível Técnico em TI

---

## 📊 CHECKLIST DE REQUISITOS TÉCNICOS

### ✅ Versões e Dependências Identificadas

| Componente | Versão/Configuração | Localização | Criticidade |
|------------|---------------------|-------------|-------------|
| **Node.js** | >= 14.x (recomendado: 18.x LTS) | Sistema Operacional | ⚠️ CRÍTICO |
| **npm** | >= 6.x | Incluído com Node.js | ⚠️ CRÍTICO |
| **PostgreSQL** | >= 12.x | Servidor de Banco de Dados | ⚠️ CRÍTICO |
| **Porta Backend** | 4000 | `server.js` (linha 7) | ⚠️ CRÍTICO |
| **Porta PostgreSQL** | 5432 (padrão) | Configurável via `.env` | ⚠️ CRÍTICO |

### 📦 Pacotes NPM Instalados

#### Dependências de Produção (`dependencies`)
```json
{
  "cors": "^2.8.5",
  "express": "^4.18.2",
  "dotenv": "^17.2.3",
  "pg": "^8.18.0"
}
```

#### Dependências de Desenvolvimento (`devDependencies`)
```json
{
  "jest": "^30.2.0",
  "nodemon": "^3.0.1",
  "supertest": "^7.1.4"
}
```

---

## 🔍 ANÁLISE TÉCNICA DE IMPORTS

### 1️⃣ **`express`** - Framework Web

**📍 Localização:** `app.js` (linha 5)
```javascript
const express = require('express');
```

**🛠️ Função Técnica:**
- Framework minimalista para Node.js que simplifica a criação de APIs REST
- Gerencia rotas HTTP (GET, POST, PATCH, DELETE)
- Processa requisições e respostas
- Implementa middleware pipeline (CORS, JSON parsing, etc.)

**🌍 Importância para Implantação:**
- **Essencial:** Sem o Express, o servidor não consegue processar requisições HTTP
- **Versionamento:** A versão `^4.18.2` garante compatibilidade com middlewares modernos
- **Impacto:** Se não instalado, o comando `npm start` falhará imediatamente

**⚠️ Riscos de Infraestrutura:**
- ❌ Servidor não inicia se o pacote estiver ausente
- ❌ Conflitos de versão podem causar comportamento inesperado em middlewares
- ⚡ **Solução:** Sempre executar `npm install` antes do deploy

---

### 2️⃣ **`cors`** - Cross-Origin Resource Sharing

**📍 Localização:** `app.js` (linha 6)
```javascript
const cors = require('cors');
```

**🛠️ Função Técnica:**
- Middleware que adiciona headers HTTP necessários para permitir requisições de diferentes origens
- Resolve o bloqueio do navegador quando frontend e backend estão em portas/domínios diferentes
- Configura políticas de segurança de compartilhamento de recursos

**🌍 Importância para Implantação:**
- **Crítico para Arquitetura Separada:** Frontend (porta 5173 - Vite) precisa acessar Backend (porta 4000)
- **Segurança:** Em produção, deve ser configurado para aceitar apenas domínios específicos
- **Bloqueio de Navegador:** Sem CORS, requisições AJAX falham com erro `CORS policy blocked`

**⚠️ Riscos de Infraestrutura:**
- ❌ Frontend não consegue comunicar com a API (erro de CORS no console do navegador)
- ❌ Em produção, configuração permissiva (`*`) expõe a API a qualquer origem
- ⚡ **Solução Produção:**
  ```javascript
  app.use(cors({
    origin: 'https://dominio-do-frontend.com'
  }));
  ```

---

### 3️⃣ **`pg`** - PostgreSQL Client

**📍 Localização:** `database.js` (linha 1)
```javascript
const { Pool } = require('pg');
```

**🛠️ Função Técnica:**
- Driver oficial do PostgreSQL para Node.js
- Implementa Pool de Conexões (reutiliza conexões TCP para melhorar performance)
- Executa queries SQL de forma assíncrona
- Gerencia transações e prepared statements

**🌍 Importância para Implantação:**
- **Comunicação com Banco:** Sem `pg`, não há como conectar ao PostgreSQL
- **Pool de Conexões:** Evita criar/destruir conexões a cada requisição (performance crítica)
- **Async/Await:** Permite código assíncrono moderno e legível

**⚠️ Riscos de Infraestrutura:**
- ❌ **PostgreSQL não instalado:** Erro `ECONNREFUSED` ao tentar conectar
- ❌ **Credenciais erradas:** Falha de autenticação (`password authentication failed`)
- ❌ **Porta bloqueada:** Firewall pode bloquear conexão na porta 5432
- ❌ **Versão incompatível:** Queries podem falhar em versões antigas do PostgreSQL
- ⚡ **Solução:** 
  1. Verificar PostgreSQL rodando: `systemctl status postgresql` (Linux) ou Services (Windows)
  2. Testar conexão: `psql -U usuario -d banco -h localhost`
  3. Ajustar firewall para permitir porta 5432

---

### 4️⃣ **`dotenv`** - Gerenciador de Variáveis de Ambiente

**📍 Localização:** `database.js` (linha 2)
```javascript
require('dotenv').config();
```

**🛠️ Função Técnica:**
- Carrega variáveis de ambiente de um arquivo `.env` para `process.env`
- Permite separar configurações sensíveis do código-fonte
- Facilita diferentes configurações por ambiente (dev, staging, produção)

**🌍 Importância para Implantação:**
- **🔐 SEGURANÇA CRÍTICA:** Evita credenciais hardcoded no código
- **Flexibilidade:** Mesma aplicação roda em diferentes ambientes apenas mudando `.env`
- **Controle de Versão:** `.env` não deve estar no Git (incluir no `.gitignore`)

**⚠️ Riscos de Infraestrutura:**
- ❌ **Arquivo `.env` ausente:** Variáveis ficam `undefined`, conexão com DB falha
- ❌ **Credenciais expostas:** Se `.env` for commitado, senhas ficam públicas no repositório
- ❌ **Formato incorreto:** Espaços ou aspas podem causar leitura errada das variáveis
- ⚡ **Solução:**
  1. Criar `.env` na raiz de `backend/` antes do deploy
  2. Adicionar `.env` ao `.gitignore`
  3. Documentar variáveis necessárias em `.env.example`

**📝 Variáveis Necessárias (baseado em `database.js`):**
```env
DB_USER=postgres
DB_HOST=localhost
DB_DATABASE=restaurante_db
DB_PASSWORD=sua_senha_segura
DB_PORT=5432
```

---

### 5️⃣ **`express.Router()`** - Sistema de Roteamento

**📍 Localização:** `api.routes.js` (linha 4)
```javascript
const router = express.Router();
```

**🛠️ Função Técnica:**
- Cria instâncias modulares de rotas
- Organiza endpoints por contexto (cardápio, comandas, etc.)
- Permite aplicar middlewares específicos por grupo de rotas

**🌍 Importância para Implantação:**
- **Arquitetura:** Separa lógica de rotas do servidor principal
- **Manutenibilidade:** Facilita adicionar/remover endpoints sem modificar `server.js`
- **Escalabilidade:** Cada módulo (cardápio, comandas) tem suas próprias rotas

**⚠️ Riscos de Infraestrutura:**
- ✅ Baixo risco: faz parte do Express core
- ⚠️ **Atenção:** Prefixos de rota (`/api`) devem coincidir com documentação da API

---

## 🚨 CENÁRIOS DE FALHA CRÍTICA

### Cenário 1: Cliente sem PostgreSQL Instalado
**Sintoma:**
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
**Causa:** PostgreSQL não está rodando ou não está instalado  
**Solução:**
1. Instalar PostgreSQL: `sudo apt install postgresql` (Linux) ou baixar do [postgresql.org](https://www.postgresql.org/download/)
2. Iniciar serviço: `sudo systemctl start postgresql`
3. Verificar status: `sudo systemctl status postgresql`

---

### Cenário 2: Porta 4000 Bloqueada/Em Uso
**Sintoma:**
```
Error: listen EADDRINUSE: address already in use :::4000
```
**Causa:** Outro processo está usando a porta 4000  
**Solução:**
1. Identificar processo: `lsof -i :4000` (Linux) ou `netstat -ano | findstr :4000` (Windows)
2. Encerrar processo: `kill -9 <PID>`
3. **Alternativa:** Mudar porta em `server.js` e documentar a mudança

---

### Cenário 3: Falta de Variáveis de Ambiente
**Sintoma:**
```
error: password authentication failed for user "undefined"
```
**Causa:** Arquivo `.env` não existe ou não foi carregado  
**Solução:**
1. Criar arquivo `.env` em `backend/`:
   ```env
   DB_USER=postgres
   DB_HOST=localhost
   DB_DATABASE=restaurante_db
   DB_PASSWORD=senha123
   DB_PORT=5432
   ```
2. Verificar permissões de leitura do arquivo
3. Reiniciar servidor após criar `.env`

---

### Cenário 4: Firewall Bloqueando PostgreSQL
**Sintoma:**
```
Error: timeout trying to connect to postgres
```
**Causa:** Firewall bloqueia porta 5432  
**Solução (Linux/UFW):**
```bash
sudo ufw allow 5432/tcp
sudo ufw reload
```
**Solução (Windows Firewall):**
- Painel de Controle → Firewall → Regras de Entrada → Nova Regra → Porta TCP 5432

---

## 📚 ROTEIRO DE IMPLANTAÇÃO (PASSO A PASSO)

### Fase 1: Preparação do Ambiente
```bash
# 1. Verificar versão do Node.js
node --version  # Deve ser >= 14.x

# 2. Verificar PostgreSQL instalado
psql --version  # Deve mostrar versão >= 12.x

# 3. Verificar PostgreSQL rodando
# Linux:
sudo systemctl status postgresql

# Windows:
# Services → PostgreSQL → Status: Running
```

### Fase 2: Configuração do Banco de Dados
```bash
# 1. Acessar PostgreSQL
psql -U postgres

# 2. Criar banco de dados
CREATE DATABASE restaurante_db;

# 3. Executar script de inicialização (se houver)
psql -U postgres -d restaurante_db -f backend/init-database.sql
```

### Fase 3: Configuração da Aplicação
```bash
# 1. Navegar para pasta do backend
cd backend/

# 2. Criar arquivo .env
cat > .env << EOF
DB_USER=postgres
DB_HOST=localhost
DB_DATABASE=restaurante_db
DB_PASSWORD=sua_senha
DB_PORT=5432
EOF

# 3. Instalar dependências
npm install
```

### Fase 4: Validação Pré-Deploy
```bash
# 1. Testar conexão com banco
npm run test  # Executar testes

# 2. Iniciar em modo desenvolvimento
npm run dev  # Deve mostrar "📦 Conectado ao PostgreSQL"

# 3. Testar endpoint de saúde
curl http://localhost:4000/
# Deve retornar JSON com mensagem de boas-vindas
```

### Fase 5: Deploy em Produção
```bash
# 1. Iniciar aplicação em modo produção
npm start

# 2. Verificar logs
# Deve mostrar:
# 🚀 Servidor rodando em http://localhost:4000
# 📦 Conectado ao PostgreSQL com sucesso!

# 3. Testar endpoints
curl http://localhost:4000/api/cardapio
```

---

## 🔐 CHECKLIST DE SEGURANÇA

- [ ] **Arquivo `.env` NÃO está no controle de versão** (verificar `.gitignore`)
- [ ] **Senha do PostgreSQL é forte** (mínimo 12 caracteres, alfanumérico + símbolos)
- [ ] **CORS está configurado para domínio específico em produção** (não usar `*`)
- [ ] **PostgreSQL não aceita conexões externas desnecessárias** (verificar `pg_hba.conf`)
- [ ] **Variáveis de ambiente são injetadas pelo sistema de deploy** (não commitar `.env`)
- [ ] **Logs de erro NÃO expõem credenciais ou stack traces em produção**

---

## 📖 GLOSSÁRIO TÉCNICO

| Termo | Definição |
|-------|-----------|
| **Pool de Conexões** | Técnica que reutiliza conexões TCP abertas com o banco de dados, evitando overhead de criar/destruir conexões a cada requisição |
| **Middleware** | Função que intercepta requisições HTTP antes de chegarem ao handler final, permitindo processamento intermediário (ex: autenticação, logging) |
| **CORS** | Mecanismo de segurança do navegador que bloqueia requisições HTTP entre diferentes origens (domínio/porta) |
| **REST API** | Arquitetura de comunicação que usa verbos HTTP (GET, POST, etc.) para realizar operações em recursos |
| **dotenv** | Padrão de armazenar configurações em arquivo `.env` separado do código-fonte |
| **Query** | Comando SQL enviado ao banco de dados para ler/escrever dados |

---

## 🎯 EXERCÍCIOS PRÁTICOS PARA ALUNOS

### Exercício 1: Simulação de Falha
1. Renomeie o arquivo `.env` para `.env.backup`
2. Tente iniciar o servidor
3. Documente o erro obtido e explique tecnicamente a causa

### Exercício 2: Mudança de Porta
1. Modifique a porta do servidor de 4000 para 8080
2. Liste TODOS os arquivos que precisam ser alterados (código, documentação, testes)
3. Teste a aplicação na nova porta

### Exercício 3: Configuração de CORS Restritivo
1. Modifique `app.js` para aceitar requisições APENAS de `http://localhost:5173`
2. Teste com frontend rodando em outra porta (ex: 3000) e documente o erro
3. Explique por que isso aumenta a segurança

### Exercício 4: Análise de Logs
1. Force um erro de conexão ao banco (senha errada no `.env`)
2. Capture o log de erro completo
3. Identifique quais informações NÃO deveriam aparecer em produção

---

## 📞 TROUBLESHOOTING RÁPIDO

| Erro | Causa Provável | Solução Rápida |
|------|----------------|----------------|
| `Cannot find module 'express'` | `npm install` não foi executado | `npm install` |
| `ECONNREFUSED ::1:5432` | PostgreSQL não está rodando | `sudo systemctl start postgresql` |
| `password authentication failed` | Credenciais erradas no `.env` | Verificar `DB_USER` e `DB_PASSWORD` |
| `EADDRINUSE :::4000` | Porta 4000 em uso | `lsof -i :4000` e `kill <PID>` |
| `CORS policy blocked` | CORS não configurado/restritivo demais | Verificar `app.use(cors())` em `app.js` |

---

## 📚 REFERÊNCIAS TÉCNICAS

- [Express.js Documentation](https://expressjs.com/)
- [PostgreSQL Official Docs](https://www.postgresql.org/docs/)
- [node-postgres (pg) Guide](https://node-postgres.com/)
- [MDN: CORS Explained](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [The Twelve-Factor App](https://12factor.net/) - Boas práticas de deploy

---

**Versão do Documento:** 1.0  
**Última Atualização:** Fevereiro 2026  
**Autor:** Material Didático para Implantação de Sistemas  
