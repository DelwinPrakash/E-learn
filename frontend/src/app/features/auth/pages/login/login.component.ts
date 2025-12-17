import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/auth/auth.service';
import { AuthService as AuthApiService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email = '';
  password = '';

  constructor(private router: Router, private authService: AuthService, private authApiService: AuthApiService) { }

  onLogin() {
    const credentials = { email: this.email, password: this.password };

    this.authApiService.login(credentials).subscribe({
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
