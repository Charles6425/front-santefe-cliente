import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Cliente } from '../models/cliente';

@Injectable({
    providedIn: 'root'
})
export class ClienteService {

    baseUrl = environment.baseUrl;

    constructor(
        private http: HttpClient,
        private snack: MatSnackBar

    ) { }

    findAll(): Observable<Cliente[]> {
        const url = this.baseUrl + '/clientes';
        return this.http.get<Cliente[]>(url);
    }

    findById(id: any): Observable<Cliente> {
        const url = this.baseUrl + '/clientes/' + id;
        return this.http.get<Cliente>(url);
    }

    create(cliente: Cliente): Observable<Cliente> {
        const url = this.baseUrl + '/clientes';
        return this.http.post<Cliente>(url, cliente);
    }

    update(cliente: Cliente): Observable<Cliente> {
        const url = this.baseUrl + '/clientes/' + cliente.id;
        return this.http.put<Cliente>(url, cliente);
    }

    message(msg: string): void {
        this.snack.open(`${msg}`, 'OK', {
            horizontalPosition: 'center',
            verticalPosition: 'bottom',
            duration: 4000
        });
    }
}