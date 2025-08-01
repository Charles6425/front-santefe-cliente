import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { NgIf, NgClass } from '@angular/common';
import { AuthService } from '../../../../services/auth.service';
import { CartClientService } from '../../../../services/cart-client.service';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [NgIf, NgClass],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit, OnDestroy {
  cartItemCount = 0;
  currentRoute = '';
  private subscriptions: Subscription[] = [];

  constructor(
    private router: Router, 
    private authService: AuthService,
    private cartClientService: CartClientService
  ) {}

  ngOnInit(): void {
    // Observa mudanças na rota atual
    const routerSub = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.currentRoute = event.url;
      });
    this.subscriptions.push(routerSub);

    // Observa mudanças no carrinho em tempo real
    const cartSub = this.cartClientService.itemCount$.subscribe((count: number) => {
      this.cartItemCount = count;
    });
    this.subscriptions.push(cartSub);

    // Define rota inicial
    this.currentRoute = this.router.url;
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  /**
   * Verifica se a página atual é a do carrinho
   */
  isCartPage(): boolean {
    return this.currentRoute.includes('/vendas');
  }

  /**
   * Navegação dinâmica entre carrinho e home
   */
  toggleNavigation(): void {
    if (!this.authService.isLoggedIn()) {
      this.logout();
      return;
    }

    if (this.isCartPage()) {
      // Se está no carrinho, vai para home
      this.router.navigate(['/home']);
    } else {
      // Se está em qualquer outra página, vai para carrinho
      this.router.navigate(['/vendas']);
    }
  }

  /**
   * Faz logout do usuário
   */
  logout(): void {
    this.authService.logout();
    setTimeout(() => {
      this.router.navigate(['/']);
    }, 200);
  }

  /**
   * Método público para atualizar contagem do carrinho
   * Pode ser chamado por outros componentes quando itens são adicionados/removidos
   */
  refreshCartCount(): void {
    // Com o novo serviço, a contagem é automaticamente atualizada via Observable
    // Não precisa de refresh manual
  }
}