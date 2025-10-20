import { Component } from '@angular/core';
import { LoginService } from '../services/login.service'; 
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email = '';
  password = '';

  constructor(private loginService: LoginService, private router: Router) {}

  onLogin() {
    const credentials = { email: this.email, password: this.password };

    this.loginService.login(credentials).subscribe({
      next: (res) => {
        localStorage.setItem('e_learning_token', res.token); 
        localStorage.setItem('e_learning_session', res.newSession.session_id); 
        alert('Login successful ✅');
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        console.log(err);
        alert(err.error.message || 'Login failed ❌');
      }
    });
  }
}
