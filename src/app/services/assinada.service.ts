import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Assinada } from '../models/assinada';
import { environment } from '../../environments/environment';
import { AssinadaDto } from '../models/assinada-dto';
import { MatSnackBar } from '@angular/material/snack-bar';

/**
 * Service para gerenciar operações relacionadas às assinadas
 * Responsável por comunicação com a API de assinadas do backend
 * Permite CRUD completo e busca por cliente
 */
@Injectable({
  providedIn: 'root'
})
export class AssinadaService {
  private baseUrl = environment.baseUrl + '/assinadas';

  constructor(private http: HttpClient, private snack: MatSnackBar) {}

  /**
   * Cria uma nova assinada no backend
   * @param assinada - Dados da assinada a ser criada
   * @returns Observable com dados da assinada criada
   */
  create(assinada: Assinada): Observable<Assinada> {
    return this.http.post<Assinada>(this.baseUrl, assinada);
  }

  /**
   * Busca todas as assinadas cadastradas
   * @returns Observable com array de assinadas (DTO)
   */
  findAll(): Observable<AssinadaDto[]> {
    return this.http.get<AssinadaDto[]>(this.baseUrl);
  }

  /**
   * Busca uma assinada específica por ID
   * @param id - ID da assinada
   * @returns Observable com dados da assinada
   */
  findById(id: number): Observable<AssinadaDto> {
    return this.http.get<AssinadaDto>(`${this.baseUrl}/${id}`);
  }

  /**
   * Busca assinadas por ID do cliente
   * @param clienteId - ID do cliente
   * @returns Observable com array de assinadas do cliente
   */
  buscarPorClienteId(clienteId: number): Observable<AssinadaDto[]> {
    return this.http.get<AssinadaDto[]>(`${this.baseUrl}/cliente/${clienteId}`);
  }

  /**
   * Busca assinadas por CPF do cliente
   * @param cpf - CPF do cliente
   * @returns Observable com array de assinadas do cliente
   */
  buscarPorClienteCpf(cpf: string): Observable<AssinadaDto[]> {
    return this.http.get<AssinadaDto[]>(`${this.baseUrl}/cliente/cpf/${cpf}`);
  }



  /**
   * Atualiza uma assinada existente
   * @param id - ID da assinada
   * @param assinada - Dados atualizados da assinada
   * @returns Observable com dados da assinada atualizada
   */
  update(id: number, assinada: Assinada): Observable<Assinada> {
    return this.http.put<Assinada>(`${this.baseUrl}/${id}`, assinada);
  }

  /**
   * Atualiza o status de múltiplas assinadas
   * @param ids - Array com IDs das assinadas a serem atualizadas
   * @returns Observable com resposta da operação
   */
  atualizarStatus(ids: number[]): Observable<any> {
    return this.http.put(`${this.baseUrl}/atualizar-status`, ids);
  }

  /**
   * Remove uma assinada do sistema
   * @param id - ID da assinada a ser removida
   * @returns Observable vazio confirmando a remoção
   */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
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