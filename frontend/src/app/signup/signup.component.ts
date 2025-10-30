import { Component } from '@angular/core';
import { SignupService } from '../services/signup.service'; 
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
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

  constructor(private signupService: SignupService, private http: HttpClient, private router: Router) {}

  onSignup() {
    const credentials = { name: this.name, email: this.email, password: this.password };

    // this.signupService.signup(userData).subscribe({
    //   next: (res) => {
    //     alert('Signup successful, verify your email 🎉');
    //   },
    //   error: (err) => {
    //     alert(err.error.message || 'Signup failed ❌');
    //   }
    // });

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
