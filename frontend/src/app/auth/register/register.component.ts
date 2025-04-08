import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  name = '';
  email = '';
  password = '';
  password_confirmation = '';
  error = '';

  constructor(private auth: AuthService, private router: Router) {}

  onRegister() {
    this.auth
      .register({
        name: this.name,
        email: this.email,
        password: this.password,
        password_confirmation: this.password_confirmation,
      })
      .subscribe({
        next: (res:any) => {
          localStorage.setItem('auth_token', res.data.token);
          this.router.navigate(['/dashboard']);
        },
        error: () => {
          this.error = 'Registration failed';
        },
      });
  }
}
