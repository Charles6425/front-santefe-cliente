
import { Routes } from '@angular/router';
import { HomeComponent } from './view/components/home/home.component';

import { authGuard } from './guards/auth.guard';
import { LoginComponent } from './view/components/login/login.component';
import { VendasActComponent } from './view/components/venda/vendas-act/vendas-act.component';


export const routes: Routes = [
  {
    path: '',
    component: LoginComponent // tela de login isolada
  },
  {
    path: 'home',
    component: HomeComponent, // tela de boas-vindas protegida
    canActivate: [authGuard]
  },
  {
    path: 'vendas',
    component: VendasActComponent,
    canActivate: [authGuard]
  }


];
