import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment.development';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-teacher-upload',
  template: `
    <div class="upload-container">
      <div class="glass-panel form-card">
        <div class="header-section">
          <h2>Upload Video Class</h2>
          <p class="subtitle">Share your knowledge with your students</p>
        </div>
        
        <div class="form-group">
          <label>Title</label>
          <input type="text" [(ngModel)]="title" placeholder="e.g. Introduction to Advanced Calculus" class="input-field">
        </div>
        
        <div class="form-group">
          <label>Subject</label>
          <input type="text" [(ngModel)]="subject" placeholder="e.g. Mathematics" class="input-field">
        </div>
        
        <div class="form-group">
          <label>Video URL</label>
          <input type="url" [(ngModel)]="url" placeholder="https://youtube.com/..." class="input-field">
        </div>
        
        <div class="form-group">
          <label>Description</label>
          <textarea [(ngModel)]="description" rows="4" placeholder="What will students learn in this class?" class="textarea-field"></textarea>
        </div>
        
        <button class="btn-primary" (click)="uploadVideo()" [disabled]="isLoading">
           <span *ngIf="!isLoading">Publish Class</span>
           <span *ngIf="isLoading" class="loader-text">Uploading...</span>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .upload-container {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 60px 20px;
      min-height: calc(100vh - 80px);
      animation: fadeIn 0.5s ease-out;
    }
    
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .form-card {
      width: 100%;
      max-width: 600px;
      padding: 40px;
      background: var(--glass-bg);
      backdrop-filter: blur(20px);
      border: 1px solid var(--glass-border);
      border-radius: 24px;
      box-shadow: var(--glass-shadow);
      display: flex;
      flex-direction: column;
      gap: 25px;
    }
    
    .header-section {
      text-align: center;
      margin-bottom: 10px;
      font-weight: 800;
      font-size: 2rem;
    }
    
    h2 {
      font-size: 2.2rem;
      font-weight: 800;
      margin-bottom: 8px;
      background: var(--primary-gradient);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      letter-spacing: -0.5px;
    }
    
    .subtitle {
      color: var(--text-secondary);
      font-size: 1rem;
      font-weight: 500;
    }
    
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    
    label {
      color: var(--text-secondary);
      font-size: 0.95rem;
      font-weight: 600;
    }
    
    .input-field, .textarea-field {
      padding: 14px 18px;
      border-radius: 12px;
      border: 1px solid var(--glass-border);
      background: var(--input-bg);
      color: var(--input-text-color);
      outline: none;
      transition: all 0.3s ease;
      font-family: inherit;
    }
    .input-field:focus, .textarea-field:focus {
      border-color: var(--accent-primary);
    }
    
    .input-field:focus, .textarea-field:focus {
      border-color: #667eea;
      background: #ffffff;
      box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.15);
    }
    
    .input-field:hover:not(:focus), .textarea-field:hover:not(:focus) {
      border-color: #cbd5e0;
    }
    
    .textarea-field {
      resize: vertical;
      min-height: 120px;
    }
    
    .btn-primary {
      width: 100%;
      padding: 16px;
      background: var(--accent-primary);
      color: white;
      border: none;
      border-radius: 12px;
      font-weight: 700;
      font-size: 1.1rem;
      cursor: pointer;
      transition: all 0.3s ease;
    }
    
    .btn-primary:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
    }
    
    .btn-primary:active:not(:disabled) {
      transform: translateY(0);
      box-shadow: 0 2px 10px rgba(102, 126, 234, 0.3);
    }
    
    .btn-primary:disabled {
      opacity: 0.7;
      cursor: not-allowed;
      transform: none;
    }
    
    .loader-text {
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }
    
    .loader-text::after {
      content: "";
      width: 16px;
      height: 16px;
      border: 2px solid #ffffff;
      border-top-color: transparent;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `]
})
export class TeacherUploadComponent {
  title: string = '';
  subject: string = '';
  url: string = '';
  description: string = '';
  isLoading: boolean = false;

  constructor(private http: HttpClient, private router: Router, private authService: AuthService) { }

  uploadVideo() {
    if (!this.title || !this.subject || !this.url) {
      alert('Please fill in all required fields');
      return;
    }

    this.isLoading = true;
    const token = this.authService.getToken();
    const headers = { 'Authorization': `Bearer ${token}` };

    this.http.post(`${environment.BACKEND_BASE_URL}/api/video/upload`, {
      title: this.title,
      subject: this.subject,
      url: this.url,
      description: this.description
    }, { headers }).subscribe({
      next: () => {
        alert('Video uploaded successfully!');
        this.isLoading = false;
        // Reset form
        this.title = '';
        this.subject = '';
        this.url = '';
        this.description = '';
      },
      error: (err) => {
        console.error(err);
        alert('Failed to upload video');
        this.isLoading = false;
      }
    });
  }
}
