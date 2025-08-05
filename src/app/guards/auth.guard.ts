import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Guard de autenticação para proteger rotas
 * Verifica se usuário está logado antes de permitir acesso
 * Redireciona para página de login se não autenticado
 */
export const authGuard: CanActivateFn = () => {
    const authService = inject(AuthService);
    const router = inject(Router);
    
    if (authService.isLoggedIn()) {
        return true;
    } else {
        // Redireciona para página de login
        return router.parseUrl('/');
    }
};
