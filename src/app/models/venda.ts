import { ItemDTO } from './item-dto';

export interface Venda {
  id?: number;
  valor: number;
  observacao?: string;
  finalizada: boolean;
  dataAbertura: string;
  dataFechamento?: string;
  valorDesconto?: number;
  nomeDesconto?: string;
  valorAcrescimo?: number;
  nomeAcrescimo?: string;
  itens: ItemDTO[];
  tipoAtendimento: 'MESA' | 'BALCAO' | 'ENTREGA' | 'RETIRADA';
  mesa?: boolean;
  numeroMesa?: number | null;
  quantidadeItens: number;
  cpfCliente?: string;
  nomeCliente?: string;
  enderecoCliente?: string;
  horarioEntrega?: string;
  horarioRetirada?: string;
  formaPagamento: 'CARTAO' | 'VALES' | 'PIX' | 'DINHEIRO' | 'COMANDA';
}

export interface VendaDetalhadaDTO {
  venda: Venda;
  itens: ItemDTO[];
}
