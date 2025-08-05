import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { Produto } from '../models/produto';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';

/**
 * Serviço para gerenciamento de produtos
 * Responsável por operações CRUD de produtos e consultas por categoria
 */
@Injectable({
    providedIn: 'root'
})
export class ProdutoService {
    baseUrl = environment.baseUrl;

    constructor(
        private http: HttpClient,
        private snack: MatSnackBar
    ) { }

    /**
     * Busca todos os produtos disponíveis
     * Usado para listar produtos sem filtro de categoria
     */
    findAll(): Observable<Produto[]> {
        const url = this.baseUrl + '/produtos';
        return this.http.get<Produto[]>(url);
    }

    /**
     * Busca produtos por categoria específica
     * Usado para filtrar produtos na interface de seleção
     */
    findAllByCategoria(categoriaId: string): Observable<Produto[]> {
        return this.http.get<Produto[]>(`${this.baseUrl}/produtos/all?categoria=${categoriaId}`);
    }

    /**
     * Busca produto por ID específico
     * Usado para obter detalhes completos de um produto
     */
    findById(id: any): Observable<Produto> {
        const url = this.baseUrl + '/produtos/' + id;
        return this.http.get<Produto>(url);
    }

    /**
     * Cria novo produto
     * Usado em operações administrativas (se aplicável)
     */
    create(produto: Produto): Observable<Produto> {
        const url = this.baseUrl + '/produtos';
        return this.http.post<Produto>(url, produto);
    }

    /**
     * Atualiza produto existente
     * Usado em operações administrativas (se aplicável)
     */
    update(produto: Produto): Observable<Produto> {
        const url = this.baseUrl + '/produtos/' + produto.id;
        return this.http.put<Produto>(url, produto);
    }

    /**
     * Exibe mensagem informativa para o usuário
     * Usado para feedback de operações
     */
    message(msg: string): void {
        this.snack.open(`${msg}`, 'OK', {
            horizontalPosition: 'center',
            verticalPosition: 'bottom',
            duration: 4000
        });
    }
}