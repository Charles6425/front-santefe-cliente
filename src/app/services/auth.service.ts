import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private urlBase = environment.baseUrl;
    private apiUrl = this.urlBase+'/auth/login/cliente';
    private authState = new BehaviorSubject<boolean>(false);
    authState$ = this.authState.asObservable();

    constructor(private http: HttpClient) {
        this.updateAuthState();
    }

    private hasToken(): boolean {
        const isBrowser = typeof window !== 'undefined' && !!window.localStorage;
        return isBrowser ? !!localStorage.getItem('jwt_token') : false;
    }

    updateAuthState(): void {
        this.authState.next(this.hasToken());
    }

    login(cpf: string, senha: string): Observable<any> {
        const isBrowser = typeof window !== 'undefined' && !!window.localStorage;
        return this.http.post<any>(this.apiUrl, { cpf, senha }).pipe(
            tap(res => {
                if (res && res.token && isBrowser) {
                    localStorage.setItem('jwt_token', res.token);
                    localStorage.setItem('user_nome', res.nome);
                    localStorage.setItem('user_cpf', res.cpf);
                    this.updateAuthState();
                }
            })
        );
    }

    getToken(): string | null {
        const isBrowser = typeof window !== 'undefined' && !!window.localStorage;
        return isBrowser ? localStorage.getItem('jwt_token') : null;
    }

    isLoggedIn(): boolean {
        return this.authState.value;
    }

    getAuthHeaders(): HttpHeaders {
        const token = this.getToken();
        return new HttpHeaders({
            'Authorization': token ? `Bearer ${token}` : ''
        });
    }

    logout(): void {
        const isBrowser = typeof window !== 'undefined' && !!window.localStorage;
        if (isBrowser) {
            localStorage.removeItem('jwt_token');
            localStorage.removeItem('user_nome');
            localStorage.removeItem('user_cpf');
            this.updateAuthState();
        }
    }
}
