// ==========================================================
// 🌱 SEEDER - Cardápio
// ==========================================================
// 
// RESPONSABILIDADE: Inserir dados do cardápio no PostgreSQL.
// 
// PRINCÍPIO: Separation of Concerns
// - Este arquivo NÃO conhece os dados (importa do mock)
// - Este arquivo NÃO gerencia transações (recebe client como parâmetro)
// - Este arquivo APENAS sabe COMO inserir dados na tabela cardapio
// 
// TRANSACTION-AWARE:
// - Recebe 'client' ao invés de usar 'pool.query()'
// - O client está dentro de uma transação (BEGIN...COMMIT)
// - Se este seeder falhar, o ROLLBACK será feito pelo Maestro
// 
// SEGURANÇA:
// - Usa Prepared Statements ($1, $2, $3) para evitar SQL Injection
// - Nunca concatena strings diretamente no SQL
// 
// ==========================================================

const cardapioData = require('../mocks/cardapio.mock');

/**
 * Popula a tabela 'cardapio' com dados iniciais
 * 
 * @param {Object} client - Cliente PostgreSQL dentro de uma transação
 * @returns {Promise<void>}
 * 
 * @example
 * const client = await pool.connect();
 * await client.query('BEGIN');
 * await seedCardapio(client);
 * await client.query('COMMIT');
 */
async function seedCardapio(client) {
  console.log('   📋 Populando tabela: cardapio...');
  
  // ========== LIMPEZA DA TABELA ==========
  // TRUNCATE remove todos os dados e reseta o auto-increment (SERIAL)
  // RESTART IDENTITY: Faz o próximo ID começar em 1
  // CASCADE: Se outras tabelas dependem desta, também limpa (cuidado!)
  await client.query('TRUNCATE TABLE cardapio RESTART IDENTITY CASCADE');
  console.log('      🧹 Tabela limpa');

  // ========== INSERÇÃO DOS DADOS ==========
  let contador = 0;
  
  for (const item of cardapioData) {
    // Query parametrizada: $1, $2, $3 são placeholders seguros
    const queryText = `
      INSERT INTO cardapio (nome, preco, descricao) 
      VALUES ($1, $2, $3)
    `;
    
    // Array de valores que substituem os placeholders na ordem
    const values = [item.nome, item.preco, item.descricao];
    
    // Executa INSERT dentro da transação do client
    await client.query(queryText, values);
    contador++;
  }
  
  console.log(`      ✅ ${contador} itens inseridos no cardápio\n`);
}

module.exports = seedCardapio;
