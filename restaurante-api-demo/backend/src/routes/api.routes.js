// ==========================================================
// 📋 ROTAS DA API - Sistema de Restaurante
// ==========================================================
// Define todos os endpoints disponíveis
// Usa MySQL (TiDB Cloud) via mysql2/promise
// ==========================================================

const express = require('express');
const router = express.Router();

// Importa os controladores
const cardapioController = require('../controllers/cardapio.controller');
const comandasController = require('../controllers/comandas.controller');

// ========== ROTAS DO CARDÁPIO ==========

// GET /api/cardapio - Retorna todo o cardápio
router.get('/cardapio', cardapioController.listarCardapio);

// GET /api/cardapio/:id - Retorna um item específico do cardápio
router.get('/cardapio/:id', cardapioController.obterItemCardapio);

// POST /api/cardapio - Cria um novo item no cardápio
router.post('/cardapio', cardapioController.criarItemCardapio);

// PUT /api/cardapio/:id - Atualiza um item do cardápio
router.put('/cardapio/:id', cardapioController.atualizarItemCardapio);

// DELETE /api/cardapio/:id - Remove um item do cardápio
router.delete('/cardapio/:id', cardapioController.deletarItemCardapio);

// ========== ROTAS DAS COMANDAS ==========

// GET /api/comandas - Retorna todas as comandas
router.get('/comandas', comandasController.listarComandas);

// GET /api/comandas/mesa/:numeroMesa - Retorna comandas de uma mesa específica
router.get('/comandas/mesa/:numeroMesa', comandasController.listarComandasPorMesa);

// GET /api/comandas/:id - Retorna uma comanda específica
router.get('/comandas/:id', comandasController.obterComanda);

// POST /api/comandas - Cria uma nova comanda
router.post('/comandas', comandasController.criarComanda);

// PATCH /api/comandas/:id - Atualiza o status de uma comanda
router.patch('/comandas/:id', comandasController.atualizarStatusComanda);

// DELETE /api/comandas/:id - Remove uma comanda
router.delete('/comandas/:id', comandasController.deletarComanda);

// Exporta o router para ser usado no app.js
module.exports = router;
