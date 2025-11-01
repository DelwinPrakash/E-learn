import { Component } from '@angular/core';
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

  constructor(private router: Router, private http: HttpClient, private authService: AuthService) {}

  onLogin() {
    const credentials = { email: this.email, password: this.password };

    this.http.post<any>(`${environment.BACKEND_BASE_URL}/api/auth/login`, credentials).subscribe({
      next: (res) => {
        this.authService.setToken(res.token);
        this.authService.setUserDetails(res.user);
        console.log(res.user);
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
