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

const pool = require('./services/database'); // Importa o pool JÁ CONFIGURADO do database.js
require('dotenv').config();

// Importar os dados (Mocks)
// Certifique-se de que esses arquivos existem nas pastas corretas!
const cardapioData = require('./database/mocks/cardapio.mock');
const comandasData = require('./database/mocks/comandas.mock');

async function runSeeders() {
  let connection;
  try {
    console.log('🌱 Solicitando conexão ao Pool do TiDB/MySQL...');
    connection = await pool.getConnection(); // Pega uma conexão emprestada do Pool central

    try {
      console.log('🔄 Iniciando transação...');
      await connection.beginTransaction();

      // --- SEED CARDÁPIO ---
      console.log('📋 Semeando Cardápio...');
      // MySQL usa TRUNCATE para limpar rápido
      await connection.query('TRUNCATE TABLE cardapio'); 
      
      for (const item of cardapioData) {
        // MySQL usa '?' como placeholder (Prepared Statement)
        await connection.query(
          'INSERT INTO cardapio (nome, preco, descricao) VALUES (?, ?, ?)',
          [item.nome, item.preco, item.descricao]
        );
      }

      // --- SEED COMANDAS ---
      console.log('📝 Semeando Comandas...');
      await connection.query('TRUNCATE TABLE comandas');

      for (const item of comandasData) {
        // MySQL lida bem com JSON, mas stringify garante compatibilidade
        await connection.query(
          'INSERT INTO comandas (mesa, status, itens, total) VALUES (?, ?, ?, ?)',
          [item.mesa, item.status, JSON.stringify(item.itens), item.total]
        );
      }

      await connection.commit();
      console.log('✅ SEED CONCLUÍDO: Dados salvos com sucesso!');

    } catch (err) {
      await connection.rollback();
      console.error('❌ Erro durante a inserção (ROLLBACK realizado):', err);
    } finally {
      if (connection) connection.release(); // Importante: Devolve a conexão para o Pool
    }

  } catch (error) {
    console.error('❌ Erro fatal ao conectar no banco:', error);
    console.error('Dica: Verifique se o IP da sua rede permite acesso ao TiDB Cloud.');
  } finally {
    // Encerra o processo node (senão o terminal fica preso esperando o pool fechar)
    process.exit(); 
  }
}

// ========== EXECUÇÃO ==========
runSeeders();

/**
 * Função principal que orquestra todos os seeders
 * Usa uma TRANSAÇÃO para garantir atomicidade
 */
// async function runSeeders() {
//   // Obtém um client do pool (conexão dedicada)
//   const client = await pool.connect();
  
//   try {
//     console.log('\n🌱 INICIANDO PROCESSO DE SEEDING');
//     console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
//     // ========== INICIA TRANSAÇÃO ==========
//     console.log('🔄 Iniciando transação SQL (BEGIN)...\n');
//     await client.query('BEGIN');
    
//     // ========== EXECUTA SEEDERS NA ORDEM CORRETA ==========
//     // IMPORTANTE: Ordem importa! Respeite dependências.
    
//     // 1. Cardápio (não depende de ninguém)
//     await seedCardapio(client);
    
//     // 2. Comandas (depende de cardápio)
//     await seedComandas(client);
    
//     // Adicione mais seeders aqui conforme necessário:
//     // await seedUsuarios(client);
//     // await seedPagamentos(client);
    
//     // ========== COMMIT DA TRANSAÇÃO ==========
//     console.log('✅ Todos os seeders executados com sucesso!');
//     console.log('💾 Fazendo COMMIT da transação...\n');
//     await client.query('COMMIT');
    
//     console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
//     console.log('🎉 SEEDING CONCLUÍDO COM SUCESSO!');
//     console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
//   } catch (error) {
//     // ========== ROLLBACK EM CASO DE ERRO ==========
//     console.error('\n❌ ERRO DURANTE O SEEDING!');
//     console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
//     console.error(`Mensagem: ${error.message}`);
    
//     if (error.code) {
//       console.error(`Código PostgreSQL: ${error.code}`);
//     }
    
//     console.error('\n🔙 Fazendo ROLLBACK da transação...');
//     console.error('   (Todos os dados inseridos serão REVERTIDOS)\n');
    
//     await client.query('ROLLBACK');
    
//     console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
//     console.error('💡 DICAS DE SOLUÇÃO:');
//     console.error('   1. Verifique se o PostgreSQL está rodando');
//     console.error('   2. Confirme as credenciais no arquivo .env');
//     console.error('   3. Execute init-database.sql antes do seed');
//     console.error('   4. Verifique se as tabelas existem no banco\n');
    
//     // Encerra com código de erro
//     process.exit(1);
    
//   } finally {
//     // ========== LIBERA O CLIENT ==========
//     // Sempre libera a conexão, mesmo se houver erro
//     client.release();
//     console.log('👋 Conexão com o banco encerrada.\n');
    
//     // Encerra o pool para fechar todas as conexões
//     await pool.end();
    
//     // Encerra o processo Node.js
//     process.exit(0);
//   }
// }

// ========== VALIDAÇÃO PRÉ-EXECUÇÃO ==========
/**
 * Valida se as variáveis de ambiente estão configuradas
 */
// function validarConfiguracao() {
//   const variaveisObrigatorias = ['DB_USER', 'DB_HOST', 'DB_DATABASE', 'DB_PASSWORD', 'DB_PORT'];
//   const faltando = variaveisObrigatorias.filter(v => !process.env[v]);
  
//   if (faltando.length > 0) {
//     console.error('❌ ERRO: Variáveis de ambiente faltando no .env:');
//     console.error(`   ${faltando.join(', ')}\n`);
//     console.error('💡 Crie um arquivo .env na raiz de backend/ com:');
//     console.error('   DB_USER=postgres');
//     console.error('   DB_HOST=localhost');
//     console.error('   DB_DATABASE=restaurante_db');
//     console.error('   DB_PASSWORD=sua_senha');
//     console.error('   DB_PORT=5432\n');
//     process.exit(1);
//   }
// }

// // ========== EXECUÇÃO ==========
// validarConfiguracao();
// runSeeders();
