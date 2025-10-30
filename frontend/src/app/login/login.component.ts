import { Component } from '@angular/core';
import { LoginService } from '../services/login.service'; 
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment.development';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email = '';
  password = '';

  constructor(private loginService: LoginService, private router: Router, private http: HttpClient, private authService: AuthService) {}

  onLogin() {
    const credentials = { email: this.email, password: this.password };

    // this.loginService.login(credentials).subscribe({
    //   next: (res) => {
    //     localStorage.setItem('e_learning_token', res.token); 
    //     localStorage.setItem('e_learning_session', res.newSession.session_id); 
    //     alert('Login successful ✅');
    //     this.router.navigate(['/dashboard']);
    //   },
    //   error: (err) => {
    //     console.log(err);
    //     alert(err.error.message || 'Login failed ❌');
    //   }
    // });

    this.http.post<any>(`${environment.BACKEND_BASE_URL}/api/auth/login`, credentials).subscribe({
      next: (res) => {
        this.authService.setToken(res.token);
        alert("Login successful!");
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        console.log(err);
        alert(err.error.message || "Login failed!");
      }
    });
  }
}
