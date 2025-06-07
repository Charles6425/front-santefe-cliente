
import { Component, OnInit, OnDestroy } from '@angular/core';
import { HeaderComponent } from './view/components/template/header/header.component';
import { FooterComponent } from './view/components/template/footer/footer.component';
import { NavComponent } from './view/components/template/nav/nav.component';
import { MatSidenavModule } from '@angular/material/sidenav';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
    standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    FooterComponent,
    NavComponent,
    MatSidenavModule,
    RouterOutlet
  ],
  templateUrl: 'app.component.html'
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'santafe';
  isAuth = false;
  loading = true;
  private authSub?: Subscription;

  constructor(public authService: AuthService, private router: Router) {
    // Inicializa o estado de autenticação imediatamente, sem delay
    this.isAuth = this.authService.isLoggedIn();
    this.loading = false;
  }

  ngOnInit(): void {
    this.authSub = this.authService.authState$.subscribe(state => {
      this.isAuth = state;
      // loading já está false após o construtor
    });
  }

  ngOnDestroy(): void {
    this.authSub?.unsubscribe();
  }

  isAuthenticated(): boolean {
    return this.isAuth;
  }
}
