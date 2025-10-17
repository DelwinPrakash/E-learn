import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LoginService } from '../services/login.service';

@Component({
  selector: 'app-emailverification',
  templateUrl: './emailverification.component.html',
  styleUrls: ['./emailverification.component.css']
})
export class EmailverificationComponent implements OnInit {
  isVerifying: boolean = true;
  isSuccess: boolean = false;
  errorMessage: string = '';
  email: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private loginService: LoginService
  ) {}

  ngOnInit() {
    this.verifyEmail();
  }

  verifyEmail() {
    setTimeout(() => {
      let token = this.route.snapshot.queryParamMap.get('token');

      if (token) {
        this.loginService.verifyEmailToken({ token }).subscribe({
          next: (res) => {
            console.log(res);
            localStorage.setItem('e_learning_token', res.token);
            this.isVerifying = false;
            this.isSuccess = true;
            this.router.navigate(['/dashboard']);
          },
          error: (err) => {
            this.errorMessage = err.error.message || 'Verification failed ❌';
            alert(err.error.message || 'Login failed ❌');
            if(err.error.verified){
              this.isVerifying = false;
              this.isSuccess = true;
              this.router.navigate(['/dashboard']);
              return;
            }   
          }
        });
      }
    }, 2000);
  }

  // Add the missing method
  onBackToLogin() {
    this.router.navigate(['/login']);
  }
}