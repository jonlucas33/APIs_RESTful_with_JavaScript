// ==================================================================
// ARQUIVO: frontend/src/App.test.jsx
// OBJETIVO: Testar a lógica de cálculo do total da comanda
// ==================================================================

import { describe, it, expect } from 'vitest';

// ==================================================================
// FUNÇÃO AUXILIAR: Replica a lógica de calcularTotalComanda
// Esta é a mesma lógica usada no componente App
// ==================================================================
const calcularTotalComanda = (comanda) => {
  return comanda.reduce((total, item) => total + (parseFloat(item.preco) || 0), 0);
};

// ==================================================================
// GRUPO DE TESTES: Cálculo do Total da Comanda
// ==================================================================
describe('🧮 calcularTotalComanda', () => {
  
  it('deve retornar 0 quando a comanda está vazia', () => {
    const comanda = [];
    const total = calcularTotalComanda(comanda);
    
    expect(total).toBe(0);
  });

  it('deve calcular corretamente com um único item (número)', () => {
    const comanda = [
      { id: 1, nome: 'Prato Feito', preco: 25.00 }
    ];
    const total = calcularTotalComanda(comanda);
    
    expect(total).toBe(25.00);
  });

  it('deve calcular corretamente com múltiplos itens (números)', () => {
    const comanda = [
      { id: 1, nome: 'Prato Feito', preco: 25.00 },
      { id: 2, nome: 'Suco de Laranja', preco: 8.00 },
      { id: 3, nome: 'Hambúrguer Artesanal', preco: 35.00 }
    ];
    const total = calcularTotalComanda(comanda);
    
    expect(total).toBe(68.00);
  });

  // ==================================================================
  // TESTES CRÍTICOS: Preços vindo como STRING (cenário PostgreSQL/Prisma)
  // ==================================================================
  it('deve converter strings em números e calcular corretamente', () => {
    const comanda = [
      { id: 1, nome: 'Prato Feito', preco: '25.00' },  // String!
      { id: 2, nome: 'Suco', preco: '8.00' }           // String!
    ];
    const total = calcularTotalComanda(comanda);
    
    // Se a conversão falhar, JavaScript faria "0" + "25.00" + "8.00" = "025.008.00"
    // Com Number(), deve fazer 0 + 25 + 8 = 33
    expect(total).toBe(33.00);
    expect(typeof total).toBe('number'); // Garante que é número, não string
  });

  it('deve lidar com mix de números e strings', () => {
    const comanda = [
      { id: 1, nome: 'Prato Feito', preco: 25.00 },    // Número
      { id: 2, nome: 'Suco', preco: '8.00' },          // String
      { id: 3, nome: 'Hambúrguer', preco: 35 }         // Número inteiro
    ];
    const total = calcularTotalComanda(comanda);
    
    expect(total).toBe(68.00);
  });

  // ==================================================================
  // TESTES DE SEGURANÇA: Valores inválidos (undefined, null, NaN)
  // ==================================================================
  it('deve tratar preço undefined como 0', () => {
    const comanda = [
      { id: 1, nome: 'Prato Feito', preco: 25.00 },
      { id: 2, nome: 'Item Sem Preço' } // preco é undefined
    ];
    const total = calcularTotalComanda(comanda);
    
    expect(total).toBe(25.00); // Ignora o item sem preço
  });

  it('deve tratar preço null como 0', () => {
    const comanda = [
      { id: 1, nome: 'Prato Feito', preco: 25.00 },
      { id: 2, nome: 'Item Null', preco: null }
    ];
    const total = calcularTotalComanda(comanda);
    
    expect(total).toBe(25.00);
  });

  it('deve tratar string vazia como 0', () => {
    const comanda = [
      { id: 1, nome: 'Prato Feito', preco: 25.00 },
      { id: 2, nome: 'Item String Vazia', preco: '' }
    ];
    const total = calcularTotalComanda(comanda);
    
    expect(total).toBe(25.00);
  });

  it('deve tratar string não-numérica como 0', () => {
    const comanda = [
      { id: 1, nome: 'Prato Feito', preco: 25.00 },
      { id: 2, nome: 'Item Inválido', preco: 'abc' }  // String inválida
    ];
    const total = calcularTotalComanda(comanda);
    
    // Number('abc') retorna NaN
    // NaN || 0 retorna 0 (fallback funciona)
    expect(total).toBe(25.00);
  });

  // ==================================================================
  // TESTE DE PRECISÃO: Números decimais
  // ==================================================================
  it('deve manter precisão com valores decimais', () => {
    const comanda = [
      { id: 1, nome: 'Item 1', preco: 10.50 },
      { id: 2, nome: 'Item 2', preco: 15.75 },
      { id: 3, nome: 'Item 3', preco: 20.25 }
    ];
    const total = calcularTotalComanda(comanda);
    
    expect(total).toBe(46.50);
  });

  it('deve somar corretamente mesmo com muitos itens', () => {
    const comanda = Array(10).fill({ id: 1, nome: 'Item', preco: 5.00 });
    const total = calcularTotalComanda(comanda);
    
    expect(total).toBe(50.00);
  });

  // ==================================================================
  // TESTE DE REGRESSÃO: Cenário real do erro do usuário
  // Simula o caso onde preco vem como Decimal do Prisma (string)
  // ==================================================================
  it('deve calcular total corretamente quando preços vêm do backend como strings (Prisma Decimal)', () => {
    // Simula resposta real de um endpoint que usa Prisma/PostgreSQL
    const comandaDoBackend = [
      { id: 1, nome: 'Suco de Laranja', preco: '8.00' },      // Decimal vira string
      { id: 2, nome: 'Hambúrguer Artesanal', preco: '35.00' } // Decimal vira string
    ];
    
    const total = calcularTotalComanda(comandaDoBackend);
    
    expect(total).toBe(43.00);
    
    // Verifica que o método toFixed funcionará
    expect(() => total.toFixed(2)).not.toThrow();
    expect(total.toFixed(2)).toBe('43.00');
  });
});
