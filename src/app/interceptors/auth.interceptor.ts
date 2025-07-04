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

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    constructor(private router: Router, private authService: AuthService) { }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const isBrowser = typeof window !== 'undefined' && !!window.localStorage;
        const token = isBrowser ? localStorage.getItem('jwt_token') : null;
        let authReq = req;
        if (token && !req.url.endsWith('/login')) {
            authReq = req.clone({
                setHeaders: {
                    Authorization: `Bearer ${token}`
                }
            });
        }
        return next.handle(authReq).pipe(
            catchError((error: HttpErrorResponse) => {
                if (error.status === 401 && isBrowser) {
                    // Usar o método logout do AuthService para garantir que o estado seja atualizado
                    this.authService.logout();
                    this.router.navigate(['/']);
                    setTimeout(() => window.location.href = '/', 100);
                }
                return throwError(() => error);
            })
        );
    }
}
