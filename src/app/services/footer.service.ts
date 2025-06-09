import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class FooterService {
  private updateFooterSubject = new Subject<void>();
  updateFooter$ = this.updateFooterSubject.asObservable();

  /**
   * Dispara atualização do footer (para ser chamado por qualquer componente)
   */
  updateFooter() {
    this.updateFooterSubject.next();
  }
}
