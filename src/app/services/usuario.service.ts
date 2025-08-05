import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Usuario } from '../models/usuario';

/**
 * Service para gerenciar operações relacionadas aos usuários
 * Responsável por comunicação com a API de usuários do backend
 */
@Injectable({
    providedIn: 'root'
})
export class UsuarioService {

    baseUrl = environment.baseUrl;

    constructor(
        private http: HttpClient,
        private snack: MatSnackBar

    ) { }

    /**
     * Busca todos os usuários cadastrados
     * @returns Observable com array de usuários
     */
    findAll(): Observable<Usuario[]> {
        const url = this.baseUrl + '/usuarios';
        return this.http.get<Usuario[]>(url);
    }

    /**
     * Busca um usuário específico por ID
     * @param id - ID do usuário
     * @returns Observable com dados do usuário
     */
    findById(id: number): Observable<Usuario> {
        const url = this.baseUrl + '/usuarios/' + id;
        return this.http.get<Usuario>(url);
    }

    /**
     * Cria um novo usuário no sistema
     * @param usuario - Dados do usuário a ser criado
     * @returns Observable com dados do usuário criado
     */
    create(usuario: Usuario): Observable<Usuario> {
        const url = this.baseUrl + '/usuarios';
        return this.http.post<Usuario>(url, usuario);
    }

    /**
     * Atualiza dados de um usuário existente
     * @param usuario - Dados do usuário a ser atualizado (deve conter ID)
     * @returns Observable com dados do usuário atualizado
     */
    update(usuario: Usuario): Observable<Usuario> {
        const url = this.baseUrl + '/usuarios/' + usuario.id;
        return this.http.put<Usuario>(url, usuario);
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
