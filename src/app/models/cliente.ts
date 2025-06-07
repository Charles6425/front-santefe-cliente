export interface Cliente{
    id?: any;
    nome: string;
    cpf: string;
    endereco: string;
    telefone: string;
    telefone2?: string; // Telefone secundário (opcional)
}