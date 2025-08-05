import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [MatCardModule, MatFormFieldModule, MatInputModule, FormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  cpf: string = '';
  senha: string = '';
  loading: boolean = false;
  error: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  /**
   * Realiza login do cliente
   * Limpa tokens antigos, valida credenciais e redireciona para home
   * Exibe mensagem de erro em caso de falha na autenticação
   */
  login(): void {
    // Limpa tokens antigos para evitar conflitos
    this.authService.logout();
    
    this.loading = true;
    this.error = '';
    
    this.authService.login(this.cpf, this.senha).subscribe({
      next: (res) => {
        this.loading = false;
        // Redireciona para a tela principal após login bem-sucedido
        this.router.navigate(['/home']);
      },
      error: (err) => {
        this.loading = false;
        this.error = 'CPF ou senha inválidos.';
      }
    });
  }
}
