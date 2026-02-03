import { useState, useEffect } from 'react';
import { getComandas, updateComandaStatus, deleteComanda } from '../services/api';

// Componente que exibe todos os pedidos feitos (Painel da Cozinha)
// Recebe a prop 'refreshTrigger' para saber quando atualizar a lista
export function PainelCozinha({ refreshTrigger }) {
  const [comandas, setComandas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // useEffect que busca os pedidos toda vez que o componente monta
  // ou quando a prop 'refreshTrigger' muda (novo pedido foi feito)
  useEffect(() => {
    const fetchComandas = async () => {
      setLoading(true); // Ativa o loading a cada atualização
      try {
        const response = await getComandas();
        console.log('✅ Front-end: Pedidos recebidos!', response.data);
        
        // O back-end retorna { sucesso, mensagem, quantidade, dados }
        const listaPedidos = response.data.dados || response.data;
        
        // Inverte a lista para mostrar os pedidos mais novos primeiro
        setComandas([...listaPedidos].reverse()); 
      } catch (err) {
        console.error('❌ Erro ao buscar pedidos:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchComandas();
  }, [refreshTrigger]); // <-- O gatilho de atualização!

  // Função para lidar com a mudança de status
  const handleMudarStatus = async (id, novoStatus) => {
    try {
      // 1. Chama a API para atualizar o back-end
      const response = await updateComandaStatus(id, novoStatus);
      
      // 2. Atualiza o estado local (UI) com os dados da resposta
      // Isso evita um novo 'GET' e atualiza a tela instantaneamente
      setComandas((comandasAnteriores) =>
        comandasAnteriores.map((comanda) =>
          comanda.id === id ? response.data : comanda
        )
      );
      
      console.log(`Status do Pedido #${id} atualizado para ${novoStatus}`);
    
    } catch (err) {
      console.error('Erro ao atualizar status:', err);
      alert('Falha ao atualizar o status do pedido.');
    }
  };

  // Função para cancelar (deletar) um pedido
  const handleCancelarPedido = async (id) => {
    // Pede confirmação ao usuário antes de deletar
    // const confirmacao = window.confirm('Tem certeza que deseja cancelar este pedido?');
    
    // if (!confirmacao) {
    //   return; // Se o usuário cancelar, não faz nada
    // }

    try {
      // 1. Chama a API para deletar no back-end
      await deleteComanda(id);
      
      // 2. Remove o pedido do estado local (UI)
      setComandas((comandasAnteriores) =>
        comandasAnteriores.filter((c) => c.id !== id)
      );
      
      console.log(`Pedido #${id} cancelado com sucesso!`);
    
    } catch (err) {
      console.error('Erro ao cancelar pedido:', err);
      alert('Falha ao cancelar o pedido.');
    }
  };

  console.log('Renderizando Painel da Cozinha. Pedidos atuais:', comandas);

  // --- Renderização ---
  
  if (loading && comandas.length === 0) {
    return (
      <div className="cozinha-secao">
        <h2>👨‍🍳 Painel da Cozinha (Pedidos Feitos)</h2>
        <div className="loading-cozinha">Carregando pedidos da cozinha...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="cozinha-secao">
        <h2>👨‍🍳 Painel da Cozinha (Pedidos Feitos)</h2>
        <div className="error-cozinha">
          ❌ Erro ao buscar pedidos. Verifique se o back-end está rodando.
        </div>
      </div>
    );
  }

  return (
    <div className="cozinha-secao">
      <h3>👨‍🍳 Painel da Cozinha (Pedidos Feitos)</h3>
      <p className="cozinha-info">
        {comandas.length === 0 
          ? 'Nenhum pedido feito ainda. Faça seu primeiro pedido!' 
          : `Total de pedidos: ${comandas.length}`
        }
      </p>
      
      {comandas.length > 0 && (
        <div className="cozinha-lista">
          {comandas.map((comanda) => (
            <div key={comanda.id} className="cozinha-pedido">
              <h3>Pedido #{comanda.id}</h3>
              <p className="cozinha-mesa">🪑 Mesa: {comanda.mesa}</p>
              <p className="cozinha-status">
                Status: <span className={`status status-${comanda.status.toLowerCase().replace(' ', '-')}`}>{comanda.status}</span>
              </p>
              <p className="cozinha-itens">
                📋 Itens: {comanda.itens.map(item => item).join(', ')} {comanda.itens.length === 1 ? 'item' : 'itens'}
              </p>
              <p className="cozinha-total">
                <strong>💰 Total: R$ {comanda.total.toFixed(2)}</strong>
              </p>
              <p className="cozinha-data">
                <small>🕐 Recebido: {new Date(comanda.dataPedido).toLocaleString('pt-BR')}</small>
              </p>
              
              {/* --- NOVOS BOTÕES DE AÇÃO --- */}
              <div className="botoes-acao">
                {/* Botão "Em Preparo" (só aparece se status for "pendente") */}
                {comanda.status === 'pendente' && (
                  <button 
                    className="btn-em-preparo"
                    onClick={() => handleMudarStatus(comanda.id, 'Em Preparo')}
                  >
                    Marcar "Em Preparo"
                  </button>
                )}
                
                {/* Botão "Concluído" (só aparece se status for "Em Preparo") */}
                {comanda.status === 'Em Preparo' && (
                  <button 
                    className="btn-concluido"
                    onClick={() => handleMudarStatus(comanda.id, 'Concluído')}
                  >
                    Marcar "Concluído"
                  </button>
                )}
                
                {/* Mensagem de Concluído (só aparece se status for "Concluído") */}
                {comanda.status === 'Concluído' && (
                  <p className="status-concluido-msg">Pedido Finalizado!</p>
                )}
                
                {/* Botão "Cancelar Pedido" (só aparece se status NÃO for "Concluído") */}
                {comanda.status !== 'Concluído' && (
                  <button 
                    className="btn-cancelar"
                    onClick={() => handleCancelarPedido(comanda.id)}
                  >
                    🗑️ Cancelar Pedido
                  </button>
                )}
              </div>
              {/* --- FIM DOS BOTÕES --- */}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
