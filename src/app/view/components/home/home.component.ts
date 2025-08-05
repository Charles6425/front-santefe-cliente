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
    
    // Observa mudanças no carrinho em tempo real
    this.cartClientService.cart$.subscribe(cart => {
      this.cart = cart;
    });
    
    // Observa refresh service (não necessário com localStorage, mas mantido para compatibilidade)
    this.refreshService.refresh$.subscribe(() => {
      // Com localStorage, estado do carrinho já é persistente
    });
  }

  /**
   * Carrega todas as categorias disponíveis
   * Reseta estado de categoria e produtos selecionados
   */
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
        this.cartClientService.message('Erro ao carregar categorias', true);
      }
    });
  }

  /**
   * Carrega produtos de uma categoria específica
   * Define categoria selecionada e busca produtos relacionados
   */
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
        this.cartClientService.message('Erro ao carregar produtos', true);
      }
    });
  }

  /**
   * Volta para a visualização de categorias
   * Limpa seleção de categoria e lista de produtos
   */
  voltarParaCategorias(): void {
    this.categoriaSelecionada = null;
    this.produtos = [];
  }

  /**
   * Adiciona produto ao carrinho
   * Valida se categoria está selecionada antes de adicionar
   */
  adicionarAoCarrinho(produto: Produto): void {
    if (!this.categoriaSelecionada) return;
    
    // Adiciona produto ao carrinho com quantidade padrão 1
    this.cartClientService.addItem(produto, 1, produto.observacao || '');
    this.refreshService.triggerRefresh();
  }

  /**
   * Verifica se produto já está no carrinho
   * Usado para controlar exibição visual na interface
   */
  estaNoCarrinho(produto: Produto): boolean {
    return this.cart.items.some(item => item.produtoId === produto.id);
  }
}
