import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; // Adicionado ChangeDetectorRef
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
import { stat } from 'fs';
import { FooterService } from '../../../../services/footer.service';
import { MatIconModule } from '@angular/material/icon';
import { PedidoService } from '../../../../services/pedido.service';

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
  nomeDesconto: string = '';
  nomeAcrescimo: string = '';
  observacaoVenda: string = '';
  horarioEntrega: string = '';
  horarioRetirada: string = '';
  buscandoCliente = false;
  clienteEncontrado = false;
  clienteId: number | null = null;
  status: string = 'Aberto'; // Status fixo para finalização

  // Novo método para debug
  onHorarioRetiradaChange(value: string): void {
    console.log('Horário de Retirada (ngModelChange):', value);
  }

  constructor(
    private carrinhoService: CarrinhoService,
    private refreshService: RefreshService,
    private cdr: ChangeDetectorRef, // Injetado ChangeDetectorRef
    private assinadaService: AssinadaService,
    private footerService: FooterService, // Injetado FooterService
    private pedidoService: PedidoService
  ) {
    this.refreshService.refresh$.subscribe(() => {
      this.listarItensCarrinho();
    });
  }

  ngOnInit(): void {
    this.listarItensCarrinho();
  }

  adicionarPrimeiroItemAoCarrinho(item: ItemDTO): void {
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
      this.adicionarItemAoCarrinho(item);
    }
  }

  adicionarItemAoCarrinho(item: ItemDTO): void {
    this.carrinhoService.adicionar(item).subscribe(() => {

      this.listarItensCarrinho();
      this.carrinhoService.message('Item adicionado ao carrinho!');

    });
  }

  obterVendaAberta(): void {
    this.carrinhoService.getVendaAberta().subscribe({
      next: (id) => {
        this.vendaId = id;
        if (id) this.carregarDetalhesVenda(id);
        this.listarItensCarrinho();
      },
      error: (err) => {
        console.error('Erro ao obter venda aberta:', err);
        this.carrinhoService.message('Erro ao obter venda aberta!', true);
      }
    });
  }

  carregarDetalhesVenda(id: number): void {
    this.carrinhoService.getVendaDetalhada(id).subscribe({
      next: (dto) => {
        this.vendaDetalhe = dto.venda;
        this.mesa = dto.venda.mesa || null;
        this.formaPagamento = dto.venda.formaPagamento || '';
      },
      error: (err) => {
        console.error('Erro ao carregar detalhes da venda:', err);
      }
    });
  }

  listarItensCarrinho(): void {
    this.carrinhoService.getItensNaoFinalizados().subscribe({
      next: (response) => {
        this.itensCarrinho = response;
        this.calcularTotal();
        // Se houver itens no carrinho, garantir que o vendaId está atualizado
        if (this.itensCarrinho.length > 0) {
          this.carrinhoService.getVendaAberta().subscribe({
            next: (id) => {
              this.vendaId = id;
              // Opcional: carregar detalhes da venda se necessário
              // this.carregarDetalhesVenda(id);
              this.footerService.updateFooter(); // Atualiza o footer sempre que o carrinho muda
            },
            error: (err) => {
              console.error('Erro ao obter venda aberta após listar itens:', err);
              this.footerService.updateFooter(); // Atualiza mesmo em caso de erro
            }
          });
        } else {
          this.vendaId = null;
          this.footerService.updateFooter(); // Atualiza o footer quando o carrinho fica vazio
        }
      },
      error: (err) => {
        console.error('Erro ao listar itens do carrinho:', err);
        this.carrinhoService.message('Erro ao listar itens do carrinho!', true);
        this.footerService.updateFooter(); // Atualiza o footer em caso de erro
      }
    });
  }

  removerItem(id: number): void {
    this.carrinhoService.delete(id).subscribe(() => {
      this.listarItensCarrinho();
      this.carrinhoService.message('Item removido do carrinho!');
    });
  }

  alterarQuantidade(id: number, quantidade: number): void {
    this.carrinhoService.updateQuantidade(id, quantidade).subscribe(() => {
      this.listarItensCarrinho();
    });
  }

  calcularTotal(): void {
    this.totalCarrinho = this.itensCarrinho.reduce((total, item) => {
      return total + (item.valorUnitario * item.quantidade);
    }, 0);
  }

  buscarClientePorCpf(): void {
    if (!this.cpfCliente || this.cpfCliente.length !== 11) {
      this.carrinhoService.message('CPF inválido. Por favor, insira um CPF válido.', true);
      return;
    }

    this.buscandoCliente = true;
    this.carrinhoService.buscarClientePorCpf(this.cpfCliente).subscribe({
      next: (cliente) => {
        this.nomeCliente = cliente.nome;
        this.telefoneCliente = cliente.telefone;
        this.clienteId = cliente.id;
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
    // Implemente aqui a lógica de busca do cliente pelo CPF
    // Exemplo: this.carrinhoService.buscarClientePorCpf(this.cpfCliente).subscribe(...)
    // Por enquanto, apenas um log para debug
    console.log('Buscar cliente pelo CPF:', this.cpfCliente);
  }



private buildPayload(status: string = 'FINALIZADA', finalizada: boolean = true): any {
  // Formata os itens conforme esperado pelo backend
  const itensFormatados = this.itensCarrinho.map(item => ({
    produto: { id: item.produtoId, nome: item.produto },
    quantidade: item.quantidade,
    valorUnitario: item.valorUnitario,
    valorTotal: item.valorUnitario * item.quantidade,
    valorAcrescimo: (item as any).valorAcrescimo || null,
    valorDesconto: (item as any).valorDesconto || null,
    observacao: item.observacao || null
  }));

  // Soma o valor total dos itens
  const valorTotal = itensFormatados.reduce((soma, item) => soma + (item.valorTotal || 0), 0);

  // Monta o payload principal
  const payload: any = {
    // id: this.vendaId ?? undefined,
    valorTotal: valorTotal,
    status,
    finalizada,
    dataVenda: new Date().toISOString(),
    valorDesconto: this.valorDesconto || undefined,
    valorAcrescimo: this.valorAcrescimo || undefined,
    numeroMesa: this.tipoAtendimento === 'MESA' ? this.mesa ?? undefined : undefined,
    formaPagamento: this.formaPagamento || undefined,
    tipoAtendimento: this.tipoAtendimento || undefined,
    cpfCliente: this.cpfCliente || undefined,
    nomeCliente: (this.tipoAtendimento !== 'RETIRADA' && this.tipoAtendimento !== 'ENTREGA') ? (this.nomeCliente || undefined) : undefined,
    enderecoCliente: (this.tipoAtendimento !== 'RETIRADA' && this.tipoAtendimento !== 'ENTREGA') ? (this.enderecoCliente || undefined) : undefined,
    horarioRetirada: this.horarioRetirada ? this.toIsoDateTime(this.horarioRetirada) : undefined,
    nomeAcrescimo: this.nomeAcrescimo || undefined,
    nomeDesconto: this.nomeDesconto || undefined,
    observacaoGeral: this.observacaoVenda || undefined,
    itens: itensFormatados
  };

  // Remove campos undefined do payload
  Object.keys(payload).forEach(key => payload[key] === undefined && delete payload[key]);

  return payload;
}



  /**
   * Garante que o horário seja enviado no formato esperado pelo backend: 'dd/MM/yyyy HH:mm:ss'.
   * Aceita entradas como '18:30', '2025-05-18T11:00', '2025-05-18T11:00:00', 'dd/MM/yyyy HH:mm', etc.
   * Sempre retorna com segundos.
   */
  private toIsoDateTime(time: string): string {
    if (!time) return '';

    // ISO: YYYY-MM-DDTHH:mm ou YYYY-MM-DDTHH:mm:ss
    const isoRegex = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/;
    const isoMatch = time.match(isoRegex);
    if (isoMatch) {
      const [_, yyyy, mm, dd, hh, min, ss] = isoMatch;
      return `${dd}/${mm}/${yyyy} ${hh}:${min}:${ss ? ss : '00'}`;
    }

    // BR com segundos: DD/MM/YYYY HH:mm:ss
    const brWithSecRegex = /^(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2}):(\d{2})$/;
    if (brWithSecRegex.test(time)) {
      return time;
    }

    // BR sem segundos: DD/MM/YYYY HH:mm
    const brNoSecRegex = /^(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2})$/;
    const brNoSecMatch = time.match(brNoSecRegex);
    if (brNoSecMatch) {
      const [_, dd, mm, yyyy, hh, min] = brNoSecMatch;
      return `${dd}/${mm}/${yyyy} ${hh}:${min}:00`;
    }

    // Só hora:minuto (ex: '18:30')
    if (/^\d{2}:\d{2}$/.test(time)) {
      const today = new Date();
      const [hour, minute] = time.split(':');
      const dd = String(today.getDate()).padStart(2, '0');
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const yyyy = today.getFullYear();
      return `${dd}/${mm}/${yyyy} ${hour}:${minute}:00`;
    }

    // Se não reconhecido, retorna string original (mas loga para debug)
    console.warn('Formato de horário não reconhecido:', time);
    return time;
  }


solicitarPedido(): void {
  if (this.finalizandoVenda) return;
  if (!this.itensCarrinho.length) {
    this.carrinhoService.message('Adicione itens ao carrinho antes de solicitar o pedido.', true);
    return;
  }
  if (!this.tipoAtendimento || (this.tipoAtendimento === 'MESA' && !this.mesa)) {
    this.carrinhoService.message('Preencha o tipo de atendimento corretamente.', true);
    return;
  }
  this.finalizandoVenda = true;
  const payload = {
    ...this.buildPayload(),
    status: 'PENDENTE', // status aguardando aprovação do adm
    finalizada: false
  };
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
    this.horarioEntrega = '';
    this.horarioRetirada = '';
  }


  /**
   * Salvar as assinadas separadamente no backend.
   * @returns
   */
  private salvarAssinadas(): Observable<any> {
    if (!this.vendaId || this.itensCarrinho.length === 0) {
      this.carrinhoService.message('Adicione itens ao carrinho antes de salvar como assinada.', true);
      return of(null);
    }

    const dataHora = new Date().toISOString();

    const assinadasRequests = this.itensCarrinho.map(item => {
      const assinada: Assinada = {
        vendaId: this.vendaId!,
        produtoId: item.produtoId!, // <-- Aqui usa o id do produto!

        cliente: { id: this.clienteId! }, // ajuste conforme sua lógica para obter o clienteId
        dataHora,
        valorUnitario: item.valorUnitario,
        quantidade: item.quantidade,
        valorTotal: item.valorTotal,
        status: this.status // Status fixo para finalização
      };

      return this.assinadaService.create(assinada);

    });

    return forkJoin(assinadasRequests);
  }

  private limparCarrinho(callback?: () => void): void {
    if (this.itensCarrinho.length === 0) {
      if (callback) callback();
      return;
    }
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

  set tipoAtendimento(value: string) {
    this._tipoAtendimento = value;
    if (value === 'COMANDA') {
      this.formaPagamento = 'COMANDA';
    }
  }
  get tipoAtendimento(): string {
    return this._tipoAtendimento;
  }


  /**
   * Criar pedido
   */
finalizarVenda(): void {
    if (this.finalizandoVenda) {
      console.warn('Criação de pedido bloqueada: finalizandoVenda true');
      return;
    }
    if (!this.itensCarrinho.length) {
      this.carrinhoService.message('Adicione itens ao carrinho antes de criar o pedido.', true);
      return;
    }

    // Validações obrigatórias (repita as que desejar do finalizarVenda)
    if ((this.tipoAtendimento === 'ENTREGA' || this.tipoAtendimento === 'RETIRADA' || this.tipoAtendimento === 'COMANDA') && !this.cpfCliente) {
      this.carrinhoService.message('CPF do cliente é obrigatório para entrega ou retirada.', true);
      return;
    }
    if (this.tipoAtendimento === 'RETIRADA' && !this.horarioRetirada) {
      this.carrinhoService.message('Horário de retirada é obrigatório para retirada.', true);
      return;
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
  console.log('Payload enviado para criarPedido:', JSON.stringify(payload, null, 2));

  this.pedidoService.create(payload).subscribe({
    next: (res) => {
      this.carrinhoService.message('Pedido criado com sucesso!');
      this.limparCarrinho(() => {
        this.resetForm();
        this.finalizandoVenda = false;
      });
    },
    error: (err) => {
      console.error('Erro ao criar pedido:', err);
      if (err.error) {
        console.error('Detalhes do erro do backend:', err.error);
      }
      this.carrinhoService.message('Erro ao criar pedido!', true);
      this.finalizandoVenda = false;
    }
  });
}




}
