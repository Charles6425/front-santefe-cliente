export interface Categoria {
  id: number;
  descricao: string;
}

export interface Produto {
  id: number;
  descricao: string;
  unidade: string;
  qtd: number;
  valor: number;
  observacao: string;
  categoria: Categoria;
}

export interface PedidoItem {
  id: number;
  produto: Produto;
  quantidade: number;
  valorUnitario: number;
}

export interface Pedido {
  id: number;
  clienteId: number;
  dataHora: string;
  valorTotal: number;
  status: string;
  itens: PedidoItem[];
}