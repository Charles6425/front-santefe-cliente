import { Component, OnInit, OnDestroy, AfterViewInit, Renderer2, ElementRef, NgZone } from '@angular/core';
import { HeaderComponent } from './view/components/template/header/header.component';
import { FooterComponent } from './view/components/template/footer/footer.component';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';
import { Subscription } from 'rxjs';
import { Router, NavigationEnd } from '@angular/router';

@Component({
  selector: 'app-root',
    standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    FooterComponent,
    RouterOutlet
  ],
  templateUrl: 'app.component.html'
})
export class AppComponent implements OnInit, OnDestroy, AfterViewInit {
  title = 'santafe';
  isAuth = false;
  loading = true;
  private authSub?: Subscription;
  private resizeListener?: () => void;
  private routerEventsSub?: Subscription;
  private mutationObserver?: MutationObserver;

  constructor(
    public authService: AuthService,
    private router: Router,
    private renderer: Renderer2,
    private el: ElementRef,
    private ngZone: NgZone
  ) {
    // Inicializa estado de autenticação imediatamente para evitar flicker
    this.isAuth = this.authService.isLoggedIn();
    this.loading = false;
  }

  ngOnInit(): void {
    // Força verificação de validade do token na inicialização
    this.authService.checkTokenValidity();
    
    // Observa mudanças no estado de autenticação
    this.authSub = this.authService.authState$.subscribe(state => {
      this.isAuth = state;
      // Redireciona para login se não autenticado e não estiver na página inicial
      if (!state && this.router.url !== '/') {
        this.router.navigate(['/']);
      }
    });
  }

  ngAfterViewInit(): void {
    // Configura footer responsivo inicial
    this.toggleFooterFixed();
    
    // Configura listener de resize fora da zona Angular para performance
    this.ngZone.runOutsideAngular(() => {
      this.resizeListener = this.renderer.listen('window', 'resize', () => {
        this.toggleFooterFixed();
      });
    });
    
    // Observa mudanças de rota para reajustar footer
    this.routerEventsSub = this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        setTimeout(() => this.toggleFooterFixed(), 100);
      }
    });
    
    // Observa mudanças dinâmicas no conteúdo principal
    const mainContent = this.el.nativeElement.querySelector('.main-content');
    if (mainContent) {
      this.mutationObserver = new MutationObserver(() => {
        this.toggleFooterFixed();
      });
      this.mutationObserver.observe(mainContent, {
        childList: true,
        subtree: true,
        characterData: true,
        attributes: true
      });
    }
  }

  /**
   * Limpa todas as subscriptions e listeners ao destruir componente
   * Evita memory leaks
   */
  ngOnDestroy(): void {
    this.authSub?.unsubscribe();
    if (this.resizeListener) this.resizeListener();
    this.routerEventsSub?.unsubscribe();
    this.mutationObserver?.disconnect();
  }

  /**
   * Controla se o footer deve ser fixo na parte inferior
   * Footer fixo quando o conteúdo não preenche a tela inteira
   */
  toggleFooterFixed(): void {
    setTimeout(() => {
      const layout = this.el.nativeElement.querySelector('.main-layout');
      const footer = this.el.nativeElement.querySelector('app-footer .footer');
      if (!layout || !footer) return;
      
      const bodyHeight = document.body.offsetHeight;
      const windowHeight = window.innerHeight;
      
      if (bodyHeight <= windowHeight) {
        this.renderer.addClass(footer, 'footer--fixed');
      } else {
        this.renderer.removeClass(footer, 'footer--fixed');
      }
    }, 50);
  }

  /**
   * Método público para verificar se usuário está autenticado
   * Usado no template para controlar exibição de elementos
   */
  isAuthenticated(): boolean {
    return this.isAuth;
  }
}
