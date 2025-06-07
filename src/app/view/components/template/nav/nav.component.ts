import { Component, OnInit } from '@angular/core';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatIconModule} from '@angular/material/icon';
import {MatListModule} from '@angular/material/list';
import { Router } from '@angular/router';
import { AuthService } from '../../../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-nav',
  imports: [CommonModule, MatSidenavModule, MatIconModule, MatListModule],
  templateUrl: './nav.component.html',
  styleUrl: './nav.component.css'
})
export class NavComponent implements OnInit {
  isMenuOpen: boolean = false;
  constructor(private router : Router, public authService: AuthService) { }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }
  
  ngOnInit(): void {
  }

  goHome(): void{
    this.router.navigate(['/home']);
  }

  goCategoria(): void{
    this.router.navigate(['/categorias']);
  } 

  goUsuario(): void{
    this.router.navigate(['/usuarios']);
  } 

  goCliente(): void{
    this.router.navigate(['/clientes']);
  }

  goProduto(): void{
    this.router.navigate(['/produtos']);
  }

  goVendas(): void{
    this.router.navigate(['/vendas']);
  }

  goLogin(): void {
    this.router.navigate(['/']);
  }

  goCriarConta(): void {
    this.router.navigate(['/usuarios/create']);
  }

  goRelatorios(): void {
    this.router.navigate(['/relatorios']);
  }

  
  goAssinadas(): void {
    this.router.navigate(['/assinadas']);
  }

  isAuthenticated(): boolean {
    return this.authService.isLoggedIn();
  }
}
