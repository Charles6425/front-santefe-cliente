import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Categoria } from '../../../models/categoria';
import { Produto } from '../../../models/produto';
import { CategoriaService } from '../../../services/categoria.service';
import { ProdutoService } from '../../../services/produto.service';
import { CartClientService } from '../../../services/cart-client.service';
import { RefreshService } from '../../../services/refresh.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';
import { Cart } from '../../../models/cart-client.interface';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [MatCardModule, MatFormFieldModule, MatInputModule, FormsModule, CommonModule, MatProgressSpinnerModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  categorias: Categoria[] = [];
  produtos: Produto[] = [];
  categoriaSelecionada: Categoria | null = null;
  loading: boolean = false;
  cart: Cart = {
    items: [],
    quantidadeItens: 0,
    valorProdutos: 0,
    valorTotal: 0,
    dataUltimaAtualizacao: new Date()
  };

  constructor(
    private categoriaService: CategoriaService,
    private produtoService: ProdutoService,
    private cartClientService: CartClientService,
    private refreshService: RefreshService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.buscarCategorias();
    
    // Inscrever-se nas mudanças do carrinho
    this.cartClientService.cart$.subscribe(cart => {
      this.cart = cart;
    });
    
    this.refreshService.refresh$.subscribe(() => {
      // Com localStorage, não precisa atualizar via HTTP
    });
  }

  buscarCategorias(): void {
    this.loading = true;
    this.categoriaService.findAll().subscribe({
      next: (res) => {
        this.categorias = res;
        this.categoriaSelecionada = null;
        this.produtos = [];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  buscarProdutosPorCategoria(categoria: Categoria): void {
    this.categoriaSelecionada = categoria;
    this.loading = true;
    this.produtoService.findAllByCategoria(categoria.id.toString()).subscribe({
      next: (res) => {
        this.produtos = res;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  voltarParaCategorias(): void {
    this.categoriaSelecionada = null;
    this.produtos = [];
  }

  adicionarAoCarrinho(produto: Produto): void {
    if (!this.categoriaSelecionada) return;
    
    // Usar o novo serviço para adicionar ao carrinho
    this.cartClientService.addItem(produto, 1, produto.observacao || '');
    this.refreshService.triggerRefresh();
  }

  estaNoCarrinho(produto: Produto): boolean {
    return this.cart.items.some(item => item.produtoId === produto.id);
  }
}
