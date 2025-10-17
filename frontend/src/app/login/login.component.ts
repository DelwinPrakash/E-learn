import { Component } from '@angular/core';
import { LoginService } from '../services/login.service'; 

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email = '';
  password = '';

  constructor(private loginService: LoginService) {}

  onLogin() {
    const credentials = { email: this.email, password: this.password };

    this.loginService.login(credentials).subscribe({
      next: (res) => {
        localStorage.setItem('token', res.token); 
        alert('Login successful ✅');
      },
      error: (err) => {
        console.log(err);
        alert(err.error.message || 'Login failed ❌');
      }
    });
  }
}
