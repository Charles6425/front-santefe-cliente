import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { Categoria } from '../../../../models/categoria';
import { CategoriaService } from '../../../../services/categoria.service';
import { ProdutoService } from '../../../../services/produto.service';
import { Produto } from '../../../../models/produto';
import { CarrinhoService } from '../../../../services/carrinho.service';
import { ShopCartComponent } from "../shop-cart/shop-cart.component";
import { RefreshService } from '../../../../services/refresh.service';
import { ItemDTO } from '../../../../models/item-dto';

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
    private carrinhoService: CarrinhoService,
    private refreshService: RefreshService
  ) { }

  ngOnInit(): void {
    this.listarCategorias();
  }

  listarCategorias(): void {
    this.categoriaService.findAll().subscribe((response) => {
      this.categorias = response;
    });
  }

  listarProdutosPorCategoria(categoriaId: number): void {
    this.categoriaSelecionada = this.categorias.find(categoria => categoria.id === categoriaId) || null;
    this.produtoService.findAllByCategoria(categoriaId.toString()).subscribe((response) => {
      this.produtos = response;
    });
  }

  adicionarAoCarrinho(produto: Produto): void {
    if (this.categoriaSelecionada) {
      // categoriaId é obrigatório para o backend. Sempre inclua!
      const novoItem: ItemDTO = {
        id: 0, // será ignorado pelo backend ao criar
        produto: produto.descricao,
        produtoId: produto.id, // campo essencial para o backend
        categoria: this.categoriaSelecionada.descricao,
        categoriaId: this.categoriaSelecionada.id, // campo essencial para o backend
        quantidade: 1,
        valorUnitario: parseFloat(produto.valor),
        valorTotal: parseFloat(produto.valor),
        observacao: ''
      };
      console.log('Novo item:', novoItem);
      this.carrinhoService.getVendaAberta().subscribe({
        next: () => {
          this.carrinhoService.adicionar(novoItem).subscribe({
            next: () => {
              this.carrinhoService.message(`${produto.descricao} adicionado ao carrinho!`);
              this.refreshService.triggerRefresh();
            },
            error: (erro) => {
              this.carrinhoService.message('Erro ao adicionar item ao carrinho');
              console.error(erro);
            }
          });
        },
        error: (erro) => {
          this.carrinhoService.message('Erro ao abrir venda!', true);
        }
      });
    } else {
      this.carrinhoService.message('Selecione uma categoria primeiro');
    }
  }
}