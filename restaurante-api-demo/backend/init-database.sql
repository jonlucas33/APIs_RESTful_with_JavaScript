-- Script de Inicialização do Banco de Dados do Restaurante
-- Execute este script para criar o banco de dados e as tabelas necessárias

-- Criar o banco de dados (se não existir)
-- NOTA: Execute esta linha conectado ao banco 'postgres' padrão
-- CREATE DATABASE restaurante_db;

-- Conectar ao banco de dados restaurante_db antes de executar o restante
-- \c restaurante_db

-- Criar a tabela de cardápio
CREATE TABLE IF NOT EXISTS cardapio (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  preco DECIMAL(10, 2) NOT NULL,
  descricao TEXT
);

-- Criar a tabela de comandas (pedidos)
CREATE TABLE IF NOT EXISTS comandas (
  id SERIAL PRIMARY KEY,
  mesa INTEGER NOT NULL,
  status VARCHAR(50) DEFAULT 'pendente',
  itens JSONB NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inserir dados iniciais no cardápio
INSERT INTO cardapio (nome, preco, descricao) VALUES
  ('Prato Feito', 13.00, 'Arroz, feijão, bife e salada'),
  ('Suco de Laranja', 8.00, 'Suco natural 500ml'),
  ('Hambúrguer Artesanal', 35.00, 'Pão, carne 180g, queijo e batata'),
  ('Pizza Margherita', 40.00, 'Pizza tradicional italiana'),
  ('Refrigerante', 7.00, 'Lata 350ml'),
  ('Doce', 7.00, 'Sobremesa do dia')
ON CONFLICT DO NOTHING;

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_comandas_status ON comandas(status);
CREATE INDEX IF NOT EXISTS idx_comandas_mesa ON comandas(mesa);

-- Verificar se tudo foi criado corretamente
SELECT 'Tabelas criadas com sucesso!' AS status;
SELECT COUNT(*) AS total_itens_cardapio FROM cardapio;
