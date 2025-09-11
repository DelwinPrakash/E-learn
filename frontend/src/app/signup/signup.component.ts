import { Component } from '@angular/core';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent {
  name = '';
  email = '';
  password = '';

  onSignup() {
    const userData = {
      name: this.name,
      email: this.email,
      password: this.password
    };

    console.log('Signup Data:', userData);
    alert('Signup form submitted ✅ (not yet connected to backend)');
  }
}
