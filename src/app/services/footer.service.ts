import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

/**
 * Serviço para gerenciar atualizações do footer
 * Usado para notificar sobre mudanças que afetam o posicionamento do footer
 * Principalmente para controlar se footer deve ser fixo ou não
 */
@Injectable({ providedIn: 'root' })
export class FooterService {
  private updateFooterSubject = new Subject<void>();
  updateFooter$ = this.updateFooterSubject.asObservable();

  /**
   * Dispara atualização do footer
   * Pode ser chamado por qualquer componente que afete o layout da página
   */
  updateFooter() {
    this.updateFooterSubject.next();
  }
}
