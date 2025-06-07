import { Component } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [MatCardModule, MatFormFieldModule, MatInputModule, FormsModule, CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
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
        this.router.navigate(['/vendas']);
      },
      error: (err) => {
        this.loading = false;
        this.error = 'CPF ou senha inválidos.';
      }
    });
  }
}
