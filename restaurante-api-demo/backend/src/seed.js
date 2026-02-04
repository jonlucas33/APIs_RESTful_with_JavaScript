// ==========================================================
// 🌱 SCRIPT DE SEED - Alimentação do Banco de Dados
// ==========================================================
//
// PROPÓSITO: Popular o banco de dados com dados iniciais.
//
// Este script realiza uma operação de ETL simplificada:
// E - Extract (Extração): Lê dados do arquivo database_mock.js
// T - Transform (Transformação): Formata para queries parametrizadas
// L - Load (Carga): Insere no PostgreSQL usando transações seguras
//
// ==========================================================
// 📚 CONCEITOS IMPORTANTES PARA ALUNOS:
// ==========================================================
//
// 1. QUERIES PARAMETRIZADAS ($1, $2, $3):
//    ✅ Seguro contra SQL Injection
//    ❌ NUNCA faça: `INSERT INTO tabela VALUES ('${valor}')`
//    ✅ SEMPRE faça: `INSERT INTO tabela VALUES ($1)` + [valor]
//
// 2. TRUNCATE vs DELETE:
//    - TRUNCATE: Limpa TODA a tabela, reseta IDs, é RÁPIDO
//    - DELETE: Remove linha por linha, mantém IDs, é LENTO
//    - RESTART IDENTITY: Reseta o contador de SERIAL (id volta para 1)
//    - CASCADE: Remove dados de tabelas relacionadas (foreign keys)
//
// 3. ASYNC/AWAIT:
//    - Operações de banco são ASSÍNCRONAS (não bloqueiam o código)
//    - await espera a query terminar antes de continuar
//    - try/catch captura erros de conexão ou SQL
//
// 4. PROCESS.EXIT:
//    - Scripts de seed NÃO são servidores (não ficam rodando)
//    - Após popular o banco, devemos ENCERRAR o processo
//    - Sem exit(), o Pool fica aberto e o script nunca termina
//
// ==========================================================

const db = require('./services/database');
const { cardapio } = require('./services/database_mock');

/**
 * Função principal que popula o banco com dados do mock
 */
async function popularBanco() {
  try {
    console.log('🌱 Iniciando o Seeding do Cardápio...');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // ========== ETAPA 1: LIMPEZA DA TABELA ==========
    console.log('🧹 Limpando tabela cardapio...');
    
    // TRUNCATE remove todos os dados e reseta o ID para 1
    // RESTART IDENTITY: Faz o próximo INSERT ter id = 1
    // CASCADE: Se outras tabelas dependem de cardapio, também limpa
    await db.query('TRUNCATE TABLE cardapio RESTART IDENTITY CASCADE');
    
    console.log('✅ Tabela limpa com sucesso!\n');

    // ========== ETAPA 2: INSERÇÃO DOS DADOS ==========
    console.log('📝 Inserindo itens do cardápio...\n');

    // Percorre cada item do array mock
    for (const item of cardapio) {
      // Query parametrizada: $1, $2, $3 são substituídos pelos valores do array
      const queryText = 'INSERT INTO cardapio (nome, preco, descricao) VALUES ($1, $2, $3)';
      
      // Array de valores que substituem $1, $2, $3 na ordem
      const values = [item.nome, item.preco, item.descricao];
      
      // Executa a query de forma segura
      await db.query(queryText, values);
      
      console.log(`   ✅ Item adicionado: ${item.nome.padEnd(25)} | R$ ${item.preco.toFixed(2)}`);
    }

    // ========== ETAPA 3: VERIFICAÇÃO ==========
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔍 Verificando dados inseridos...\n');

    const resultado = await db.query('SELECT COUNT(*) as total FROM cardapio');
    const total = resultado.rows[0].total;

    console.log(`📊 Total de itens no cardápio: ${total}`);
    
    if (total === cardapio.length) {
      console.log('✅ Todos os itens foram inseridos corretamente!');
    } else {
      console.warn(`⚠️  Esperado: ${cardapio.length} | Inserido: ${total}`);
    }

    console.log('\n🚀 Seed concluído com sucesso!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    // ========== TRATAMENTO DE ERROS ==========
    console.error('\n❌ ERRO ao popular banco de dados:');
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    // Mensagem amigável do erro
    console.error(`Mensagem: ${error.message}`);
    
    // Detalhes técnicos (útil para debug)
    if (error.code) {
      console.error(`Código do Erro: ${error.code}`);
    }
    
    // Dicas comuns de solução
    console.error('\n💡 Possíveis causas:');
    console.error('   1. PostgreSQL não está rodando');
    console.error('   2. Credenciais erradas no arquivo .env');
    console.error('   3. Tabela "cardapio" não existe (execute init-database.sql primeiro)');
    console.error('   4. Permissões insuficientes no banco de dados\n');
    
    // Em caso de erro, encerra com código 1 (indica falha)
    process.exit(1);
    
  } finally {
    // ========== ENCERRAMENTO DO PROCESSO ==========
    // O finally SEMPRE executa, mesmo se houver erro
    // Encerra o processo para não deixar o Pool aberto
    console.log('👋 Encerrando conexão com o banco...\n');
    process.exit(0); // Código 0 = sucesso
  }
}

// ========== EXECUÇÃO DO SCRIPT ==========
// Chama a função principal
popularBanco();
