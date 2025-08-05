import { Injectable } from '@angular/core';
import {
    HttpEvent,
    HttpInterceptor,
    HttpHandler,
    HttpRequest,
    HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Interceptor HTTP para adicionar token de autenticação automaticamente
 * - Adiciona Bearer token em todas as requisições (exceto login)
 * - Trata erros 401 fazendo logout automático
 * - Compatible com SSR (verifica se window existe)
 */
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    constructor(private router: Router, private authService: AuthService) { }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const isBrowser = typeof window !== 'undefined' && !!window.localStorage;
        const token = isBrowser ? localStorage.getItem('jwt_token') : null;
        let authReq = req;
        
        // Adiciona token de autorização se existir e não for requisição de login
        if (token && !req.url.endsWith('/login')) {
            authReq = req.clone({
                setHeaders: {
                    Authorization: `Bearer ${token}`
                }
            });
        }
        
        return next.handle(authReq).pipe(
            catchError((error: HttpErrorResponse) => {
                // Trata erro 401 (não autorizado) fazendo logout automático
                if (error.status === 401 && isBrowser) {
                    // Usa método logout do AuthService para garantir limpeza completa do estado
                    this.authService.logout();
                    this.router.navigate(['/']);
                    setTimeout(() => window.location.href = '/', 100);
                }
                return throwError(() => error);
            })
        );
    }
}
