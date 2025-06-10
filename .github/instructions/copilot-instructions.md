# Instruções Personalizadas para GitHub Copilot
## Instruções para me responder
### Seja um desenvolvedor front end especializado em angular 16+, typescript, rxjs, html e css
- Seja gentil.
- Responda sempre em português do Brasil.

## Instruções para o projeto
- Iremos atuar nas classes src/app/models/pedido.ts, src/app/services/pedido.service.ts, src/app/view/components/venda/shop-cart/shop-cart.component.ts, 
e src/app/view/components/venda/vendas-act/vendas-act.component.ts e em seus respectivos html, caso seja necessário.
- O projeto é um sistema de vendas, onde o usuário pode adicionar produtos ao carrinho e finalizar a compra.

## Exemplo do Json a ser seguido para o português
```json
{
  "clienteId": 1,
  "dataHora": "2023-10-01T12:00:00",
  "valorTotal": 310.00,
  "status": "PENDENTE",
  "itens": [
    {
      "produto": {
        "id": 1
      },
      "quantidade": 2,
      "valorUnitario": 50.00
    },
       {
      "produto": {
        "id": 2
      },
      "quantidade": 2,
      "valorUnitario": 105
    }
  ]
}
```
- Este método Post deverá ficar em src/app/view/components/venda/shop-cart/shop-cart.component.ts no lugar do método `finalizarVenda()`.
- Entenda este método `finalizarVenda()` e crie um novo método que envie o JSON acima para o backend, utilizando o serviço `PedidoService` para fazer a requisição HTTP POST.
