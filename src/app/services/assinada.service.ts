import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Assinada } from '../models/assinada';
import { environment } from '../../environments/environment';
import { AssinadaDto } from '../models/assinada-dto';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class AssinadaService {
  private baseUrl = environment.baseUrl + '/assinadas';

  constructor(private http: HttpClient, private snack: MatSnackBar) {}

  // Cria uma nova assinada no backend
  create(assinada: Assinada): Observable<Assinada> {
    return this.http.post<Assinada>(this.baseUrl, assinada);
  }

  // Busca todas as assinadas
  findAll(): Observable<AssinadaDto[]> {
    return this.http.get<AssinadaDto[]>(this.baseUrl);
  }

  // Busca uma assinada específica por ID
  findById(id: number): Observable<AssinadaDto> {
    return this.http.get<AssinadaDto>(`${this.baseUrl}/${id}`);
  }

  // Busca assinadas por ID do cliente
  buscarPorClienteId(clienteId: number): Observable<AssinadaDto[]> {
    return this.http.get<AssinadaDto[]>(`${this.baseUrl}/cliente/${clienteId}`);
  }

  // Busca assinadas por CPF do cliente
  buscarPorClienteCpf(cpf: string): Observable<AssinadaDto[]> {
    return this.http.get<AssinadaDto[]>(`${this.baseUrl}/cliente/cpf/${cpf}`);
  }



  // Atualiza uma assinada existente
  update(id: number, assinada: Assinada): Observable<Assinada> {
    return this.http.put<Assinada>(`${this.baseUrl}/${id}`, assinada);
  }

  // Atualiza o status de múltiplas assinadas
  atualizarStatus(ids: number[]): Observable<any> {
    return this.http.put(`${this.baseUrl}/atualizar-status`, ids);
  }

  // Remove uma assinada
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  // Exibe mensagem de feedback para o usuário
  message(msg: string): void {
    this.snack.open(`${msg}`, 'OK', {
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      duration: 4000
    });
  }
}