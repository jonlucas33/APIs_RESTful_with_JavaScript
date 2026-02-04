// ==========================================================
// 📦 MOCK DE DADOS - Cardápio
// ==========================================================
// 
// RESPONSABILIDADE: Armazenar APENAS os dados brutos do cardápio.
// 
// PRINCÍPIO: Separation of Concerns
// - Este arquivo NÃO sabe COMO os dados serão inseridos no banco
// - Este arquivo NÃO possui lógica de INSERT
// - Este arquivo APENAS exporta um array de objetos JavaScript
// 
// VANTAGENS:
// ✅ Facilita testes unitários (pode importar em qualquer lugar)
// ✅ Permite reutilizar dados em diferentes contextos
// ✅ Dados podem ser versionados independentemente da lógica
// ✅ Facilita adicionar/remover itens sem mexer em SQL
// 
// ==========================================================

/**
 * Dados do cardápio do restaurante
 * Cada objeto representa um item disponível para venda
 */
const cardapioData = [
  {
    nome: 'Prato Feito',
    preco: 13.00,
    descricao: 'Arroz, feijão, bife e salada'
  },
  {
    nome: 'Suco de Laranja',
    preco: 8.00,
    descricao: 'Suco natural 500ml'
  },
  {
    nome: 'Hambúrguer Artesanal',
    preco: 35.00,
    descricao: 'Pão, carne 180g, queijo e batata'
  },
  {
    nome: 'Pizza Margherita',
    preco: 40.00,
    descricao: 'Pizza tradicional italiana'
  },
  {
    nome: 'Refrigerante',
    preco: 7.00,
    descricao: 'Lata 350ml'
  },
  {
    nome: 'Doce',
    preco: 7.00,
    descricao: 'Sobremesa do dia'
  }
];

module.exports = cardapioData;
