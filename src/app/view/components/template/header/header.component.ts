import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NgIf, NgClass } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [NgIf, NgClass],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent implements OnInit {
  menuOpen = false;

  constructor(private router: Router) {}

  isActive(route: string): boolean {
    return this.router.url.startsWith(route);
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  goHome() {
    this.router.navigate(['/home']);
    this.menuOpen = false;
  }
  goCategoria() {
    this.router.navigate(['/categorias']);
    this.menuOpen = false;
  }
  goProduto() {
    this.router.navigate(['/produtos']);
    this.menuOpen = false;
  }
  goVendas() {
    this.router.navigate(['/vendas']);
    this.menuOpen = false;
  }
  goRelatorios() {
    this.router.navigate(['/relatorios']);
    this.menuOpen = false;
  }
  goAssinadas() {
    this.router.navigate(['/assinadas']);
    this.menuOpen = false;
  }
  goUsuario() {
    this.router.navigate(['/usuarios']);
    this.menuOpen = false;
  }
  goCliente() {
    this.router.navigate(['/clientes']);
    this.menuOpen = false;
  }
  goLogin() {
    this.menuOpen = false;
    setTimeout(() => {
      this.router.navigate(['/']);
    }, 200);
  }
  ngOnInit() {}
}