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
    // Carregamento sob demanda - categorias são carregadas quando necessário
    // Isso melhora a performance inicial do componente
  }

  /**
   * Carrega todas as categorias disponíveis
   * Usado para popular a lista de categorias na interface
   */
  listarCategorias(): void {
    this.categoriaService.findAll().subscribe((response) => {
      this.categorias = response;
    });
  }

  /**
   * Carrega produtos de uma categoria específica
   * Define a categoria selecionada e atualiza lista de produtos
   */
  listarProdutosPorCategoria(categoriaId: number): void {
    // Define categoria selecionada para controle de estado
    this.categoriaSelecionada = this.categorias.find(categoria => categoria.id === categoriaId) || null;
    
    // Carrega produtos da categoria selecionada
    this.produtoService.findAllByCategoria(categoriaId.toString()).subscribe((response) => {
      this.produtos = response;
    });
  }

  /**
   * Adiciona produto ao carrinho
   * Valida se categoria foi selecionada antes de adicionar
   * Inclui observação do produto se existir
   */
  adicionarAoCarrinho(produto: Produto): void {
    if (this.categoriaSelecionada) {
      // Adiciona produto com quantidade padrão 1 e observação se existir
      this.cartClientService.addItem(produto, 1, produto.observacao || '');
      this.refreshService.triggerRefresh();
    } else {
      this.cartClientService.message('Selecione uma categoria primeiro', true);
    }
  }
}