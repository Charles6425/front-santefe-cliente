import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private urlBase = environment.apiUrl;
    private apiUrl = this.urlBase + '/auth/login/cliente';
    private authState = new BehaviorSubject<boolean>(false);
    authState$ = this.authState.asObservable();

    constructor(private http: HttpClient) {
        // Verifica validade do token ao inicializar o serviço
        this.checkTokenValidity();
    }

    /**
     * Verifica se existe token no localStorage
     * Compatível com SSR (verifica se window existe)
     */
    private hasToken(): boolean {
        const isBrowser = typeof window !== 'undefined' && !!window.localStorage;
        return isBrowser ? !!localStorage.getItem('jwt_token') : false;
    }

    /**
     * Atualiza estado de autenticação baseado na presença do token
     */
    updateAuthState(): void {
        this.authState.next(this.hasToken());
    }

    /**
     * Verifica se o token JWT ainda é válido
     * Se token expirado ou inválido, faz logout automaticamente
     * Decodifica payload JWT para verificar expiração
     */
    checkTokenValidity(): void {
        const token = this.getToken();
        if (!token) {
            this.authState.next(false);
            return;
        }
        
        // Verificação de expiração do token JWT
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const now = Date.now() / 1000;
            if (payload.exp && payload.exp < now) {
                this.logout();
                return;
            }
        } catch (error) {
            // Se não conseguir decodificar o token, considera inválido
            this.logout();
            return;
        }
        this.authState.next(true);
    }

    /**
     * Realiza login do cliente
     * Salva token e dados do usuário no localStorage
     * Atualiza estado de autenticação
     */
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

    /**
     * Obtém token JWT do localStorage
     * Retorna null se não existir ou se não for ambiente browser
     */
    getToken(): string | null {
        const isBrowser = typeof window !== 'undefined' && !!window.localStorage;
        return isBrowser ? localStorage.getItem('jwt_token') : null;
    }

    /**
     * Verifica se usuário está logado
     * Baseado no estado atual do BehaviorSubject
     */
    isLoggedIn(): boolean {
        return this.authState.value;
    }

    /**
     * Cria headers de autorização com Bearer token
     * Usado para requisições autenticadas
     */
    getAuthHeaders(): HttpHeaders {
        const token = this.getToken();
        return new HttpHeaders({
            'Authorization': token ? `Bearer ${token}` : ''
        });
    }

    /**
     * Faz logout do usuário
     * Remove dados do localStorage e atualiza estado
     */
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
