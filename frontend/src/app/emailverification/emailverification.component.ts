import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LoginService } from '../services/login.service';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment.development';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-emailverification',
  templateUrl: './emailverification.component.html',
  styleUrls: ['./emailverification.component.css'],
  imports: [CommonModule],
  standalone: true
})
export class EmailverificationComponent implements OnInit {
  isVerifying: boolean = true;
  isSuccess: boolean = false;
  errorMessage: string = '';
  email: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private loginService: LoginService,
    private http: HttpClient,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.verifyEmail();
  }

  verifyEmail() {
    setTimeout(() => {
      let token = this.route.snapshot.queryParamMap.get('token');

      if (token) {
        // this.loginService.verifyEmailToken({ token }).subscribe({
        //   next: (res) => {
        //     console.log(res);
        //     localStorage.setItem('e_learning_token', res.token);
        //     this.isVerifying = false;
        //     this.isSuccess = true;
        //     this.router.navigate(['/dashboard']);
        //   },
        //   error: (err) => {
        //     this.errorMessage = err.error.message || 'Verification failed ❌';
        //     alert(err.error.message || 'Login failed ❌');
        //     if(err.error.verified){
        //       this.isVerifying = false;
        //       this.isSuccess = true;
        //       this.router.navigate(['/dashboard']);
        //       return;
        //     }   
        //   }
        // });

        this.http.get<any>(`${environment.BACKEND_BASE_URL}/api/user/verify-email?token=${token}`).subscribe({
          next: (res) => {
            this.authService.setToken(res.token);
            this.isSuccess = true;
            this.isVerifying = false;
            this.router.navigate(['/dashboard']);
          },
          error: (err) => {
            this.errorMessage = err.error.message || 'Verification failed ❌';
            alert(err.error.message || 'Login failed ❌');
            if(err.error.verified){
              this.isSuccess = true;
              this.isVerifying = false;
              this.router.navigate(['/dashboard']);
              return;
            }   
          }
        })

      }
    }, 2000);
  }

  // Add the missing method
  onBackToLogin() {
    this.router.navigate(['/login']);
  }
}