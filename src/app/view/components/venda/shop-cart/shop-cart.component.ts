import { Component, OnInit, OnDestroy, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { CartClientService } from '../../../../services/cart-client.service';
import { RefreshService } from '../../../../services/refresh.service';
import { FooterService } from '../../../../services/footer.service';
import { ProdutoService } from '../../../../services/produto.service';
import { CategoriaService } from '../../../../services/categoria.service';

import { Cart, CartItem, ClientSaleData, SolicitacaoVendaRequest } from '../../../../models/cart-client.interface';
import { Produto } from '../../../../models/produto';
import { Categoria } from '../../../../models/categoria';

@Component({
  selector: 'app-shop-cart',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    ReactiveFormsModule,
    MatInputModule, 
    MatFormFieldModule, 
    MatSelectModule, 
    MatProgressSpinnerModule, 
    MatIconModule,
    MatButtonModule
  ],
  providers: [FooterService],
  templateUrl: './shop-cart.component.html',
  styleUrl: './shop-cart.component.css'
})
export class ShopCartComponent implements OnInit, AfterViewInit, OnDestroy {
  // Subject para gerenciar unsubscribe
  private destroy$ = new Subject<void>();

  // Carrinho baseado em localStorage
  cart: Cart = {
    items: [],
    quantidadeItens: 0,
    valorProdutos: 0,
    valorTotal: 0,
    dataUltimaAtualizacao: new Date()
  };

  // Formulário de checkout para cliente
  checkoutForm: FormGroup;
  
  // Estados de controle
  finalizandoVenda = false;
  buscandoCliente = false;
  clienteEncontrado = false;
  
  // Dados auxiliares
  produtos: Produto[] = [];
  categorias: Categoria[] = [];
  categoriaMap: Map<number, string> = new Map();

  // Opções limitadas para cliente (SEM COMANDA)
  tiposAtendimento = [
    { value: 'BALCAO', label: 'Balcão' },
    { value: 'MESA', label: 'Mesa' },
    { value: 'ENTREGA', label: 'Entrega' },
    { value: 'RETIRADA', label: 'Retirada' }
  ];

  formasPagamento = [
    { value: 'DINHEIRO', label: 'Dinheiro' },
    { value: 'CARTAO', label: 'Cartão' },
    { value: 'PIX', label: 'PIX' },
    { value: 'VALES', label: 'Voucher' }
  ];

  constructor(
    private cartClientService: CartClientService,
    private refreshService: RefreshService,
    private produtoService: ProdutoService,
    private categoriaService: CategoriaService,
    private footerService: FooterService,
    private fb: FormBuilder,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    // Configurar formulário reativo
    this.checkoutForm = this.fb.group({
      tipoAtendimento: ['BALCAO', [Validators.required]],
      formaPagamento: ['DINHEIRO', [Validators.required]],
      mesa: [''],
      horarioRetirada: [''],
      cpfCliente: [''],
      nomeCliente: [''],
      telefoneCliente: [''],
      enderecoCliente: [''],
      observacoes: ['']
    });

    // Validações condicionais
    this.setupConditionalValidations();
  }

  ngOnInit(): void {
    this.loadCartItems();
    this.loadProdutos();
    this.loadCategorias();
  }

  ngAfterViewInit(): void {
    // Mover subscriptions para depois da inicialização da view para evitar conflitos de hidratação
    setTimeout(() => {
      // Inscrever-se nas mudanças do carrinho
      this.cartClientService.cart$
        .pipe(takeUntil(this.destroy$))
        .subscribe(cart => {
          this.cart = cart;
          this.footerService.updateFooter();
        });

      // Inscrever-se no refresh service
      this.refreshService.refresh$
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => {
          this.loadCartItems();
        });
    }, 0);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Configurar validações condicionais baseadas no tipo de atendimento
   */
  private setupConditionalValidations(): void {
    this.checkoutForm.get('tipoAtendimento')?.valueChanges.subscribe(tipo => {
      // Limpar validações anteriores
      this.checkoutForm.get('mesa')?.clearValidators();
      this.checkoutForm.get('horarioRetirada')?.clearValidators();
      this.checkoutForm.get('cpfCliente')?.clearValidators();
      this.checkoutForm.get('nomeCliente')?.clearValidators();
      this.checkoutForm.get('telefoneCliente')?.clearValidators();
      this.checkoutForm.get('enderecoCliente')?.clearValidators();

      // Aplicar validações baseadas no tipo
      if (tipo === 'MESA') {
        this.checkoutForm.get('mesa')?.setValidators([Validators.required]);
      } else if (tipo === 'RETIRADA') {
        this.checkoutForm.get('horarioRetirada')?.setValidators([Validators.required]);
        this.checkoutForm.get('cpfCliente')?.setValidators([Validators.required]);
        this.checkoutForm.get('nomeCliente')?.setValidators([Validators.required]);
        this.checkoutForm.get('telefoneCliente')?.setValidators([Validators.required]);
      } else if (tipo === 'ENTREGA') {
        this.checkoutForm.get('cpfCliente')?.setValidators([Validators.required]);
        this.checkoutForm.get('nomeCliente')?.setValidators([Validators.required]);
        this.checkoutForm.get('telefoneCliente')?.setValidators([Validators.required]);
        this.checkoutForm.get('enderecoCliente')?.setValidators([Validators.required]);
      }

      // Atualizar validações
      this.checkoutForm.get('mesa')?.updateValueAndValidity();
      this.checkoutForm.get('horarioRetirada')?.updateValueAndValidity();
      this.checkoutForm.get('cpfCliente')?.updateValueAndValidity();
      this.checkoutForm.get('nomeCliente')?.updateValueAndValidity();
      this.checkoutForm.get('telefoneCliente')?.updateValueAndValidity();
      this.checkoutForm.get('enderecoCliente')?.updateValueAndValidity();
    });
  }

  /**
   * Carrega os itens do carrinho
   */
  private loadCartItems(): void {
    // O carrinho já é carregado automaticamente via Observable
    // Apenas sincronizar com o estado atual sem forçar detecção
    const currentCart = this.cartClientService.getCurrentCart();
    if (currentCart) {
      this.cart = currentCart;
    }
  }

  /**
   * Carrega a lista de produtos
   */
  private loadProdutos(): void {
    this.produtoService.findAll().subscribe({
      next: (produtos) => {
        this.produtos = produtos;
      },
      error: (error) => {
        console.error('Erro ao carregar produtos:', error);
      }
    });
  }

  /**
   * Carrega a lista de categorias
   */
  private loadCategorias(): void {
    this.categoriaService.findAll().subscribe({
      next: (categorias) => {
        this.categorias = categorias;
        this.categoriaMap.clear();
        categorias.forEach(categoria => {
          this.categoriaMap.set(categoria.id, categoria.descricao);
        });
      },
      error: (error) => {
        console.error('Erro ao carregar categorias:', error);
      }
    });
  }

  /**
   * Adiciona produto ao carrinho
   */
  addToCart(produto: Produto, quantidade: number = 1, observacao?: string): void {
    this.cartClientService.addItem(produto, quantidade, observacao);
  }

  /**
   * Remove item do carrinho
   */
  removeItem(itemId: string): void {
    this.cartClientService.removeItem(itemId);
  }

  /**
   * Atualiza quantidade de um item
   */
  updateItemQuantity(itemId: string, quantidade: number): void {
    this.cartClientService.updateItemQuantity(itemId, quantidade);
  }

  /**
   * Obtém nome da categoria pelo ID
   */
  getCategoriaNome(categoriaId: number): string {
    return this.categoriaMap.get(categoriaId) || '';
  }

  /**
   * Busca cliente por CPF
   */
  buscarClientePorCpf(): void {
    const cpf = this.checkoutForm.get('cpfCliente')?.value;
    
    if (!cpf || cpf.length !== 11) {
      this.cartClientService.message('CPF inválido. Digite um CPF válido com 11 dígitos.', true);
      return;
    }

    this.buscandoCliente = true;
    this.cartClientService.buscarClientePorCpf(cpf).subscribe({
      next: (cliente) => {
        // Preenche dados do cliente encontrado
        this.checkoutForm.patchValue({
          nomeCliente: cliente.nome,
          telefoneCliente: cliente.telefone,
          enderecoCliente: cliente.endereco || ''
        });
        
        this.clienteEncontrado = true;
        this.buscandoCliente = false;
        this.cartClientService.message('Cliente encontrado com sucesso!');
      },
      error: () => {
        this.cartClientService.message('Cliente não encontrado. Dados devem ser preenchidos manualmente.', true);
        this.clienteEncontrado = false;
        this.buscandoCliente = false;
      }
    });
  }

  /**
   * Verifica se precisa de dados do cliente
   */
  needsCustomerData(): boolean {
    const tipo = this.checkoutForm.get('tipoAtendimento')?.value;
    return tipo === 'ENTREGA' || tipo === 'RETIRADA';
  }

  /**
   * Limpa o carrinho
   */
  clearCart(): void {
    this.cartClientService.clearCart();
  }

  /**
   * Verifica se carrinho está vazio
   */
  isCartEmpty(): boolean {
    return this.cartClientService.isEmpty();
  }

  /**
   * Criar solicitação de venda
   */
  async criarSolicitacao(): Promise<void> {
    if (this.finalizandoVenda) return;

    // Validar formulário
    this.checkoutForm.markAllAsTouched();
    if (!this.checkoutForm.valid) {
      this.cartClientService.message('Preencha todos os campos obrigatórios.', true);
      return;
    }

    // Validar carrinho
    if (this.isCartEmpty()) {
      this.cartClientService.message('Adicione itens ao carrinho antes de enviar o pedido.', true);
      return;
    }

    try {
      this.finalizandoVenda = true;

      // Preparar dados da solicitação
      const formData = this.checkoutForm.value;
      const saleData: ClientSaleData = {
        tipoAtendimento: formData.tipoAtendimento,
        formaPagamento: formData.formaPagamento,
        mesa: formData.mesa,
        horarioRetirada: formData.horarioRetirada,
        observacoes: formData.observacoes
      };

      const request: SolicitacaoVendaRequest = this.cartClientService.prepareSolicitation(saleData);

      // Adicionar dados do cliente se necessário
      if (this.needsCustomerData()) {
        request.cpfCliente = formData.cpfCliente;
        request.nomeCliente = formData.nomeCliente;
        request.telefoneCliente = formData.telefoneCliente;
        
        if (formData.tipoAtendimento === 'ENTREGA') {
          request.enderecoCliente = formData.enderecoCliente;
        }
      }

      // Enviar solicitação
      const response = await this.cartClientService.criarSolicitacao(request).toPromise();

      // Sucesso!
      this.cartClientService.clearCart();
      this.resetForm();
      this.cartClientService.message(
        response?.mensagem || 'Pedido enviado com sucesso! Aguardando confirmação do estabelecimento.'
      );
      
      // Redirecionar para página de sucesso ou home
      this.router.navigate(['/home']);

    } catch (error) {
      console.error('Erro ao enviar pedido:', error);
      this.cartClientService.message('Erro ao enviar pedido. Tente novamente.', true);
    } finally {
      this.finalizandoVenda = false;
    }
  }

  /**
   * Reseta o formulário
   */
  private resetForm(): void {
    this.checkoutForm.reset({
      tipoAtendimento: 'BALCAO',
      formaPagamento: 'DINHEIRO',
      mesa: '',
      horarioRetirada: '',
      cpfCliente: '',
      nomeCliente: '',
      telefoneCliente: '',
      enderecoCliente: '',
      observacoes: ''
    });
    
    this.clienteEncontrado = false;
    this.buscandoCliente = false;
  }

  /**
   * Marca todos os campos como tocados para exibir erros
   */
  private markAllFieldsAsTouched(): void {
    Object.keys(this.checkoutForm.controls).forEach(key => {
      this.checkoutForm.get(key)?.markAsTouched();
    });
  }

  /**
   * Verifica se um campo é obrigatório e tem erro
   */
  hasRequiredError(fieldName: string): boolean {
    const field = this.checkoutForm.get(fieldName);
    return !!(field?.hasError('required') && field?.touched);
  }

  /**
   * Obtém mensagem de erro para um campo
   */
  getFieldError(fieldName: string): string {
    const field = this.checkoutForm.get(fieldName);
    
    if (field?.hasError('required')) {
      return `${this.getFieldLabel(fieldName)} é obrigatório`;
    }
    
    return '';
  }

  /**
   * Obtém o label de um campo
   */
  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      tipoAtendimento: 'Tipo de atendimento',
      formaPagamento: 'Forma de pagamento',
      mesa: 'Número da mesa',
      horarioRetirada: 'Horário de retirada',
      cpfCliente: 'CPF do cliente',
      nomeCliente: 'Nome do cliente',
      telefoneCliente: 'Telefone do cliente',
      enderecoCliente: 'Endereço de entrega'
    };
    
    return labels[fieldName] || fieldName;
  }
}
