import { Component } from '@angular/core';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email = '';
  password = '';

  onLogin() {
    if (this.email === 'Student@example.com' && this.password === '1234') {
      alert('Login successful ✅');
    } else {
      alert('Invalid email or password ❌');
    }
  }
}
