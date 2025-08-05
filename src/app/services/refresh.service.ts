import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

/**
 * Serviço para gerenciar atualizações de componentes
 * Usado para notificar componentes sobre mudanças que requerem refresh
 * Principalmente usado para sincronizar estado entre componentes
 */
@Injectable({
    providedIn: 'root'
})
export class RefreshService {
    private refreshSubject = new Subject<void>();
    refresh$ = this.refreshSubject.asObservable();

    /**
     * Dispara evento de refresh para todos os componentes inscritos
     * Usado quando alterações no carrinho precisam ser refletidas na UI
     */
    triggerRefresh(): void {
        this.refreshSubject.next();
    }
}