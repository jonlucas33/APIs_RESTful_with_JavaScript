const db = require('../services/database');

const listarCardapio = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM cardapio'); 

    res.json({
      sucesso: true,
      dados: rows
    });
  } catch (erro) {
    console.error(erro); // Log para ajudar no debug do Render
    res.status(500).json({ sucesso: false, mensagem: "Erro ao acessar o banco" });
  }
};

// // // Controlador do Cardápio
// // // Este arquivo é como o "Chef de Cozinha" que mostra o menu aos clientes

// // const { cardapio } = require('../services/database');

// // // Função que retorna todo o cardápio
// // // Quando o cliente pede para ver o menu, essa função é executada
// // const getCardapio = async (req, res) => {
// //   try {

// //     console.log("Veio buscar o cardápio")
// //     // Retorna o array do cardápio com status 200 (OK)
// //     res.status(200).json({
// //       sucesso: true,
// //       mensagem: 'Cardápio recuperado com sucesso',
// //       dados: cardapio
// //     });
// //   } catch (error) {
// //     // Se algo der errado, retorna erro 500
// //     res.status(500).json({
// //       sucesso: false,
// //       mensagem: 'Erro ao buscar cardápio',
// //       erro: error.message
// //     });
// //   }
// // };

// // Função que retorna um item específico do cardápio pelo ID
// // Busca um item usando o parâmetro de rota :id
// const getCardapioItem = (req, res) => {
//   try {
//     // Pega o ID do parâmetro da URL e converte para número
//     const id = parseInt(req.params.id);

//     // Busca o item no array do cardápio
//     const item = cardapio.find(item => item.id === id);

//     // Se o item não foi encontrado, retorna 404
//     if (!item) {
//       return res.status(404).json({
//         message: 'Item não encontrado'
//       });
//     }

//     // Se encontrou, retorna o item
//     res.status(200).json(item);
//   } catch (error) {
//     // Se algo der errado, retorna erro 500
//     res.status(500).json({
//       sucesso: false,
//       mensagem: 'Erro ao buscar item do cardápio',
//       erro: error.message
//     });
//   }
// };

// Exporta as funções para serem usadas nas rotas
 module.exports = {
   listarCardapio
 };
