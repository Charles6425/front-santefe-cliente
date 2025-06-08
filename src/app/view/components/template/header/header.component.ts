import { Component, OnInit } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [MatToolbarModule, CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
  animations: [
    trigger('menuAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-20px)' }),
        animate('200ms ease', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('200ms ease', style({ opacity: 0, transform: 'translateY(-20px)' }))
      ])
    ])
  ]
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
    this.router.navigate(['/']);
    this.menuOpen = false;
  }

  ngOnInit() {}
}