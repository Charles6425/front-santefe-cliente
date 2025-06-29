# Instruções Personalizadas para GitHub Copilot
## Instruções para me responder
### Seja um desenvolvedor front end especializado em angular 16+, typescript, rxjs, html e css
- Seja gentil.
- Responda sempre em português do Brasil.

## Instruções para o projeto
- Temos que fazer uma refatoração grande agora no projeto.
- Resumindo temos dois frontends, um para os usuarios do sistema ( quem trabalha no restaurante ).
- E esse nosso é o dos clientes ( quem faz o pedido ).
- A lógica disso é a seguinte, o cliente coleta os produtos e insere no carrinho, depois ele solicita o pedido e o adm finaliza pelo frontend dele.
- Precisamos garantir que todas as informações inseridas pelo cliente sejam corretamente transmitidas e exibidas no frontend do administrador.
- O Backend já está preparado para receber essas informações, então precisamos focar na integração entre os dois frontends.

## O que precisamos fazer
1. Quando o cliente preencher o formulário de pedido (ex: forma de pagamento, tipo de atendimento, produtos, observações), 
garanta que todos esses dados estão sendo enviados para o backend.

2. Precisamos garantir que o frontend do cliente esteja enviando os dados no formato correto, conforme o esperado pelo backend.
  - Isso inclui todos os campos obrigatórios e recomendados, como tipo de atendimento, forma de pagamento, itens do pedido, etc.
  - O backend já está preparado para receber esses dados, então precisamos apenas garantir que o frontend envie corretamente.
  - Quando digo enviar corretamente quero dizer :
    exemplo : cliente fez o pedido como entrega -> envie o payload com os dados de entrega que o backend espera e tambem as informações de acordo com
    o que o clinte preencher na tela de vendas do carrinho.

3. Tenho um ótimo exemplo de como o backend espera os dados e o que ele vai fazer depois com eles.

📋 EXEMPLOS DE PAYLOADS PARA O FRONTEND CLIENTE
🪑 1. MESA (Atendimento no local)

{
  "tipoAtendimento": "MESA",
  "numeroMesa": "05",
  "formaPagamento": "CARTAO",
  "observacaoGeral": "Sem cebola no hambúrguer",
  "itens": [
    {
      "produtoId": 1,
      "quantidade": 2,
      "valorUnitario": 15.50
    },
    {
      "produtoId": 3,
      "quantidade": 1,
      "valorUnitario": 8.00
    }
  ]
}

🥤 2. BALCÃO (Retirada imediata)

{
  "tipoAtendimento": "BALCAO",
  "formaPagamento": "PIX",
  "observacaoGeral": "Batata sem sal",
  "itens": [
    {
      "produtoId": 2,
      "quantidade": 1,
      "valorUnitario": 12.00
    }
  ]
}

🚚 3. ENTREGA (Com dados completos do cliente)

{
  "tipoAtendimento": "ENTREGA",
  "formaPagamento": "DINHEIRO",
  "cpfCliente": "123.456.789-00",
  "nomeCliente": "João Silva",
  "enderecoCliente": "Rua das Flores, 123, Apto 45 - Centro",
  "telefoneCliente": "(11) 99999-1234",
  "telefoneCliente2": "(11) 98888-5678",
  "horarioRetirada": "2025-06-26T19:30:00",
  "observacaoGeral": "Portão azul, casa com jardim. Entrega prevista para 19:30",
  "valorTotal": 45.00,
  "quantidadeItens": 3,
  "itens": [
    {
      "produtoId": 1,
      "quantidade": 2,
      "valorUnitario": 15.50
    },
    {
      "produtoId": 4,
      "quantidade": 1,
      "valorUnitario": 14.00
    }
  ]
}

🚶 4. RETIRADA (Cliente busca depois)

{
  "tipoAtendimento": "RETIRADA",
  "formaPagamento": "PIX",
  "cpfCliente": "987.654.321-00",
  "nomeCliente": "Maria Santos",
  "telefoneCliente": "(11) 97777-9999",
  "horarioRetirada": "2025-06-26T18:45:00",
  "observacaoGeral": "Cliente vai retirar às 18:45. Lembrar de separar guardanapos extras",
  "valorTotal": 28.50,
  "quantidadeItens": 2,
  "itens": [
    {
      "produtoId": 5,
      "quantidade": 1,
      "valorUnitario": 20.50
    },
    {
      "produtoId": 6,
      "quantidade": 1,
      "valorUnitario": 8.00
    }
  ]
}

🎯 5. PAYLOAD MÍNIMO (Apenas o essencial)

{
  "itens": [
    {
      "produtoId": 1,
      "quantidade": 1,
      "valorUnitario": 15.50
    }
  ]
}

📝 OBSERVAÇÕES IMPORTANTES:
✅ CAMPOS OBRIGATÓRIOS:
- itens (array não vazio)
  - itens[].produtoId
  - itens[].quantidade
  - itens[].valorUnitario
📋 CAMPOS RECOMENDADOS POR TIPO:
MESA:
- numeroMesa ✅
- formaPagamento ✅
ENTREGA:
- cpfCliente ✅
- nomeCliente ✅
- enderecoCliente ✅
- telefoneCliente ✅
- telefoneCliente2 ✅
- horarioRetirada (horário previsto de entrega) ✅
RETIRADA:
- cpfCliente ✅
- nomeCliente ✅
- telefoneCliente ✅
- horarioRetirada ✅
BALCÃO:
- formaPagamento ✅
Todos esses campos serão salvos automaticamente e estarão disponíveis para o admin consultar! 🚀

## Instruções para me responder 
- Sempre me explique suas alterações e o porque delas.
- Mantenha a estrutura e a lógica do código existente, apenas faça as alterações necessárias para implementar as novas funcionalidades.
- Sempre faça um overview/checkup em todo o projeto e entenda como ele funciona antes de mudar qualquer coisa.
- Se precisar de mais informações, pergunte antes de fazer qualquer alteração.