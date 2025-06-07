import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { Produto } from '../models/produto';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
    providedIn: 'root'
})
export class ProdutoService {

    baseUrl = environment.baseUrl;

    constructor(
        private http: HttpClient,
        private snack: MatSnackBar

    ) { }

    findAll(): Observable<Produto[]> {
        const url = this.baseUrl + '/produtos';
        return this.http.get<Produto[]>(url);
    }

    findAllByCategoria(categoriaId: string): Observable<Produto[]> {
        return this.http.get<Produto[]>(`${this.baseUrl}/produtos/all?categoria=${categoriaId}`);
    }

    findById(id: any): Observable<Produto> {
        const url = this.baseUrl + '/produtos/' + id;
        return this.http.get<Produto>(url);
    }

    create(produto: Produto): Observable<Produto> {
        const url = this.baseUrl + '/produtos';
        return this.http.post<Produto>(url, produto);
        
    }

    update(produto: Produto): Observable<Produto> {
        const url = this.baseUrl + '/produtos/' + produto.id;
        return this.http.put<Produto>(url, produto);
    }

    message(msg: string): void {
            this.snack.open(`${msg}`, 'OK', {
            horizontalPosition: 'center',
            verticalPosition: 'bottom',
            duration: 4000
        });
    }
}