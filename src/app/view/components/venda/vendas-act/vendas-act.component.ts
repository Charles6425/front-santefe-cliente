import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { Categoria } from '../../../../models/categoria';
import { CategoriaService } from '../../../../services/categoria.service';
import { ProdutoService } from '../../../../services/produto.service';
import { Produto } from '../../../../models/produto';
import { CartClientService } from '../../../../services/cart-client.service';
import { ShopCartComponent } from "../shop-cart/shop-cart.component";
import { RefreshService } from '../../../../services/refresh.service';

@Component({
  selector: 'app-vendas-act',
  imports: [CommonModule, MatCardModule, ShopCartComponent],
  templateUrl: './vendas-act.component.html',
  styleUrls: ['./vendas-act.component.css']
})
export class VendasActComponent implements OnInit {
  categorias: Categoria[] = [];
  produtos: Produto[] = [];
  categoriaSelecionada: Categoria | null = null;

  constructor(
    private categoriaService: CategoriaService,
    private produtoService: ProdutoService,
    private cartClientService: CartClientService,
    private refreshService: RefreshService
  ) { }

  ngOnInit(): void {
    // Componente inicializado sem carregar categorias/produtos automaticamente
    // O carregamento é feito sob demanda quando necessário
  }

  listarCategorias(): void {
    // Carrega todas as categorias disponíveis
    this.categoriaService.findAll().subscribe((response) => {
      this.categorias = response;
    });
  }

  listarProdutosPorCategoria(categoriaId: number): void {
    // Define a categoria selecionada e carrega seus produtos
    this.categoriaSelecionada = this.categorias.find(categoria => categoria.id === categoriaId) || null;
    this.produtoService.findAllByCategoria(categoriaId.toString()).subscribe((response) => {
      this.produtos = response;
    });
  }

  adicionarAoCarrinho(produto: Produto): void {
    // Verifica se uma categoria foi selecionada antes de adicionar
    if (this.categoriaSelecionada) {
      // Adiciona o produto ao carrinho usando o novo serviço
      this.cartClientService.addItem(produto, 1, produto.observacao || '');
      this.refreshService.triggerRefresh();
    } else {
      this.cartClientService.message('Selecione uma categoria primeiro', true);
    }
  }
}