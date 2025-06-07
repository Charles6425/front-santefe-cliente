export interface Produto{
    id?:any;
    descricao:string;
    unidade:string;
    qtd: any;
    valor: string;
    observacao:string;
    categoria:{
        id: number;
    }
}