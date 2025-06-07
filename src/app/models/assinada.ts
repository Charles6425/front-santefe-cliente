export interface Assinada {
  id?: number;
  vendaId: number;
  produtoId: number;
  cliente: any;
  dataHora: string; // ISO string
  valorUnitario: number;
  quantidade: number;
  valorTotal: number;
  status: string; // 'PENDENTE', 'FINALIZADA', 'CANCELADA'
}