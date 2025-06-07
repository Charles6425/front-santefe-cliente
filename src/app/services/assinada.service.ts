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

  constructor(private http: HttpClient,         private snack: MatSnackBar) {}

  create(assinada: Assinada): Observable<Assinada> {
    return this.http.post<Assinada>(this.baseUrl, assinada);
  }

  findAll(): Observable<AssinadaDto[]> {
    return this.http.get<AssinadaDto[]>(this.baseUrl);
  }

  findById(id: number): Observable<AssinadaDto> {
    return this.http.get<AssinadaDto>(`${this.baseUrl}/${id}`);
  }

  buscarPorClienteId(clienteId: number): Observable<AssinadaDto[]> {
    return this.http.get<AssinadaDto[]>(`${this.baseUrl}/cliente/${clienteId}`);
  }

  buscarPorClienteCpf(cpf: string): Observable<AssinadaDto[]> {
    return this.http.get<AssinadaDto[]>(`${this.baseUrl}/cliente/cpf/${cpf}`);
  }



  update(id: number, assinada: Assinada): Observable<Assinada> {

    return this.http.put<Assinada>(`${this.baseUrl}/${id}`, assinada);
  }

    atualizarStatus(ids: number[]): Observable<any> {
    return this.http.put(`${this.baseUrl}/atualizar-status`, ids);
    console.log("os ids das assinadas "+ids);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

      message(msg: string): void {
            this.snack.open(`${msg}`, 'OK', {
            horizontalPosition: 'center',
            verticalPosition: 'bottom',
            duration: 4000
        });
    }
}