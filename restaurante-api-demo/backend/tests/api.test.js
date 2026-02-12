// ==================================================================
// ARQUIVO: backend/tests/api.test.js
// OBJETIVO: Testar todas as rotas da API e garantir a integridade
// ==================================================================

const request = require('supertest');
const app = require('../app'); // Importa sua aplicação Express
//const { resetComandas } = require('../src/services/database'); // Importa função para limpar dados

// HOOK GLOBAL
// beforeAll pode ser usado para subir banco, etc.
// beforeEach roda ANTES de cada 'it' ou 'test'.
// beforeEach(() => {
//   resetComandas(); // Zera o "banco de dados" na memória para evitar sujeira de um teste afetar outro
// });

// ==================================================================
// GRUPO 1: CARDÁPIO (Apenas Leitura)
// ==================================================================
describe('🥕 Rotas de Cardápio', () => {
  
  // Teste de Caminho Feliz (Happy Path)
  it('GET /api/cardapio - Deve retornar status 200 e lista de pratos', async () => {
    const response = await request(app).get('/api/cardapio');
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('sucesso', true);
    expect(Array.isArray(response.body.dados)).toBe(true);
    expect(response.body.dados.length).toBeGreaterThan(0); // Garante que tem comida no menu!
  });

  // Teste de Estrutura de Dados (Contrato)
  it('GET /api/cardapio - Deve garantir que os pratos tenham nome e preço', async () => {
    const response = await request(app).get('/api/cardapio');
    const prato = response.body.dados[0];
    
    // Verificamos se as chaves existem. Se alguém mudar "nome" para "titulo" no back, esse teste quebra.
    expect(prato).toHaveProperty('id');
    expect(prato).toHaveProperty('nome');
    expect(prato).toHaveProperty('preco');
  });

  // Teste de Busca Específica
  it('GET /api/cardapio/:id - Deve retornar o prato correto pelo ID', async () => {
    const response = await request(app).get('/api/cardapio/1');
    
    expect(response.status).toBe(200);
    expect(response.body.dados).toHaveProperty('nome', 'Prato Feito');
    expect(response.body.dados).toHaveProperty('preco'); // MySQL DECIMAL retorna como string
    expect(parseFloat(response.body.dados.preco)).toBe(13.00); // Valida o valor numérico
  });

  // Teste de Erro (Caminho Triste)
  it('GET /api/cardapio/:id - Deve retornar 404 se o prato não existir', async () => {
    const response = await request(app).get('/api/cardapio/9999');
    expect(response.status).toBe(404);
    expect(response.body.sucesso).toBe(false);
  });
});

// ==================================================================
// GRUPO 2: COMANDAS (CRUD Completo)
// ==================================================================
describe('📝 Rotas de Comandas', () => {

  // --- LEITURA ---
  it('GET /api/comandas - Deve iniciar vazio ou com array limpo', async () => {
    const response = await request(app).get('/api/comandas');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.dados)).toBe(true);
  });

  // --- CRIAÇÃO ---
  it('POST /api/comandas - Deve criar uma comanda com sucesso (201)', async () => {
    const novoPedido = {
      mesa: 5, // Banco espera INTEGER
      itens: [1, 2], // Array de IDs (simplificado para teste)
      total: 33.00
    };

    const response = await request(app)
      .post('/api/comandas')
      .send(novoPedido);

    expect(response.status).toBe(201); // Created
    expect(response.body.dados).toHaveProperty('id'); // O ID deve ser gerado automaticamente
    expect(response.body.dados.status).toBe('pendente'); // Status padrão
    expect(response.body.dados.mesa).toBe(5);
  });

  it('POST /api/comandas - Deve recusar pedido sem mesa (Validação)', async () => {
    const pedidoInvalido = {
      itens: [1],
      total: 25.00
      // Faltou a mesa!
    };

    const response = await request(app)
      .post('/api/comandas')
      .send(pedidoInvalido);

    expect(response.status).toBe(400); // Bad Request
    expect(response.body.sucesso).toBe(false);
  });

  // --- ATUALIZAÇÃO (PATCH) ---
  it('PATCH /api/comandas/:id - Deve atualizar o status do pedido', async () => {
    // 1. Setup: Criar uma comanda primeiro
    const criacao = await request(app).post('/api/comandas').send({
      mesa: 10, // INTEGER
      itens: [1], 
      total: 25
    });
    const idComanda = criacao.body.dados.id;

    // 2. Ação: Mudar status (lowercase com underscore conforme banco)
    const atualizacao = await request(app)
      .patch(`/api/comandas/${idComanda}`)
      .send({ status: 'em_preparo' });

    // 3. Asserção
    expect(atualizacao.status).toBe(200);
    expect(atualizacao.body.dados.status).toBe('em_preparo'); // Estrutura: { dados: { status: ... } }
  });

  it('PATCH /api/comandas/:id - Deve retornar 404 ao tentar atualizar ID inexistente', async () => {
    const response = await request(app)
      .patch('/api/comandas/999999') // ID que não existe
      .send({ status: 'pronto' }); // lowercase
    
    expect(response.status).toBe(404);
    expect(response.body.sucesso).toBe(false);
  });

  // --- DELEÇÃO ---
  it('DELETE /api/comandas/:id - Deve apagar uma comanda', async () => {
    // 1. Setup
    const criacao = await request(app).post('/api/comandas').send({
      mesa: 99, // INTEGER
      itens: [1], 
      total: 25
    });
    const id = criacao.body.dados.id;

    // 2. Ação
    const delecao = await request(app).delete(`/api/comandas/${id}`);
    expect(delecao.status).toBe(200);
    expect(delecao.body.sucesso).toBe(true);

    // 3. Verificação Dupla (Garantir que sumiu mesmo)
    const busca = await request(app).get('/api/comandas');
    const achou = busca.body.dados.find(c => c.id === id);
    expect(achou).toBeUndefined();
  });
});

// ==================================================================
// GRUPO 3: TDD (Test Driven Development) - O FUTURO
// Estes testes falharão até que implementemos as regras de negócio.
// ==================================================================

describe('🚀 Regras de Negócio (TDD - Cenários Futuros)', () => {
  it('POST /api/comandas - Não deve permitir comandas sem itens', async () => {
    const pedidoSemItens = {
      mesa: 1, // INTEGER
      itens: [], // Array vazio
      total: 0
    };

    const response = await request(app).post('/api/comandas').send(pedidoSemItens);
    expect(response.status).toBe(400);
    expect(response.body.sucesso).toBe(false);
  });
});


// // Testes da API do Restaurante
// // Testando os endpoints existentes (testes de regressão)

// const request = require('supertest');
// const app = require('../app');
// const { resetComandas } = require('../src/services/database');

// // Hook que roda ANTES de cada teste
// // Garante que cada teste comece com um estado limpo
// beforeEach(() => {
//   resetComandas(); // Limpa o array de comandas
// });

// // ========== TESTES DO CARDÁPIO ==========
// describe('GET /api/cardapio', () => {
//   it('deve retornar status 200 e o cardápio completo', async () => {
//     const response = await request(app).get('/api/cardapio');
    
//     expect(response.status).toBe(200);
//     expect(response.body).toHaveProperty('sucesso', true);
//     expect(response.body).toHaveProperty('dados');
//     expect(Array.isArray(response.body.dados)).toBe(true);
//     expect(response.body.dados.length).toBeGreaterThan(0);
//   });

//   it('deve retornar itens com as propriedades corretas', async () => {
//     const response = await request(app).get('/api/cardapio');
    
//     const primeiroItem = response.body.dados[0];
//     expect(primeiroItem).toHaveProperty('id');
//     expect(primeiroItem).toHaveProperty('nome');
//     expect(primeiroItem).toHaveProperty('preco');
//     expect(primeiroItem).toHaveProperty('descricao');
//   });
// });

// // ========== TESTES DO CARDÁPIO POR ID (TDD - Novo Endpoint) ==========
// describe('GET /api/cardapio/:id', () => {
//   it('deve retornar um item específico do cardápio', async () => {
//     const response = await request(app).get('/api/cardapio/1');
    
//     expect(response.status).toBe(200);
//     expect(response.body).toHaveProperty('id', 1);
//     expect(response.body).toHaveProperty('nome', 'Prato Feito');
//     expect(response.body).toHaveProperty('preco', 25.00);
//   });

//   it('deve retornar 404 se o item não existir', async () => {
//     const response = await request(app).get('/api/cardapio/999');
    
//     expect(response.status).toBe(404);
//     expect(response.body).toHaveProperty('message');
//   });
// });

// // ========== TESTES DAS COMANDAS ==========
// describe('GET /api/comandas', () => {
//   it('deve retornar status 200 e um array de comandas', async () => {
//     const response = await request(app).get('/api/comandas');
    
//     expect(response.status).toBe(200);
//     expect(response.body).toHaveProperty('sucesso', true);
//     expect(response.body).toHaveProperty('dados');
//     expect(Array.isArray(response.body.dados)).toBe(true);
//   });
// });

// describe('POST /api/comandas', () => {
//   it('deve criar uma nova comanda e retornar status 201', async () => {
//     const novaComanda = {
//       mesa: 'Mesa 5',
//       itens: [1, 2],
//       total: 33.00
//     };

//     const response = await request(app)
//       .post('/api/comandas')
//       .send(novaComanda);

//     expect(response.status).toBe(201);
//     expect(response.body).toHaveProperty('sucesso', true);
//     expect(response.body).toHaveProperty('dados');
//     expect(response.body.dados).toHaveProperty('id');
//     expect(response.body.dados).toHaveProperty('mesa', 'Mesa 5');
//     expect(response.body.dados).toHaveProperty('total', 33.00);
//     expect(response.body.dados).toHaveProperty('status', 'pendente');
//   });

//   it('deve retornar erro 400 se faltar dados obrigatórios', async () => {
//     const comandaIncompleta = {
//       mesa: 'Mesa 3'
//       // Faltam 'itens' e 'total'
//     };

//     const response = await request(app)
//       .post('/api/comandas')
//       .send(comandaIncompleta);

//     expect(response.status).toBe(400);
//     expect(response.body).toHaveProperty('sucesso', false);
//   });
// });

// // ========== TESTES DE ATUALIZAÇÃO DE COMANDAS (TDD - PATCH) ==========
// describe('PATCH /api/comandas/:id', () => {
//   // Limpa as comandas antes de cada teste deste bloco
//   beforeEach(() => {
//     resetComandas();
//   });

//   it('deve atualizar o status de uma comanda existente', async () => {
//     // 1. Criar uma comanda para poder atualizá-la
//     const newComandaRes = await request(app)
//       .post('/api/comandas')
//       .send({ mesa: 'Mesa 10', itens: [1], total: 25 });
    
//     const comandaCriada = newComandaRes.body.dados;
//     const comandaId = comandaCriada.id;

//     // 2. Tentar atualizar o status daquela comanda
//     const novoStatus = { status: 'Em Preparo' };
//     const updateRes = await request(app)
//       .patch(`/api/comandas/${comandaId}`)
//       .send(novoStatus);

//     // 3. Verificar o resultado
//     expect(updateRes.status).toBe(200);
//     expect(updateRes.body).toHaveProperty('id', comandaId);
//     expect(updateRes.body).toHaveProperty('status', 'Em Preparo'); // O status deve ter mudado
//     expect(updateRes.body).toHaveProperty('mesa', 'Mesa 10'); // O resto deve continuar igual
//   });

//   it('deve retornar 404 se a comanda não existir', async () => {
//     const novoStatus = { status: 'Em Preparo' };
//     const response = await request(app)
//       .patch('/api/comandas/999') // ID que não existe
//       .send(novoStatus);

//     expect(response.status).toBe(404);
//     expect(response.body).toHaveProperty('sucesso', false);
//   });

//   it('deve permitir atualizar para diferentes status', async () => {
//     // Criar uma comanda
//     const newComandaRes = await request(app)
//       .post('/api/comandas')
//       .send({ mesa: 'Mesa 15', itens: [2, 3], total: 53 });
    
//     const comandaId = newComandaRes.body.dados.id;

//     // Atualizar para "Pronto"
//     const updateRes = await request(app)
//       .patch(`/api/comandas/${comandaId}`)
//       .send({ status: 'Pronto' });

//     expect(updateRes.status).toBe(200);
//     expect(updateRes.body.status).toBe('Pronto');
//   });
// });

// // ==================== Testes do DELETE /api/comandas/:id ====================
// describe('DELETE /api/comandas/:id', () => {
//   test('deve deletar uma comanda existente e retornar 200', async () => {
//     // Criar uma comanda para deletar
//     const newComandaRes = await request(app)
//       .post('/api/comandas')
//       .send({ mesa: 'Mesa Delete', itens: [1], total: 25 });
    
//     const comandaId = newComandaRes.body.dados.id;

//     // Deletar a comanda
//     const deleteRes = await request(app)
//       .delete(`/api/comandas/${comandaId}`);

//     expect(deleteRes.status).toBe(200);
//     expect(deleteRes.body.sucesso).toBe(true);
//     expect(deleteRes.body.mensagem).toContain('deletada com sucesso');

//     // Verificar que a comanda realmente foi removida
//     const getRes = await request(app).get('/api/comandas');
//     const comandaEncontrada = getRes.body.dados.find(c => c.id === comandaId);
//     expect(comandaEncontrada).toBeUndefined();
//   });

//   test('deve retornar 404 ao tentar deletar comanda inexistente', async () => {
//     const deleteRes = await request(app)
//       .delete('/api/comandas/999999');

//     expect(deleteRes.status).toBe(404);
//     expect(deleteRes.body.sucesso).toBe(false);
//     expect(deleteRes.body.mensagem).toContain('não encontrada');
//   });

//   test('deve deletar apenas a comanda especificada', async () => {
//     // Criar duas comandas
//     const comanda1 = await request(app)
//       .post('/api/comandas')
//       .send({ mesa: 'Mesa 1', itens: [1], total: 25 });
    
//     const comanda2 = await request(app)
//       .post('/api/comandas')
//       .send({ mesa: 'Mesa 2', itens: [2], total: 30 });
    
//     const id1 = comanda1.body.dados.id;
//     const id2 = comanda2.body.dados.id;

//     // Deletar apenas a primeira
//     await request(app).delete(`/api/comandas/${id1}`);

//     // Verificar que apenas a primeira foi deletada
//     const getRes = await request(app).get('/api/comandas');
//     const comandas = getRes.body.dados;
    
//     expect(comandas.find(c => c.id === id1)).toBeUndefined();
//     expect(comandas.find(c => c.id === id2)).toBeDefined();
//   });
// });
