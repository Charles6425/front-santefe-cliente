import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Usuario } from '../models/usuario';

@Injectable({
    providedIn: 'root'
})
export class UsuarioService {

    baseUrl = environment.baseUrl;

    constructor(
        private http: HttpClient,
        private snack: MatSnackBar

    ) { }

    findAll(): Observable<Usuario[]> {
        const url = this.baseUrl + '/usuarios';
        return this.http.get<Usuario[]>(url);
    }

    findById(id: any): Observable<Usuario> {
        const url = this.baseUrl + '/usuarios/' + id;
        return this.http.get<Usuario>(url);
    }

    create(usuario: Usuario): Observable<Usuario> {
        const url = this.baseUrl + '/usuarios';
        return this.http.post<Usuario>(url, usuario);
    }

    update(usuario: Usuario): Observable<Usuario> {
        const url = this.baseUrl + '/usuarios/' + usuario.id;
        return this.http.put<Usuario>(url, usuario);
    }

    message(msg: string): void {
        this.snack.open(`${msg}`, 'OK', {
            horizontalPosition: 'center',
            verticalPosition: 'bottom',
            duration: 4000
        });
    }
}
