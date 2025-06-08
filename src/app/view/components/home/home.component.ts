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
import { CarrinhoService } from '../../../services/carrinho.service';
import { ItemDTO } from '../../../models/item-dto';
import { RefreshService } from '../../../services/refresh.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';

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
  itensCarrinho: ItemDTO[] = [];

  constructor(
    private categoriaService: CategoriaService,
    private produtoService: ProdutoService,
    private carrinhoService: CarrinhoService,
    private refreshService: RefreshService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.buscarCategorias();
    this.refreshService.refresh$.subscribe(() => {
      this.atualizarItensCarrinho();
    });
    this.atualizarItensCarrinho();
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
    const item: ItemDTO = {
      id: 0,
      produto: produto.descricao,
      produtoId: produto.id,
      categoria: this.categoriaSelecionada.descricao,
      categoriaId: this.categoriaSelecionada.id,
      quantidade: 1,
      valorUnitario: parseFloat(produto.valor),
      valorTotal: parseFloat(produto.valor),
      observacao: ''
    };
    this.carrinhoService.adicionar(item).subscribe({
      next: () => {
        this.carrinhoService.message(`${produto.descricao} adicionado ao carrinho!`);
        this.refreshService.triggerRefresh();
      },
      error: () => {
        this.carrinhoService.message('Erro ao adicionar item ao carrinho', true);
      }
    });
  }

  atualizarItensCarrinho(): void {
    this.carrinhoService.getItensNaoFinalizados().subscribe({
      next: (res) => {
        this.itensCarrinho = res;
      },
      error: () => {
        this.itensCarrinho = [];
      }
    });
  }

  isProdutoNoCarrinho(produto: Produto): boolean {
    return this.itensCarrinho.some(item => item.produtoId === produto.id);
  }
}
