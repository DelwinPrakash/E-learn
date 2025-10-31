import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment.development';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent {
  name = '';
  email = '';
  password = '';

  constructor(private http: HttpClient) {}

  onSignup() {
    const credentials = { name: this.name, email: this.email, password: this.password };

    this.http.post<any>(`${environment.BACKEND_BASE_URL}/api/auth/signup`, credentials).subscribe({
      next: (res) => {
        alert('Signup successful, verify your email 🎉');
      },
      error: (err) => {
        console.log(err);
        alert(err.error.message || 'Signup failed ❌');
      }
    });
  }
}
