import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent {
  name = '';
  email = '';
  password = '';

  constructor(private authService: AuthService) { }

  onSignup() {
    const credentials = { name: this.name, email: this.email, password: this.password };

    this.authService.signup(credentials).subscribe({
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
