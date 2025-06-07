// Arquivo mantido apenas para compatibilidade antiga. Não utilizar mais este modelo.
// Utilize sempre o ItemDTO para qualquer operação de carrinho ou venda.
// interface Carrinho obsoleta após unificação dos DTOs no backend.

export interface Carrinho {
    id?: any;
    produto: {
        id: number;
        descricao: string;
        unidade: string;
        valor: string;
    };
    categoria: {
        id: number;
        descricao: string;
    };
    quantidade: number;
    valorTotal: number;
}