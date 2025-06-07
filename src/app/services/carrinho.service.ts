import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Carrinho } from '../models/carrinho';
import { ItemDTO } from '../models/item-dto';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class CarrinhoService {

    baseUrl = environment.baseUrl;

    constructor(
        private http: HttpClient,
        private snack: MatSnackBar
    ) { }

    adicionar(item: ItemDTO): Observable<ItemDTO> {
        const url = this.baseUrl + '/carrinho';
        return this.http.post<ItemDTO>(url, item);
    }

    findAll(): Observable<ItemDTO[]> {
        const url = this.baseUrl + '/carrinho';
        return this.http.get<ItemDTO[]>(url);
    }

    delete(id: any): Observable<void> {
        const url = `${this.baseUrl}/carrinho/${id}`;
        return this.http.delete<void>(url);
    }

    updateQuantidade(id: number, quantidade: number): Observable<ItemDTO> {
        const url = `${this.baseUrl}/carrinho/${id}/quantidade?quantidade=${quantidade}`;
        return this.http.put<ItemDTO>(url, {});
    }

    finalizarVenda(vendaId: number, dadosExtras?: any): Observable<any> {
        const url = `${this.baseUrl}/vendas/${vendaId}/finalizar`;
        return this.http.put<any>(url, dadosExtras || {});
    }

    getVendaAberta(): Observable<number> {
        const url = `${this.baseUrl}/vendas/aberta`;
        return this.http.get<number>(url);
    }

    getItensNaoFinalizados(): Observable<ItemDTO[]> {
        const url = `${this.baseUrl}/carrinho/nao-finalizados`;
        return this.http.get<ItemDTO[]>(url);
    }

    getVendaDetalhada(id: number): Observable<any> {
        const url = `${this.baseUrl}/vendas/${id}`;
        return this.http.get<any>(url);
    }

    buscarClientePorCpf(cpf: string) {
        return this.http.get<{ nome: string; endereco: string; telefone: string; id:number }>(`${this.baseUrl}/clientes/cpf/${cpf}`);
    }

    /**
     * Faz o download do PDF da comanda gerada pelo backend.
     * @param vendaId ID da venda
     */
    baixarComandaPdf(vendaId: number) {
        const url = `${this.baseUrl}/vendas/${vendaId}/comanda`;
        return this.http.get(url, { responseType: 'blob' });
    }

    message(msg: string, isError: boolean = false): void {
        this.snack.open(`${msg}`, 'OK', {
            horizontalPosition: 'center',
            verticalPosition: 'bottom',
            duration: 4000,
            panelClass: ['error-snackbar', 'success-snackbar']
        });
    }
}