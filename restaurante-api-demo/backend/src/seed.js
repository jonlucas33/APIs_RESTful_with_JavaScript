// ==========================================================
// 🎭 MAESTRO DE SEEDS - Orquestrador de População do Banco
// ==========================================================
// 
// RESPONSABILIDADE: Coordenar a execução de TODOS os seeders.
// 
// ARQUITETURA: Runner Pattern (Orquestrador)
// - Importa todos os seeders individuais
// - Define a ORDEM de execução (respeitando dependências)
// - Gerencia TRANSAÇÕES (BEGIN/COMMIT/ROLLBACK)
// - Garante ATOMICIDADE (tudo ou nada)
// 
// ==========================================================
// 🎓 POR QUE USAR UM MAESTRO E TRANSAÇÕES?
// ==========================================================
// 
// PROBLEMA SEM MAESTRO:
// ❌ Rodar: node cardapio.seeder.js
// ❌ Rodar: node comandas.seeder.js
// 
// Problemas:
// 1. Se comandas.seeder falhar, o cardápio JÁ foi inserido (inconsistente!)
// 2. Difícil garantir a ordem correta
// 3. Cada script abre/fecha conexão (overhead)
// 4. Não há rollback automático
// 
// SOLUÇÃO COM MAESTRO + TRANSAÇÃO:
// ✅ Uma ÚNICA transação para TODOS os seeders
// ✅ Se QUALQUER seeder falhar → ROLLBACK em TUDO
// ✅ Garante ordem de execução (cardápio antes de comandas)
// ✅ Uma conexão reutilizada para tudo (performance)
// 
// CONCEITOS ACID:
// - Atomicidade: Tudo ou nada (se falhar, volta ao estado inicial)
// - Consistência: Dados sempre em estado válido
// - Isolamento: Transação não afeta outras operações
// - Durabilidade: Após COMMIT, dados são permanentes
// 
// ==========================================================

const { Pool } = require('pg');
require('dotenv').config();

// Importar todos os seeders
const seedCardapio = require('./database/seeds/cardapio.seeder');
const seedComandas = require('./database/seeds/comandas.seeder');

// Configurar Pool de conexões
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

/**
 * Função principal que orquestra todos os seeders
 * Usa uma TRANSAÇÃO para garantir atomicidade
 */
async function runSeeders() {
  // Obtém um client do pool (conexão dedicada)
  const client = await pool.connect();
  
  try {
    console.log('\n🌱 INICIANDO PROCESSO DE SEEDING');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    // ========== INICIA TRANSAÇÃO ==========
    console.log('🔄 Iniciando transação SQL (BEGIN)...\n');
    await client.query('BEGIN');
    
    // ========== EXECUTA SEEDERS NA ORDEM CORRETA ==========
    // IMPORTANTE: Ordem importa! Respeite dependências.
    
    // 1. Cardápio (não depende de ninguém)
    await seedCardapio(client);
    
    // 2. Comandas (depende de cardápio)
    await seedComandas(client);
    
    // Adicione mais seeders aqui conforme necessário:
    // await seedUsuarios(client);
    // await seedPagamentos(client);
    
    // ========== COMMIT DA TRANSAÇÃO ==========
    console.log('✅ Todos os seeders executados com sucesso!');
    console.log('💾 Fazendo COMMIT da transação...\n');
    await client.query('COMMIT');
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 SEEDING CONCLUÍDO COM SUCESSO!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
  } catch (error) {
    // ========== ROLLBACK EM CASO DE ERRO ==========
    console.error('\n❌ ERRO DURANTE O SEEDING!');
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error(`Mensagem: ${error.message}`);
    
    if (error.code) {
      console.error(`Código PostgreSQL: ${error.code}`);
    }
    
    console.error('\n🔙 Fazendo ROLLBACK da transação...');
    console.error('   (Todos os dados inseridos serão REVERTIDOS)\n');
    
    await client.query('ROLLBACK');
    
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('💡 DICAS DE SOLUÇÃO:');
    console.error('   1. Verifique se o PostgreSQL está rodando');
    console.error('   2. Confirme as credenciais no arquivo .env');
    console.error('   3. Execute init-database.sql antes do seed');
    console.error('   4. Verifique se as tabelas existem no banco\n');
    
    // Encerra com código de erro
    process.exit(1);
    
  } finally {
    // ========== LIBERA O CLIENT ==========
    // Sempre libera a conexão, mesmo se houver erro
    client.release();
    console.log('👋 Conexão com o banco encerrada.\n');
    
    // Encerra o pool para fechar todas as conexões
    await pool.end();
    
    // Encerra o processo Node.js
    process.exit(0);
  }
}

// ========== VALIDAÇÃO PRÉ-EXECUÇÃO ==========
/**
 * Valida se as variáveis de ambiente estão configuradas
 */
function validarConfiguracao() {
  const variaveisObrigatorias = ['DB_USER', 'DB_HOST', 'DB_DATABASE', 'DB_PASSWORD', 'DB_PORT'];
  const faltando = variaveisObrigatorias.filter(v => !process.env[v]);
  
  if (faltando.length > 0) {
    console.error('❌ ERRO: Variáveis de ambiente faltando no .env:');
    console.error(`   ${faltando.join(', ')}\n`);
    console.error('💡 Crie um arquivo .env na raiz de backend/ com:');
    console.error('   DB_USER=postgres');
    console.error('   DB_HOST=localhost');
    console.error('   DB_DATABASE=restaurante_db');
    console.error('   DB_PASSWORD=sua_senha');
    console.error('   DB_PORT=5432\n');
    process.exit(1);
  }
}

// ========== EXECUÇÃO ==========
validarConfiguracao();
runSeeders();
