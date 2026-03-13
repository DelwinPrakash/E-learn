import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment.development';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
    selector: 'app-teacher-notes-upload',
    template: `
    <div class="upload-container">
      <div class="glass-panel form-card">
        <div class="header-section">
          <h2>Upload Notes</h2>
          <p class="subtitle">Share study materials with your students</p>
        </div>

        <div class="form-group">
          <label>Title</label>
          <input type="text" [(ngModel)]="title" placeholder="e.g. Chapter 3 – Integral Calculus" class="input-field">
        </div>

        <div class="form-group">
          <label>Subject</label>
          <input type="text" [(ngModel)]="subject" placeholder="e.g. Mathematics" class="input-field">
        </div>

        <div class="form-group">
          <label>PDF URL</label>
          <input type="url" [(ngModel)]="url" placeholder="https://example.com/notes.pdf" class="input-field">
        </div>

        <div class="form-group">
          <label>Description</label>
          <textarea [(ngModel)]="description" rows="4" placeholder="What topics does this PDF cover?" class="textarea-field"></textarea>
        </div>

        <button class="btn-primary" (click)="uploadNote()" [disabled]="isLoading">
          <span *ngIf="!isLoading">📄 Publish Notes</span>
          <span *ngIf="isLoading" class="loader-text">Uploading...</span>
        </button>

        <div class="nav-link-row">
          <button class="btn-secondary" (click)="router.navigate(['/video-upload'])">🎥 Switch to Video Upload</button>
        </div>
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
      max-width: 550px;
      padding: 40px;
      border-radius: 20px;
    }

    .header-section {
      text-align: center;
      margin-bottom: 32px;
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
      gap: 8px;
      margin-bottom: 24px;
    }

    label {
      color: var(--text-primary);
      font-size: 0.95rem;
      font-weight: 600;
      margin-left: 4px;
    }

    .input-field, .textarea-field {
      width: 100%;
      padding: 14px 16px;
      border-radius: 12px;
      border: 2px solid #e2e8f0;
      background: rgba(255, 255, 255, 0.9);
      color: var(--text-primary);
      font-size: 1rem;
      font-family: inherit;
      outline: none;
      transition: all 0.3s ease;
      box-sizing: border-box;
    }

    .input-field::placeholder, .textarea-field::placeholder {
      color: #a0aec0;
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
      background: var(--primary-gradient);
      color: white;
      border: none;
      border-radius: 12px;
      font-size: 1.1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      margin-top: 8px;
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 8px;
    }

    .btn-primary:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
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

    .nav-link-row {
      margin-top: 16px;
      display: flex;
      justify-content: center;
    }

    .btn-secondary {
      padding: 10px 20px;
      background: transparent;
      color: var(--text-secondary);
      border: 2px solid #e2e8f0;
      border-radius: 10px;
      font-size: 0.95rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .btn-secondary:hover {
      border-color: #667eea;
      color: #667eea;
      background: rgba(102, 126, 234, 0.05);
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
export class TeacherNotesUploadComponent {
    title: string = '';
    subject: string = '';
    url: string = '';
    description: string = '';
    isLoading: boolean = false;

    constructor(public router: Router, private http: HttpClient, private authService: AuthService) { }

    uploadNote() {
        if (!this.title || !this.subject || !this.url) {
            alert('Please fill in all required fields');
            return;
        }

        this.isLoading = true;
        const token = this.authService.getToken();
        const headers = { 'Authorization': `Bearer ${token}` };

        this.http.post(`${environment.BACKEND_BASE_URL}/api/note/upload`, {
            title: this.title,
            subject: this.subject,
            url: this.url,
            description: this.description
        }, { headers }).subscribe({
            next: () => {
                alert('Notes uploaded successfully!');
                this.isLoading = false;
                this.title = '';
                this.subject = '';
                this.url = '';
                this.description = '';
            },
            error: (err) => {
                console.error(err);
                alert('Failed to upload notes');
                this.isLoading = false;
            }
        });
    }
}
