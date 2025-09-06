import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
    Cart,
    CartItem,
    ClientSaleData,
    SolicitacaoVendaRequest,
    SolicitacaoVendaResponse,
    ItemCarrinho,
    DadosVendaCliente
} from '../models/cart-client.interface';
import { Produto } from '../models/produto';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class CartClientService {
    private readonly CART_KEY = environment.cartKey;
    private readonly API_URL = environment.apiUrl;

    // Subject para monitorar mudanças no carrinho em tempo real
    private cartSubject = new BehaviorSubject<Cart>(this.getEmptyCart());
    public cart$ = this.cartSubject.asObservable();

    constructor(
        private http: HttpClient,
        private snack: MatSnackBar
    ) {
        // Carrega carrinho do localStorage ao inicializar o serviço
        this.loadCartFromStorage();
    }

    // ========== MÉTODOS PRIVADOS DE GERENCIAMENTO INTERNO ==========

    /**
     * Estrutura de carrinho vazio padrão
     * Usado para inicialização e reset do carrinho
     */
    private getEmptyCart(): Cart {
        return {
            items: [],
            quantidadeItens: 0,
            valorProdutos: 0,
            valorTotal: 0,
            dataUltimaAtualizacao: new Date()
        };
    }

    /**
     * Carrega carrinho do localStorage
     * Tenta recuperar dados do carrinho armazenados localmente
     * Em caso de erro, limpa o carrinho para evitar estados inconsistentes
     */
    private loadCartFromStorage(): void {
        try {
            const stored = localStorage.getItem(this.CART_KEY);
            if (stored) {
                const cart = JSON.parse(stored) as Cart;
                // Notifica apenas se o carrinho realmente mudou para evitar atualizações desnecessárias
                const currentCart = this.cartSubject.getValue();
                if (JSON.stringify(currentCart) !== JSON.stringify(cart)) {
                    this.cartSubject.next(cart);
                }
            }
        } catch (error) {
            console.error('Erro ao carregar carrinho do localStorage:', error);
            this.clearCart();
        }
    }

    /**
     * Salva carrinho no localStorage
     * Atualiza timestamp e persiste dados do carrinho
     * Usa setTimeout para evitar conflitos de hidratação no SSR
     */
    private saveCartToStorage(cart: Cart): void {
        try {
            cart.dataUltimaAtualizacao = new Date();
            localStorage.setItem(this.CART_KEY, JSON.stringify(cart));
            // Usar setTimeout para evitar conflitos de hydratação
            setTimeout(() => {
                this.cartSubject.next(cart);
            }, 0);
        } catch (error) {
            console.error('Erro ao salvar carrinho no localStorage:', error);
            this.message('Erro ao salvar carrinho', true);
        }
    }

    /**
     * Atualiza totais do carrinho
     * Recalcula valores unitários, quantidade total e valor total do carrinho
     * Garante consistência dos dados financeiros
     */
    private updateCartTotals(cart: Cart): void {
        // Garante que todos os itens têm valorTotal correto baseado na quantidade × valor unitário
        cart.items.forEach((item: CartItem) => {
            item.valorTotal = item.quantidade * item.valorUnitario;
        });

        // Calcula totais consolidados do carrinho
        cart.quantidadeItens = cart.items.reduce((sum, item) => sum + item.quantidade, 0);
        cart.valorProdutos = cart.items.reduce((sum, item) => sum + item.valorTotal, 0);
        cart.valorTotal = cart.valorProdutos; // Cliente não pode aplicar acréscimos/descontos
        cart.dataUltimaAtualizacao = new Date();
    }

    // ========== MÉTODOS PÚBLICOS DE MANIPULAÇÃO DO CARRINHO ==========

    /**
     * Adiciona produto ao carrinho
     * Se o produto já existe (mesmo ID + observação), incrementa quantidade
     * Se é novo produto, cria novo item no carrinho
     */
    addItem(produto: Produto, quantidade: number = 1, observacao?: string): void {
        try {
            const cart = this.getCurrentCart();
            // ID único baseado no produto + observação (permite mesmo produto com observações diferentes)
            const itemId = `${produto.id}_${observacao || ''}`;

            const existingItemIndex = cart.items.findIndex(item => item.id === itemId);

            if (existingItemIndex >= 0) {
                // Atualizar item existente - incrementa quantidade
                cart.items[existingItemIndex].quantidade += quantidade;
                cart.items[existingItemIndex].valorTotal =
                    cart.items[existingItemIndex].quantidade * cart.items[existingItemIndex].valorUnitario;
            } else {
                // Adicionar novo item ao carrinho
                const newItem: CartItem = {
                    id: itemId,
                    produtoId: produto.id,
                    categoriaId: produto.categoria.id,
                    nomeProduto: produto.descricao,
                    quantidade: quantidade,
                    valorUnitario: parseFloat(produto.valor),
                    valorTotal: quantidade * parseFloat(produto.valor),
                    observacao: observacao || ''
                };
                cart.items.push(newItem);
            }

            this.updateCartTotals(cart);
            this.saveCartToStorage(cart);
            this.message('Item adicionado ao carrinho');
        } catch (error) {
            console.error('Erro ao adicionar item ao carrinho:', error);
            this.message('Erro ao adicionar item ao carrinho', true);
        }
    }

    /**
     * Remove item do carrinho
     * Remove completamente o item baseado no ID único
     */
    removeItem(itemId: string): void {
        try {
            const cart = this.getCurrentCart();
            cart.items = cart.items.filter(item => item.id !== itemId);

            this.updateCartTotals(cart);
            this.saveCartToStorage(cart);
            this.message('Item removido do carrinho');

        } catch (error) {
            console.error('Erro ao remover item:', error);
            this.message('Erro ao remover item', true);
        }
    }

    /**
     * Atualiza quantidade de um item
     * Se nova quantidade <= 0, remove o item completamente
     * Caso contrário, atualiza quantidade e recalcula valores
     */
    updateItemQuantity(itemId: string, newQuantity: number): void {
        try {
            if (newQuantity <= 0) {
                this.removeItem(itemId);
                return;
            }

            const cart = this.getCurrentCart();
            const item = cart.items.find((cartItem: CartItem) => cartItem.id === itemId);

            if (item) {
                item.quantidade = newQuantity;
                item.valorTotal = item.quantidade * item.valorUnitario;
                this.updateCartTotals(cart);
                this.saveCartToStorage(cart);
                this.message('Quantidade atualizada');
            } else {
                // Log de advertência para debug (mantido para troubleshooting)
                console.warn('Item não encontrado no carrinho:', itemId);
                this.message('Item não encontrado no carrinho', true);
            }
        } catch (error) {
            console.error('Erro ao atualizar quantidade:', error);
            this.message('Erro ao atualizar quantidade', true);
        }
    }

    /**
     * Limpa todo o carrinho
     * Remove todos os itens e reseta para estado inicial vazio
     */
    clearCart(): void {
        try {
            localStorage.removeItem(this.CART_KEY);
            this.cartSubject.next(this.getEmptyCart());
            this.message('Carrinho limpo');
        } catch (error) {
            console.error('Erro ao limpar carrinho:', error);
        }
    }

    // ========== MÉTODOS PÚBLICOS DE CONSULTA ==========

    /**
     * Obtém carrinho atual
     */
    getCurrentCart(): Cart {
        return { ...this.cartSubject.getValue() };
    }

    /**
     * Verifica se carrinho está vazio
     */
    isEmpty(): boolean {
        return this.getCurrentCart().items.length === 0;
    }

    // ========== MÉTODOS DE INTEGRAÇÃO COM BACKEND ==========

    /**
     * Prepara dados para solicitação de venda (formato esperado pelo backend)
     * Converte estrutura do carrinho para o formato de request da API
     * Inclui validações e tratamento de dados obrigatórios
     */
    prepareSolicitation(clientData: ClientSaleData): SolicitacaoVendaRequest {
        const cart = this.getCurrentCart();

        if (cart.items.length === 0) {
            throw new Error('Carrinho está vazio');
        }

        // Garantir que todos os itens têm valorTotal correto antes do envio
        cart.items.forEach(item => {
            if (!item.valorTotal || item.valorTotal <= 0) {
                item.valorTotal = item.quantidade * item.valorUnitario;
            }
        });

        // Converter CartItem para ItemCarrinho (formato do backend)
        const itens: ItemCarrinho[] = cart.items.map((item: CartItem) => ({
            produtoId: item.produtoId,
            categoriaId: item.categoriaId,
            quantidade: item.quantidade,
            valorUnitario: item.valorUnitario,
            valorTotal: item.valorTotal,
            observacao: item.observacao || undefined
        }));

        // Dados da venda no formato esperado pelo backend
        const dadosVenda: DadosVendaCliente = {
            tipoAtendimento: clientData.tipoAtendimento,
            formaPagamento: clientData.formaPagamento,
            valorTotal: cart.valorTotal,
            valorProdutos: cart.valorProdutos,
            mesa: clientData.mesa,
            observacoes: clientData.observacoes
        };

        // Incluir horário de retirada se fornecido
        if (clientData.horarioRetirada) {
            dadosVenda.horarioRetirada = clientData.horarioRetirada;
        }

        // Estrutura final do pedido no formato correto
        const solicitacaoRequest: SolicitacaoVendaRequest = {
            itens,
            dadosVenda,
            observacoes: clientData.observacoes
        };

        return solicitacaoRequest;
    }

    /**
     * Cria solicitação de venda (pedido do cliente)
     * Endpoint: POST /vendas/solicitar
     * Destino Backend: Tabela PEDIDOS (não VENDAS)
     * Status Inicial: PENDENTE
     * Aparece em: Tela "Pedidos Pendentes" do admin
     */
    criarSolicitacao(request: SolicitacaoVendaRequest): Observable<SolicitacaoVendaResponse> {
        const url = `${this.API_URL}/vendas/solicitar`;
        
        // Validação: verificar se todos os itens têm valorTotal válido
        const itensComProblema = request.itens.filter(item => !item.valorTotal || item.valorTotal <= 0);
        if (itensComProblema.length > 0) {
            console.error('Itens sem valorTotal:', itensComProblema);
            this.message('Erro: Itens com valor inválido detectados', true);
            return throwError('Itens com valor inválido');
        }

        return this.http.post<SolicitacaoVendaResponse>(url, request).pipe(
            catchError(error => {
                console.error('Erro ao enviar pedido:', error);

                // Tratamento específico de erros
                if (error.status === 403) {
                    this.message('Acesso negado. Verifique sua autenticação.', true);
                } else if (error.status === 400) {
                    this.message('Dados do pedido inválidos. Verifique as informações.', true);
                } else if (error.status === 500) {
                    this.message('Erro interno do servidor. Tente novamente em alguns minutos.', true);
                } else {
                    this.message('Erro ao enviar pedido. Verifique sua conexão e tente novamente.', true);
                }

                return throwError(error);
            })
        );
    }

    /**
     * Busca cliente por CPF
     * Endpoint utilizado para validação de CPF durante o checkout
     */
    buscarClientePorCpf(cpf: string): Observable<any> {
        const url = `${this.API_URL}/clientes/cpf/${cpf}`;
        return this.http.get<any>(url);
    }

    // ========== OBSERVABLES PARA COMPONENTES ==========

    /**
     * Observable da quantidade total de itens no carrinho
     * Usado para atualizar badges/contadores em tempo real
     */
    get itemCount$(): Observable<number> {
        return this.cart$.pipe(
            map(cart => cart.quantidadeItens)
        );
    }

    /**
     * Observable do valor total do carrinho
     * Usado para exibir totais em tempo real
     */
    get totalValue$(): Observable<number> {
        return this.cart$.pipe(
            map(cart => cart.valorTotal)
        );
    }

    // ========== MÉTODOS UTILITÁRIOS ==========

    /**
     * Exibe mensagem para o usuário
     */
    message(msg: string, isError: boolean = false): void {
        this.snack.open(msg, 'OK', {
            horizontalPosition: 'center',
            verticalPosition: 'bottom',
            duration: 4000,
            panelClass: isError ? ['error-snackbar'] : ['success-snackbar']
        });
    }
}
