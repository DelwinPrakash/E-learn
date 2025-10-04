import { Component } from '@angular/core';
import { SignupService } from '../services/signup.service'; 

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent {
  name = '';
  email = '';
  password = '';

  constructor(private signupService: SignupService) {}

  onSignup() {
    const userData = { name: this.name, email: this.email, password: this.password };

    this.signupService.signup(userData).subscribe({
      next: (res) => {
        localStorage.setItem('token', res.token); 
        alert('Signup successful 🎉');
      },
      error: (err) => {
        alert(err.error.message || 'Signup failed ❌');
      }
    });
  }
}
