const mysql = require('mysql2/promise');
require('dotenv').config();

// Configuração para TiDB / MySQL
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  port: process.env.DB_PORT || 4000,
  ssl: {
    minVersion: 'TLSv1.2',
    rejectUnauthorized: true // TiDB exige conexão segura
  },
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;

// const { Pool } = require('pg');
// require('dotenv').config();

// // Configuração do Pool de conexões usando as variáveis do seu .env
// const pool = new Pool({
//   user: process.env.DB_USER,
//   host: process.env.DB_HOST,
//   database: process.env.DB_DATABASE,
//   password: process.env.DB_PASSWORD,
//   port: process.env.DB_PORT,
// });

// // Teste de conexão inicial (Importante para Validação de Implantação)
// pool.on('connect', () => {
//   console.log('📦 Conectado ao PostgreSQL com sucesso!');
// });

// pool.on('error', (err) => {
//   console.error('❌ Erro inesperado no cliente PostgreSQL', err);
// });

// module.exports = {
//   // Exportamos o método query para ser usado nos controllers
//   query: (text, params) => pool.query(text, params),
// };

// // Simulação de Banco de Dados em Memória
// // Este arquivo funciona como nossa "cozinha" onde guardamos os dados

// // Array que representa o cardápio do restaurante
// const cardapio = [
//   { id: 1, nome: 'Prato Feito', preco: 13.00, descricao: 'Arroz, feijão, bife e salada' },
//   { id: 2, nome: 'Suco de Laranja', preco: 8.00, descricao: 'Suco natural 500ml' },
//   { id: 3, nome: 'Hambúrguer Artesanal', preco: 35.00, descricao: 'Pão, carne 180g, queijo e batata' },
//   { id: 4, nome: 'Piza Margherita', preco: 40.00, descricao: 'Pizza tradicional italiana' },
//   { id: 5, nome: 'Refrigerante', preco: 7.00, descricao: 'Lata 350ml' },
//   { id: 6, nome: 'Doce', preco: 7.00 }
// ];

// // Array que armazenará as comandas (pedidos) dos clientes
// // Inicialmente vazio, será preenchido quando clientes fizerem pedidos
// const comandas = [];

// // Função para resetar o array de comandas (útil para testes)
// // Remove todas as comandas e reseta o array para vazio
// const resetComandas = () => {
//   comandas.length = 0; // Limpa o array sem criar uma nova referência
// };

// // Exportamos os arrays e a função de reset para serem usados em outros arquivos
// module.exports = {
//   cardapio,
//   comandas,
//   resetComandas
// };
