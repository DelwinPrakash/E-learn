import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-emailverification',
  templateUrl: './emailverification.component.html',
  styleUrls: ['./emailverification.component.css']
})
export class EmailverificationComponent implements OnInit {
  // Add the missing properties
  isVerifying: boolean = true;
  isSuccess: boolean = false;
  errorMessage: string = '';
  email: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    // Initialize component logic here
    // For example, you might get the email from route parameters or service
    this.verifyEmail();
  }

  verifyEmail() {
    // Add your email verification logic here
    // This is where you would call your verification service
    // For example:
    this.isVerifying = true;
    
    // Simulate verification process
    setTimeout(() => {
      // Replace this with actual verification logic
      const token = this.route.snapshot.queryParamMap.get('token');
      
      if (token) {
        // Call your verification service
        // this.authService.verifyEmail(token).subscribe(...)
        this.isVerifying = false;
        this.isSuccess = true;
      } else {
        this.isVerifying = false;
        this.errorMessage = 'Invalid verification token';
      }
    }, 2000);
  }

  // Add the missing method
  onBackToLogin() {
    this.router.navigate(['/login']);
  }
}