import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from '../../environments/environment';
import { Pedido } from '../models/pedido';

/**
 * Service para gerenciar operações relacionadas aos pedidos
 * Responsável por comunicação com a API de pedidos do backend
 */
@Injectable({
  providedIn: 'root'
})
export class PedidoService {
  private baseUrl = environment.baseUrl+'/pedidos';

  constructor(private http: HttpClient, private snack: MatSnackBar) {}

  /**
   * Busca todos os pedidos cadastrados
   * @returns Observable com array de pedidos
   */
  findAll(): Observable<Pedido[]> {
    return this.http.get<Pedido[]>(this.baseUrl);
  }

  /**
   * Cria um novo pedido no sistema
   * @param pedido - Dados do pedido a ser criado
   * @returns Observable com dados do pedido criado
   */
  create(pedido: Pedido): Observable<Pedido> {
    return this.http.post<Pedido>(this.baseUrl, pedido);
  }

  /**
   * Exibe mensagem de feedback para o usuário
   * @param msg - Mensagem a ser exibida
   */
  message(msg: string): void {
    this.snack.open(`${msg}`, 'OK', {
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      duration: 4000
    });
  }
}
