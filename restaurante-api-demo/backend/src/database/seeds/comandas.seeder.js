// ==========================================================
// 🌱 SEEDER - Comandas
// ==========================================================
// 
// RESPONSABILIDADE: Inserir dados de comandas (pedidos) no PostgreSQL.
// 
// OBSERVAÇÕES IMPORTANTES:
// 
// 1. DEPENDÊNCIA:
//    - Este seeder DEVE rodar DEPOIS do cardapio.seeder
//    - Motivo: Os itens das comandas referenciam IDs do cardápio
//    - Se rodar antes, pode haver inconsistência de dados
// 
// 2. TIPO JSONB:
//    - O campo 'itens' é do tipo JSONB no PostgreSQL
//    - PostgreSQL aceita diretamente JSON.stringify() ou objetos JS
//    - Não precisa escapar manualmente, o driver 'pg' faz isso
// 
// 3. TRANSAÇÃO:
//    - Se este seeder falhar, o cardápio também será revertido (ROLLBACK)
//    - Garante que TODOS os dados são inseridos ou NENHUM é inserido
// 
// ==========================================================

const comandasData = require('../mocks/comandas.mock');

/**
 * Popula a tabela 'comandas' com dados iniciais
 * 
 * @param {Object} client - Cliente PostgreSQL dentro de uma transação
 * @returns {Promise<void>}
 * 
 * @example
 * const client = await pool.connect();
 * await client.query('BEGIN');
 * await seedCardapio(client);  // Primeiro!
 * await seedComandas(client);  // Depois!
 * await client.query('COMMIT');
 */
async function seedComandas(client) {
  console.log('   📝 Populando tabela: comandas...');
  
  // ========== LIMPEZA DA TABELA ==========
  await client.query('TRUNCATE TABLE comandas RESTART IDENTITY CASCADE');
  console.log('      🧹 Tabela limpa');

  // ========== INSERÇÃO DOS DADOS ==========
  let contador = 0;
  
  for (const comanda of comandasData) {
    // Query parametrizada com JSONB
    const queryText = `
      INSERT INTO comandas (mesa, status, itens, total) 
      VALUES ($1, $2, $3, $4)
    `;
    
    // O driver 'pg' converte automaticamente objetos JS para JSONB
    // Não precisa fazer JSON.stringify() manualmente
    const values = [
      comanda.mesa,
      comanda.status,
      JSON.stringify(comanda.itens), // Convertendo para JSON string
      comanda.total
    ];
    
    await client.query(queryText, values);
    contador++;
  }
  
  console.log(`      ✅ ${contador} comandas inseridas\n`);
}

module.exports = seedComandas;
