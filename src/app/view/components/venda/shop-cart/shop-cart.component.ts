import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { ItemDTO } from '../../../../models/item-dto';
import { CarrinhoService } from '../../../../services/carrinho.service';
import { RefreshService } from '../../../../services/refresh.service';
import { Venda } from '../../../../models/venda';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AssinadaService } from '../../../../services/assinada.service';
import { Assinada } from '../../../../models/assinada';
import { forkJoin, Observable, of } from 'rxjs';
import { FooterService } from '../../../../services/footer.service';
import { MatIconModule } from '@angular/material/icon';
import { PedidoService } from '../../../../services/pedido.service';
import { ProdutoService } from '../../../../services/produto.service';
import { Produto } from '../../../../models/produto';
import { CategoriaService } from '../../../../services/categoria.service';
import { Categoria } from '../../../../models/categoria';

@Component({
  selector: 'app-shop-cart',
  standalone: true,
  imports: [CommonModule, FormsModule, MatInputModule, MatFormFieldModule, MatSelectModule, MatProgressSpinnerModule, MatIconModule],
  providers: [FooterService],
  templateUrl: './shop-cart.component.html',
  styleUrl: './shop-cart.component.css'
})
export class ShopCartComponent implements OnInit {
  itensCarrinho: ItemDTO[] = [];
  totalCarrinho = 0;
  vendaId: number | null = null;
  finalizandoVenda = false;
  vendaDetalhe: Venda | null = null;
  mesa: number | null = null;
  formaPagamento = '';
  private _tipoAtendimento = '';
  valorDesconto: number | null = null;
  valorAcrescimo: number | null = null;
  cpfCliente: string = '';
  nomeCliente: string = '';
  enderecoCliente: string = '';
  telefoneCliente: string = '';
  telefoneCliente2: string = '';
  nomeDesconto: string = '';
  nomeAcrescimo: string = '';
  observacaoVenda: string = '';
  horarioEntrega: string = '';
  horarioRetirada: string = '';
  buscandoCliente = false;
  clienteEncontrado = false;
  clienteId: number | null = null;
  status: string = 'Aberto';
  produtos: Produto[] = [];
  categorias: Categoria[] = [];
  categoriaMap: Map<number, string> = new Map();

  // Método para obter o nome da categoria a partir do ID
  getCategoriaNome(categoriaId: number): string {
    return this.categoriaMap.get(categoriaId) || '';
  }

  // Método para manipular mudanças no horário de retirada com validação
  onHorarioRetiradaChange(value: string): void {
    // Atualiza o valor do horário de retirada quando o usuário modifica o campo
    this.horarioRetirada = value;
    
    // Validação do formato HH:mm
    if (value && !this.isValidTimeFormat(value)) {
      this.carrinhoService.message('Formato de horário inválido. Use HH:mm (ex: 14:30)', true);
    }
  }

  // Valida se o horário está no formato HH:mm e é um horário válido
  private isValidTimeFormat(time: string): boolean {
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(time);
  }

  // Converte horário HH:mm para HH:mm:ss
  private formatTimeToHHmmss(time: string): string {
    if (!time) return '';
    
    // Se já está no formato HH:mm:ss, retorna como está
    if (/^\d{2}:\d{2}:\d{2}$/.test(time)) {
      return time;
    }
    
    // Se está no formato HH:mm, adiciona :00
    if (/^\d{2}:\d{2}$/.test(time)) {
      return time + ':00';
    }
    
    // Se está no formato H:mm ou H:m, normaliza para HH:mm:ss
    const parts = time.split(':');
    if (parts.length === 2) {
      const hours = parts[0].padStart(2, '0');
      const minutes = parts[1].padStart(2, '0');
      return `${hours}:${minutes}:00`;
    }
    
    return time;
  }

  constructor(
    private carrinhoService: CarrinhoService,
    private refreshService: RefreshService,
    private produtoService: ProdutoService,
    private cdr: ChangeDetectorRef,
    private assinadaService: AssinadaService,
    private footerService: FooterService,
    private pedidoService: PedidoService,
    private categoriaService: CategoriaService
  ) {
    // Inscreve-se no serviço de refresh para atualizar o carrinho quando necessário
    this.refreshService.refresh$.subscribe(() => {
      this.listarItensCarrinho();
    });
  }

  ngOnInit(): void {
    // Carrega os itens do carrinho ao inicializar o componente
    this.listarItensCarrinho();
    // Carrega a lista de produtos disponíveis
    this.produtoService.findAll().subscribe((produtos) => {
      this.produtos = produtos;
    });
    // Carrega a lista de categorias
    this.categoriaService.findAll().subscribe((categorias) => {
      this.categorias = categorias;
      // Cria um mapa para acesso rápido: categoriaId -> nome da categoria
      this.categoriaMap.clear();
      categorias.forEach(categoria => {
        this.categoriaMap.set(categoria.id, categoria.descricao);
      });
    });
  }

  adicionarPrimeiroItemAoCarrinho(item: ItemDTO): void {
    // Se não há venda aberta, cria uma nova venda antes de adicionar o item
    if (!this.vendaId) {
      this.carrinhoService.getVendaAberta().subscribe({
        next: (id) => {
          this.vendaId = id;
          this.carregarDetalhesVenda(id);
          this.adicionarItemAoCarrinho(item);
        },
        error: () => {
          this.carrinhoService.message('Erro ao abrir venda!', true);
        }
      });
    } else {
      // Se já existe uma venda aberta, adiciona o item diretamente
      this.adicionarItemAoCarrinho(item);
    }
  }

  adicionarItemAoCarrinho(item: ItemDTO): void {
    // Adiciona o item ao carrinho e atualiza a lista
    this.carrinhoService.adicionar(item).subscribe(() => {
      this.listarItensCarrinho();
      this.carrinhoService.message('Item adicionado ao carrinho!');
    });
  }

  obterVendaAberta(): void {
    // Busca a venda aberta atual e carrega seus detalhes
    this.carrinhoService.getVendaAberta().subscribe({
      next: (id) => {
        this.vendaId = id;
        if (id) this.carregarDetalhesVenda(id);
        this.listarItensCarrinho();
      },
      error: (err) => {
        this.carrinhoService.message('Erro ao obter venda aberta!', true);
      }
    });
  }

  carregarDetalhesVenda(id: number): void {
    // Carrega os detalhes da venda específica (mesa, forma de pagamento, etc.)
    this.carrinhoService.getVendaDetalhada(id).subscribe({
      next: (dto) => {
        this.vendaDetalhe = dto.venda;
        this.mesa = dto.venda.mesa || null;
        this.formaPagamento = dto.venda.formaPagamento || '';
      },
      error: (err) => {
        // Erro silencioso para não interferir na experiência do usuário
      }
    });
  }

  listarItensCarrinho(): void {
    // Carrega todos os itens não finalizados do carrinho
    this.carrinhoService.getItensNaoFinalizados().subscribe({
      next: (response) => {
        this.itensCarrinho = response;
        this.calcularTotal();
        
        // Se houver itens no carrinho, garantir que o vendaId está atualizado
        if (this.itensCarrinho.length > 0) {
          this.carrinhoService.getVendaAberta().subscribe({
            next: (id) => {
              this.vendaId = id;
              // Atualiza o footer sempre que o carrinho muda
              this.footerService.updateFooter();
            },
            error: (err) => {
              // Atualiza o footer mesmo em caso de erro
              this.footerService.updateFooter();
            }
          });
        } else {
          this.vendaId = null;
          // Atualiza o footer quando o carrinho fica vazio
          this.footerService.updateFooter();
        }
      },
      error: (err) => {
        this.carrinhoService.message('Erro ao listar itens do carrinho!', true);
        // Atualiza o footer em caso de erro
        this.footerService.updateFooter();
      }
    });
  }

  removerItem(id: number): void {
    // Remove um item específico do carrinho
    this.carrinhoService.delete(id).subscribe(() => {
      this.listarItensCarrinho();
      this.carrinhoService.message('Item removido do carrinho!');
    });
  }

  alterarQuantidade(id: number, quantidade: number): void {
    // Atualiza a quantidade de um item específico
    this.carrinhoService.updateQuantidade(id, quantidade).subscribe(() => {
      this.listarItensCarrinho();
    });
  }

  calcularTotal(): void {
    // Calcula o valor total do carrinho baseado nos itens e suas quantidades
    this.totalCarrinho = this.itensCarrinho.reduce((total, item) => {
      return total + (item.valorUnitario * item.quantidade);
    }, 0);
  }

  buscarClientePorCpf(): void {
    // Valida o CPF antes de fazer a busca
    if (!this.cpfCliente || this.cpfCliente.length !== 11) {
      this.carrinhoService.message('CPF inválido. Por favor, insira um CPF válido.', true);
      return;
    }

    this.buscandoCliente = true;
    this.carrinhoService.buscarClientePorCpf(this.cpfCliente).subscribe({
      next: (cliente) => {
        // Preenche os dados do cliente encontrado
        this.nomeCliente = cliente.nome;
        this.telefoneCliente = cliente.telefone;
        this.clienteId = cliente.id;
        
        // Define o endereço apenas para entrega
        if (this.tipoAtendimento === 'ENTREGA') {
          this.enderecoCliente = cliente.endereco;
        } else if (this.tipoAtendimento === 'RETIRADA') {
          this.enderecoCliente = '';
        }
        
        this.clienteEncontrado = true;
        this.buscandoCliente = false;
        this.carrinhoService.message('Cliente encontrado e dados preenchidos com sucesso!');
        this.cdr.detectChanges();
      },
      error: () => {
        // Limpa os dados quando o cliente não é encontrado
        this.carrinhoService.message('Cliente não encontrado. Por favor, cadastre-o na tela de clientes.', true);
        this.nomeCliente = '';
        this.enderecoCliente = '';
        this.telefoneCliente = '';
        this.clienteEncontrado = false;
        this.buscandoCliente = false;
        this.cdr.detectChanges();
      }
    });
  }

  buscarCliente(): void {
    // Valida o CPF antes de fazer a busca
    if (!this.cpfCliente || this.cpfCliente.length !== 11) {
      this.carrinhoService.message('CPF inválido. Por favor, insira um CPF válido.', true);
      return;
    }

    this.buscandoCliente = true;
    this.carrinhoService.buscarClientePorCpf(this.cpfCliente).subscribe({
      next: (cliente) => {
        // Preenche os dados do cliente encontrado
        this.nomeCliente = cliente.nome;
        this.telefoneCliente = cliente.telefone;
        this.clienteId = cliente.id;
        
        // Define o endereço apenas para entrega
        if (this.tipoAtendimento === 'ENTREGA') {
          this.enderecoCliente = cliente.endereco;
        } else if (this.tipoAtendimento === 'RETIRADA') {
          this.enderecoCliente = '';
        }
        
        this.clienteEncontrado = true;
        this.buscandoCliente = false;
        this.carrinhoService.message('Cliente encontrado e dados preenchidos com sucesso!');
        this.cdr.detectChanges();
      },
      error: () => {
        // Limpa os dados quando o cliente não é encontrado
        this.carrinhoService.message('Cliente não encontrado. Por favor, cadastre-o na tela de clientes.', true);
        this.nomeCliente = '';
        this.enderecoCliente = '';
        this.telefoneCliente = '';
        this.clienteEncontrado = false;
        this.buscandoCliente = false;
        this.cdr.detectChanges();
      }
    });
  }



  // Constrói o payload para envio ao backend
  private buildPayload(): any {
    // Formata os itens do carrinho para o formato esperado pelo backend
    const itensFormatados = this.itensCarrinho.map(item => ({
      produtoId: item.produtoId ?? null,
      quantidade: item.quantidade ?? null,
      valorUnitario: item.valorUnitario ?? null,
      observacao: item.observacao ?? ''
    }));

    // Calcula o valor total dos itens
    const valorTotal = itensFormatados.reduce((soma, item) => soma + (item.valorUnitario * item.quantidade), 0);

    // Constrói o objeto de dados para envio
    const payload: any = {
      clienteId: this.clienteId ?? null,
      valorTotal: valorTotal,
      status: 'PENDENTE',
      quantidadeItens: itensFormatados.length,
      numeroMesa: this.tipoAtendimento === 'MESA' ? String(this.mesa ?? '') : '',
      formaPagamento: this.formaPagamento || '',
      tipoAtendimento: this.tipoAtendimento || '',
      cpfCliente: this.cpfCliente || '',
      nomeCliente: this.nomeCliente || '',
      enderecoCliente: this.enderecoCliente || '',
      telefoneCliente: this.telefoneCliente || '',
      telefoneCliente2: this.telefoneCliente2 || '',
      observacaoGeral: this.observacaoVenda || '',
      itens: itensFormatados
    };

    // Adiciona horarioRetirada APENAS para tipo RETIRADA
    if (this.tipoAtendimento === 'RETIRADA' && this.horarioRetirada) {
      payload.horarioRetirada = this.formatTimeToHHmmss(this.horarioRetirada);
    }

    return payload;
  }


  // Solicita um pedido com status PENDENTE (aguardando aprovação)
  solicitarPedido(): void {
    // Verifica se já está processando para evitar requisições duplicadas
    if (this.finalizandoVenda) return;
    
    // Validações obrigatórias
    if (!this.itensCarrinho.length) {
      this.carrinhoService.message('Adicione itens ao carrinho antes de solicitar o pedido.', true);
      return;
    }
    if (!this.tipoAtendimento || (this.tipoAtendimento === 'MESA' && !this.mesa)) {
      this.carrinhoService.message('Preencha o tipo de atendimento corretamente.', true);
      return;
    }
    
    // Validações específicas para RETIRADA
    if (this.tipoAtendimento === 'RETIRADA') {
      if (!this.cpfCliente) {
        this.carrinhoService.message('CPF do cliente é obrigatório para retirada.', true);
        return;
      }
      if (!this.horarioRetirada) {
        this.carrinhoService.message('Horário de retirada é obrigatório.', true);
        return;
      }
      if (!this.isValidTimeFormat(this.horarioRetirada)) {
        this.carrinhoService.message('Formato de horário inválido. Use HH:mm (ex: 14:30)', true);
        return;
      }
    }
    
    // Validações específicas para ENTREGA
    if (this.tipoAtendimento === 'ENTREGA') {
      if (!this.cpfCliente) {
        this.carrinhoService.message('CPF do cliente é obrigatório para entrega.', true);
        return;
      }
      if (!this.enderecoCliente) {
        this.carrinhoService.message('Endereço é obrigatório para entrega.', true);
        return;
      }
    }
    
    this.finalizandoVenda = true;
    
    // Constrói o payload com status PENDENTE para aguardar aprovação
    const payload = {
      ...this.buildPayload(),
      status: 'PENDENTE',
    };
    
    // Envia a solicitação do pedido
    this.pedidoService.create(payload).subscribe({
      next: () => {
        this.carrinhoService.message('Pedido solicitado com sucesso! Aguarde aprovação.');
        this.limparCarrinho(() => {
          this.resetForm();
          this.finalizandoVenda = false;
        });
      },
      error: () => {
        this.carrinhoService.message('Erro ao solicitar pedido!', true);
        this.finalizandoVenda = false;
      }
    });
  }

  // Reseta todos os campos do formulário para o estado inicial
  private resetForm(): void {
    this.vendaId = null;
    this.listarItensCarrinho();
    this.obterVendaAberta();
    this.refreshService.triggerRefresh();
    this.finalizandoVenda = false;
    this.tipoAtendimento = '';
    this.formaPagamento = '';
    this.mesa = null;
    this.valorDesconto = null;
    this.valorAcrescimo = null;
    this.nomeDesconto = '';
    this.nomeAcrescimo = '';
    this.observacaoVenda = '';
    this.cpfCliente = '';
    this.nomeCliente = '';
    this.enderecoCliente = '';
    this.telefoneCliente = '';
    this.telefoneCliente2 = '';
    this.horarioEntrega = '';
    this.horarioRetirada = '';
    this.clienteEncontrado = false;
    this.clienteId = null;
  }


  /**
   * Salva os itens do carrinho como assinadas no backend
   * @returns Observable com o resultado das operações
   */
  private salvarAssinadas(): Observable<any> {
    // Valida se há dados necessários para criar assinadas
    if (!this.vendaId || this.itensCarrinho.length === 0) {
      this.carrinhoService.message('Adicione itens ao carrinho antes de salvar como assinada.', true);
      return of(null);
    }

    const dataHora = new Date().toISOString();

    // Cria uma requisição de assinada para cada item do carrinho
    const assinadasRequests = this.itensCarrinho.map(item => {
      const assinada: Assinada = {
        vendaId: this.vendaId!,
        produtoId: item.produtoId!,
        cliente: { id: this.clienteId! },
        dataHora,
        valorUnitario: item.valorUnitario,
        quantidade: item.quantidade,
        valorTotal: item.valorTotal,
        status: this.status
      };

      return this.assinadaService.create(assinada);
    });

    // Executa todas as requisições em paralelo
    return forkJoin(assinadasRequests);
  }

  // Remove todos os itens do carrinho
  private limparCarrinho(callback?: () => void): void {
    // Se não há itens, executa callback diretamente
    if (this.itensCarrinho.length === 0) {
      if (callback) callback();
      return;
    }
    
    // Remove todos os itens em paralelo
    forkJoin(this.itensCarrinho.map(item => this.carrinhoService.delete(item.id!))).subscribe({
      next: () => {
        this.listarItensCarrinho();
        if (callback) callback();
      },
      error: () => {
        this.carrinhoService.message('Erro ao limpar o carrinho!', true);
        if (callback) callback();
      }
    });
  }

  // Setter e getter para tipo de atendimento com lógica de negócio
  set tipoAtendimento(value: string) {
    this._tipoAtendimento = value;
    // Se o tipo for COMANDA, automaticamente define a forma de pagamento
    if (value === 'COMANDA') {
      this.formaPagamento = 'COMANDA';
    }
  }
  
  get tipoAtendimento(): string {
    return this._tipoAtendimento;
  }


  /**
   * Finaliza a venda criando um pedido diretamente (sem aguardar aprovação)
   */
  finalizarVenda(): void {
    // Verifica se já está processando para evitar requisições duplicadas
    if (this.finalizandoVenda) {
      return;
    }
    
    // Validação básica de itens no carrinho
    if (!this.itensCarrinho.length) {
      this.carrinhoService.message('Adicione itens ao carrinho antes de criar o pedido.', true);
      return;
    }

    // Validações específicas baseadas no tipo de atendimento
    if ((this.tipoAtendimento === 'ENTREGA' || this.tipoAtendimento === 'RETIRADA' || this.tipoAtendimento === 'COMANDA') && !this.cpfCliente) {
      this.carrinhoService.message('CPF do cliente é obrigatório para entrega ou retirada.', true);
      return;
    }
    
    // Validações específicas para RETIRADA
    if (this.tipoAtendimento === 'RETIRADA') {
      if (!this.horarioRetirada) {
        this.carrinhoService.message('Horário de retirada é obrigatório.', true);
        return;
      }
      if (!this.isValidTimeFormat(this.horarioRetirada)) {
        this.carrinhoService.message('Formato de horário inválido. Use HH:mm (ex: 14:30)', true);
        return;
      }
    }
    
    // Validações específicas para ENTREGA
    if (this.tipoAtendimento === 'ENTREGA') {
      if (!this.enderecoCliente) {
        this.carrinhoService.message('Endereço é obrigatório para entrega.', true);
        return;
      }
    }
    if (this.valorDesconto && !this.nomeDesconto) {
      this.carrinhoService.message('Nome do desconto é obrigatório quando há valor de desconto.', true);
      return;
    }
    if (this.valorAcrescimo && !this.nomeAcrescimo) {
      this.carrinhoService.message('Nome do acréscimo é obrigatório quando há valor de acréscimo.', true);
      return;
    }
    if (!this.tipoAtendimento) {
      this.carrinhoService.message('Selecione o tipo de atendimento.', true);
      return;
    }
    if (!this.formaPagamento) {
      this.carrinhoService.message('Selecione a forma de pagamento.', true);
      return;
    }
    if (this.tipoAtendimento === 'MESA' && !this.mesa) {
      this.carrinhoService.message('Informe o número da mesa.', true);
      return;
    }
    
    this.finalizandoVenda = true;
    const payload = this.buildPayload();

    // Verifica se há uma venda aberta para finalizar
    if (!this.vendaId) {
      this.carrinhoService.message('Nenhuma venda aberta para finalizar!', true);
      this.finalizandoVenda = false;
      return;
    }

    // Finaliza a venda existente usando o CarrinhoService
    this.carrinhoService.finalizarVenda(this.vendaId, payload).subscribe({
      next: (res) => {
        this.carrinhoService.message('Pedido criado com sucesso!');
        this.limparCarrinho(() => {
          this.resetForm();
          this.finalizandoVenda = false;
        });
      },
      error: (err) => {
        console.error('Erro ao finalizar venda:', err);
        this.carrinhoService.message('Erro ao criar pedido!', true);
        this.finalizandoVenda = false;
      }
    });
  }




}
