// Interfaces específicas para o Frontend Cliente
// Baseado na nova arquitetura de carrinho com localStorage

export interface CartItem {
    id: string;
    produtoId: number;
    categoriaId: number;
    nomeProduto: string;
    quantidade: number;
    valorUnitario: number;
    valorTotal: number;
    observacao?: string;
}

export interface Cart {
    items: CartItem[];
    quantidadeItens: number;
    valorProdutos: number;
    valorTotal: number;
    dataUltimaAtualizacao: Date;
}

export interface ClientSaleData {
    tipoAtendimento: 'BALCAO' | 'MESA' | 'ENTREGA' | 'RETIRADA'; // SEM COMANDA
    formaPagamento: 'DINHEIRO' | 'CARTAO' | 'PIX' | 'VALES'; // SEM COMANDA
    mesa?: string;
    horarioRetirada?: string; // Horário no formato HH:mm:ss para RETIRADA
    observacoes?: string;
}

// ========== INTERFACES PARA SOLICITAÇÃO (CONFORME BACKEND ESPERA) ==========

export interface ItemCarrinho {
    produtoId: number;
    categoriaId: number;
    quantidade: number;
    valorUnitario: number;
    valorTotal: number;
    observacao?: string;
}

export interface DadosVendaCliente {
    tipoAtendimento: 'BALCAO' | 'MESA' | 'ENTREGA' | 'RETIRADA'; // SEM 'COMANDA'
    valorTotal: number;
    formaPagamento: 'DINHEIRO' | 'CARTAO' | 'PIX' | 'VALES'; // SEM 'COMANDA'
    mesa?: string;
    horarioRetirada?: string; // Horário no formato HH:mm:ss para RETIRADA
    observacoes?: string;
    valorProdutos: number;
}

export interface SolicitacaoVendaRequest {
    itens: ItemCarrinho[];
    dadosVenda: DadosVendaCliente;
    cpfCliente?: string;
    nomeCliente?: string;
    telefoneCliente?: string;
    enderecoCliente?: string;
    observacoes?: string;
}

export interface SolicitacaoVendaResponse {
    vendaId: number;
    numeroVenda: string;
    dataHora: string;
    status: 'PENDENTE' | 'CONFIRMADA' | 'REJEITADA';
    tipoAtendimento: string;
    valorTotal: number;
    valorProdutos: number;
    formaPagamento: string;
    cpfCliente?: string;
    nomeCliente?: string;
    telefoneCliente?: string;
    observacoes?: string;
    mesa?: string;
    quantidadeItens: number;
    mensagem: string;
}

// ========== MANTER COMPATIBILIDADE (ALIASES) ==========
export type SolicitacaoVendaDTO = SolicitacaoVendaRequest;
export type SolicitacaoVendaResponseDTO = SolicitacaoVendaResponse;
