import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { Categoria } from '../models/categoria';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';

/**
 * Serviço para gerenciamento de categorias
 * Responsável por operações CRUD de categorias de produtos
 */
@Injectable({
  providedIn: 'root'
})
export class CategoriaService {
  baseUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private snack: MatSnackBar
  ) { }

  /**
   * Busca todas as categorias disponíveis
   * Usado para popular listas de seleção de categoria
   */
  findAll(): Observable<Categoria[]> {
    const url = this.baseUrl + '/categorias';
    return this.http.get<Categoria[]>(url);
  }

  /**
   * Busca categoria por ID específico
   * Usado para obter detalhes de uma categoria
   */
  findById(id: any): Observable<Categoria> {
    const url = this.baseUrl + '/categorias/' + id;
    return this.http.get<Categoria>(url);
  }

  /**
   * Cria nova categoria
   * Usado em operações administrativas (se aplicável)
   */
  create(categoria: Categoria): Observable<Categoria> {
    const url = this.baseUrl + '/categorias';
    return this.http.post<Categoria>(url, categoria);
  }

  /**
   * Atualiza categoria existente
   * Usado em operações administrativas (se aplicável)
   */
  update(categoria: Categoria): Observable<Categoria> {
    const url = this.baseUrl + '/categorias/' + categoria.id;
    return this.http.put<Categoria>(url, categoria);
  }

  /**
   * Remove categoria por ID
   * Usado em operações administrativas (se aplicável)
   */
  delete(id: string): Observable<void> {
    const url = `${this.baseUrl}/categorias/${id}`;
    return this.http.delete<void>(url);
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