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
    // Inicializa o estado de autenticação imediatamente, sem delay
    this.isAuth = this.authService.isLoggedIn();
    this.loading = false;
  }

  ngOnInit(): void {
    // Força verificação do token na inicialização
    this.authService.checkTokenValidity();
    
    this.authSub = this.authService.authState$.subscribe(state => {
      this.isAuth = state;
      // Se o usuário não estiver autenticado e não estiver na página de login,
      // redireciona para login
      if (!state && this.router.url !== '/') {
        this.router.navigate(['/']);
      }
    });
  }

  ngAfterViewInit(): void {
    this.toggleFooterFixed();
    this.ngZone.runOutsideAngular(() => {
      this.resizeListener = this.renderer.listen('window', 'resize', () => {
        this.toggleFooterFixed();
      });
    });
    // Ouve navegação de rotas para ajustar o footer
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

  ngOnDestroy(): void {
    this.authSub?.unsubscribe();
    if (this.resizeListener) this.resizeListener();
    this.routerEventsSub?.unsubscribe();
    this.mutationObserver?.disconnect();
  }

  toggleFooterFixed(): void {
    setTimeout(() => {
      const layout = this.el.nativeElement.querySelector('.main-layout');
      const footer = this.el.nativeElement.querySelector('app-footer .footer');
      if (!layout || !footer) return;
      const layoutRect = layout.getBoundingClientRect();
      const bodyHeight = document.body.offsetHeight;
      const windowHeight = window.innerHeight;
      if (bodyHeight <= windowHeight) {
        this.renderer.addClass(footer, 'footer--fixed');
      } else {
        this.renderer.removeClass(footer, 'footer--fixed');
      }
    }, 50);
  }

  isAuthenticated(): boolean {
    return this.isAuth;
  }
}
