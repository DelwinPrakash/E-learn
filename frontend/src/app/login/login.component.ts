import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email = '';
  password = '';

  constructor(private http: HttpClient) {}

  onLogin() {
    const credentials = { email: this.email, password: this.password };

    this.http.post('http://localhost:3000/api/login', credentials).subscribe({
      next: (response: any) => {
        alert('Login successful ✅');
        console.log('Server Response:', response);
      },
      error: (err) => {
        alert('Invalid email or password ❌');
        console.error(err);
      }
    });
  }
}
