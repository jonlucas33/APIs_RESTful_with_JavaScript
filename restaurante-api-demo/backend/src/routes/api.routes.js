// Arquivo de Rotas da API
// Este é o "livro de pedidos" que define todos os endpoints disponíveis

const express = require('express');
const router = express.Router();

// Importa os controladores
const cardapioController = require('../controllers/cardapio.controller');
// const comandasController = require('../controllers/comandas.controller');

// ========== ROTAS DO CARDÁPIO ==========
// GET /api/cardapio - Retorna todo o cardápio
router.get('/cardapio', cardapioController.listarCardapio);

// // GET /api/cardapio/:id - Retorna um item específico do cardápio
// router.get('/cardapio/:id', cardapioController.getCardapioItem);

// // ========== ROTAS DAS COMANDAS ==========
// // GET /api/comandas - Retorna todas as comandas
// router.get('/comandas', comandasController.getComandas);

// // POST /api/comandas - Cria uma nova comanda
// router.post('/comandas', comandasController.createComanda);

// // PATCH /api/comandas/:id - Atualiza o status de uma comanda
// router.patch('/comandas/:id', comandasController.updateComandaStatus);

// // DELETE /api/comandas/:id - Deleta uma comanda
// router.delete('/comandas/:id', comandasController.deleteComanda);

// Exporta o router para ser usado no server.js
module.exports = router;
