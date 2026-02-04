// ==========================================================
// 📚 ARQUIVO DE MOCK - Backup dos Dados Originais
// ==========================================================
// 
// PROPÓSITO DIDÁTICO:
// Este arquivo mantém os dados originais que antes estavam em
// database.js (quando usávamos banco em memória).
// 
// Agora que database.js virou apenas uma CONEXÃO com PostgreSQL,
// precisamos deste arquivo para:
// 1. Servir de fonte de dados para o script de seed
// 2. Manter um backup estruturado dos dados iniciais
// 3. Facilitar testes unitários (não precisam de banco real)
// 4. Documentar a estrutura de dados do sistema
//
// ==========================================================

// Array que representa o cardápio do restaurante
const cardapio = [
  { 
    id: 1, 
    nome: 'Prato Feito', 
    preco: 13.00, 
    descricao: 'Arroz, feijão, bife e salada' 
  },
  { 
    id: 2, 
    nome: 'Suco de Laranja', 
    preco: 8.00, 
    descricao: 'Suco natural 500ml' 
  },
  { 
    id: 3, 
    nome: 'Hambúrguer Artesanal', 
    preco: 35.00, 
    descricao: 'Pão, carne 180g, queijo e batata' 
  },
  { 
    id: 4, 
    nome: 'Pizza Margherita', 
    preco: 40.00, 
    descricao: 'Pizza tradicional italiana' 
  },
  { 
    id: 5, 
    nome: 'Refrigerante', 
    preco: 7.00, 
    descricao: 'Lata 350ml' 
  },
  { 
    id: 6, 
    nome: 'Doce', 
    preco: 7.00, 
    descricao: 'Sobremesa do dia' 
  }
];

// Array de comandas (pedidos) - vazio inicialmente
// Mantido aqui para compatibilidade futura
const comandas = [];

// Exporta os dados para serem usados em outros arquivos
module.exports = {
  cardapio,
  comandas
};
