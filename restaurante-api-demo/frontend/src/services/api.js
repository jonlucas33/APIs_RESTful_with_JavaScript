import axios from 'axios';

// Cria uma "instância" do axios com a URL base do nosso back-end
// Isso facilita pois não precisamos repetir a URL completa em cada requisição
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'; // Usa a variável de ambiente ou o localhost

const api = axios.create({
  baseURL: baseURL, // A porta do nosso back-end
});

// Função para buscar o cardápio completo
// Esta função é como o "Garçom" que vai até a "Cozinha" (back-end) pedir o menu
export const listarCardapio = () => {
  console.log('🍽️ Front-end: "Garçom, me traga o cardápio!"');
  return api.get('/cardapio'); // Faz o GET para /api/cardapio
};

// Função para buscar um item específico do cardápio (por ID)
export const getCardapioItem = (id) => {
  console.log(`🍽️ Front-end: "Garçom, me traga informações sobre o item ${id}!"`);
  return api.get(`/cardapio/${id}`);
};

// Função para criar uma nova comanda (pedido)
// (Será usada em uma etapa futura)
export const createComanda = (comanda) => {
  console.log('📝 Front-end: "Garçom, aqui está nosso pedido!"', comanda);
  return api.post('/comandas', comanda);
};

// Função para buscar todas as comandas
export const getComandas = () => {
  console.log('📋 Front-end: "Garçom, quais são os pedidos em aberto?"');
  return api.get('/comandas');
};

// Função para ATUALIZAR o status de uma comanda
export const updateComandaStatus = (id, novoStatus) => {
  console.log(`Front-end: "Garçom, mudar pedido #${id} para ${novoStatus}!"`);
  // Faz o PATCH para /api/comandas/:id, enviando o novo status
  return api.patch(`/comandas/${id}`, { status: novoStatus });
};

// Função para DELETAR uma comanda
export const deleteComanda = (id) => {
  console.log(`Front-end: "Garçom, cancelar o pedido #${id}!"`);
  // Faz o DELETE para /api/comandas/:id
  return api.delete(`/comandas/${id}`);
};
