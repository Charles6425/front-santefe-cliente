export interface ItemDTO {
  id: number;
  produto: string;
  produtoId?: number; // Adicionado para suportar envio de ID do produto
  categoria: string;
  categoriaId?: number; // Adicionado para suportar envio de ID da categoria
  quantidade: number;
  valorUnitario: number;
  valorTotal: number;
  observacao?: string;
}
