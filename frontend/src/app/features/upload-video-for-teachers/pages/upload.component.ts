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
        <h2>⬆️ Upload Video Class</h2>
        <div class="form-group">
          <label>Title</label>
          <input type="text" [(ngModel)]="title" placeholder="Video Title" class="input-field">
        </div>
        <div class="form-group">
          <label>Subject</label>
          <input type="text" [(ngModel)]="subject" placeholder="e.g. Mathematics, AI" class="input-field">
        </div>
        <div class="form-group">
          <label>Video URL</label>
          <input type="text" [(ngModel)]="url" placeholder="YouTube or Video Link" class="input-field">
        </div>
        <div class="form-group">
          <label>Description</label>
          <textarea [(ngModel)]="description" rows="4" placeholder="Brief description of the class..." class="textarea-field"></textarea>
        </div>
        <div class="form-actions">
           <button class="btn-primary" (click)="uploadVideo()" [disabled]="isLoading">
             {{ isLoading ? 'Uploading...' : 'Upload Video' }}
           </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .upload-container {
      display: flex;
      justify-content: center;
      padding: 40px;
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
    h2 {
      color: var(--text-primary);
      text-align: center;
      margin-bottom: 10px;
      font-weight: 800;
      font-size: 2rem;
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
    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
    }
    .btn-primary:disabled {
      opacity: 0.7;
      cursor: not-allowed;
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
