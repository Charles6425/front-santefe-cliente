export interface AssinadaDto {
  id?: number;
  vendaId: number;
  produtoId: number;
  produtoDescricao: string;
  cliente: any;
  clienteId?: number; // Optional for backward compatibility
  clienteNome: string;
  dataHora: string; // ISO string
  valorUnitario: number;
  quantidade: number;
  valorTotal: number;
  status: string; // 'PENDENTE', 'ASSINADA', 'CANCELADA'
}