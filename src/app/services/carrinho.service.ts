import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Carrinho } from '../models/carrinho';
import { ItemDTO } from '../models/item-dto';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class CarrinhoService {

    baseUrl = environment.baseUrl;
    
    // Subject para notificar mudanças no carrinho
    private cartItemsSubject = new BehaviorSubject<ItemDTO[]>([]);
    public cartItems$ = this.cartItemsSubject.asObservable();

    constructor(
        private http: HttpClient,
        private snack: MatSnackBar
    ) { 
        // Carrega itens iniciais do carrinho
        this.loadCartItems();
    }

    /**
     * Carrega os itens do carrinho e atualiza o Subject
     */
    private loadCartItems(): void {
        this.findAll().subscribe({
            next: (items) => {
                this.cartItemsSubject.next(items);
            },
            error: (error) => {
                console.error('Erro ao carregar itens do carrinho:', error);
                this.cartItemsSubject.next([]);
            }
        });
    }

    adicionar(item: ItemDTO): Observable<ItemDTO> {
        const url = this.baseUrl + '/carrinho';
        return this.http.post<ItemDTO>(url, item).pipe(
            tap(() => {
                // Recarrega os itens do carrinho após adicionar
                this.loadCartItems();
            })
        );
    }

    findAll(): Observable<ItemDTO[]> {
        const url = this.baseUrl + '/carrinho';
        return this.http.get<ItemDTO[]>(url);
    }

    delete(id: any): Observable<void> {
        const url = `${this.baseUrl}/carrinho/${id}`;
        return this.http.delete<void>(url).pipe(
            tap(() => {
                // Recarrega os itens do carrinho após deletar
                this.loadCartItems();
            })
        );
    }

    updateQuantidade(id: number, quantidade: number): Observable<ItemDTO> {
        const url = `${this.baseUrl}/carrinho/${id}/quantidade?quantidade=${quantidade}`;
        return this.http.put<ItemDTO>(url, {}).pipe(
            tap(() => {
                // Recarrega os itens do carrinho após atualizar quantidade
                this.loadCartItems();
            })
        );
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

    /**
     * Força o recarregamento dos itens do carrinho
     * Útil quando outras operações podem ter afetado o carrinho
     */
    refreshCartItems(): void {
        this.loadCartItems();
    }

    /**
     * Obtém a contagem atual de itens no carrinho
     */
    getCartItemCount(): Observable<number> {
        return this.cartItems$.pipe(
            map(items => items.length)
        );
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