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

  login(): void {
    this.loading = true;
    this.error = '';
    this.authService.login(this.cpf, this.senha).subscribe({
      next: (res) => {
        this.loading = false;
        this.router.navigate(['/home']); // Redireciona para a tela de boas-vindas
      },
      error: (err) => {
        this.loading = false;
        this.error = 'CPF ou senha inválidos.';
      }
    });
  }
}
