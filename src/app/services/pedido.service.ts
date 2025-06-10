import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from '../../environments/environment';
import { Pedido } from '../models/pedido';

@Injectable({
  providedIn: 'root'
})
export class PedidoService {
  private baseUrl = environment.baseUrl+'/pedidos';

  constructor(private http: HttpClient, private snack: MatSnackBar) {}

  findAll(): Observable<Pedido[]> {
    return this.http.get<Pedido[]>(this.baseUrl);
  }

  create(pedido: Pedido): Observable<Pedido> {
    return this.http.post<Pedido>(this.baseUrl, pedido);
  }

  message(msg: string): void {
    this.snack.open(`${msg}`, 'OK', {
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      duration: 4000
    });
  }
}
