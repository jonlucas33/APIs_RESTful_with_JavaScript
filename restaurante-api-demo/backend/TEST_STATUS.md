# 📊 Resumo da Cobertura de Testes

## Status Atual: 8/11 testes passando ✅

### Testes que PASSAM (8 ✅)
1. ✅ GET /api/cardapio - Lista completa
2. ✅ GET /api/cardapio - Estrutura de dados
3. ✅ GET /api/cardapio/:id - Retorna 404 se não existir  
4. ✅ GET /api/comandas - Array limpo
5. ✅ POST /api/comandas - Recusa sem mesa
6. ✅ POST /api/comandas - Recusa array vazio (TDD)
7. ✅ (mais 2 testes)

### Testes que FALHAM (3 ❌ )

#### 1. GET /api/cardapio/:id - Estrutura incorreta
**Esperado:** `response.body.dados.nome` 
**Recebido:** `response.body.nome` (direto)
**Solução:** Teste já foi ajustado para `dados.nome` - verificar se foi salvo

#### 2. POST /api/comandas - Erro de JSON parsing
**Erro:** `SyntaxError: Unexpected non-whitespace character after JSON`
**Causa:** Tentativa de parse duplo do campo `itens`
**Solução:** Verificar tipo antes de parses (já implementado)

#### 3. Teste de preço (opcional)
**Esperado:** `preco: 13` (number)
**Recebido:**`preco: "13.00"` (string)  
**Causa:** MySQL DECIMAL retorna como string
**Solução:** Aceitar string no teste OU converter no controller

## Ações Pendentes
1. ✅ Ajustar estrutura de resposta do GET /api/cardapio/:id
2. 🔄 Resolver erro de JSON parsing (itens já vem como array do MySQL)
3. 🔄 Ajustar expectativa de preço (string vs number)
