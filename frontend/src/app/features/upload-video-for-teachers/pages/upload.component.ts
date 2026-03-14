import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { VideoUploadService } from '../services/video-upload.service';

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
          <label>Video File</label>
          <div class="file-drop-zone" (click)="videoFileInput.click()" (dragover)="$event.preventDefault()" (drop)="onDrop($event)">
            <input #videoFileInput type="file" accept="video/mp4,video/webm,video/ogg,video/quicktime" (change)="onFileSelected($event)" style="display:none">
            <div *ngIf="!selectedFile" class="drop-prompt">
              <span class="drop-icon">🎬</span>
              <span class="drop-text">Click or drag & drop a video file</span>
              <span class="drop-hint">MP4, WebM, OGG, MOV — up to 500 MB</span>
            </div>
            <div *ngIf="selectedFile" class="file-preview">
              <span class="file-icon">✅</span>
              <span class="file-name">{{ selectedFile.name }}</span>
              <span class="file-size">{{ formatSize(selectedFile.size) }}</span>
            </div>
          </div>
        </div>

        <div class="form-group">
          <label>Description</label>
          <textarea [(ngModel)]="description" rows="4" placeholder="What will students learn in this class?" class="textarea-field"></textarea>
        </div>

        <div *ngIf="uploadProgress > 0 && uploadProgress < 100" class="progress-bar-wrap">
          <div class="progress-bar" [style.width.%]="uploadProgress"></div>
          <span class="progress-label">{{ uploadProgress }}%</span>
        </div>

        <button class="btn-primary" (click)="uploadVideo()" [disabled]="isLoading">
           <span *ngIf="!isLoading">🎥 Publish Class</span>
           <span *ngIf="isLoading" class="loader-text">Uploading...</span>
        </button>

        <div class="nav-link-row">
          <button class="btn-secondary" (click)="router.navigate(['/notes-upload'])">📄 Switch to Notes Upload</button>
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
    .input-field:hover:not(:focus), .textarea-field:hover:not(:focus) { border-color: #cbd5e0; }
    .textarea-field { resize: vertical; min-height: 120px; }

    /* File drop zone */
    .file-drop-zone {
      border: 2px dashed #cbd5e0;
      border-radius: 12px;
      padding: 28px 20px;
      text-align: center;
      cursor: pointer;
      transition: all 0.3s ease;
      background: rgba(255,255,255,0.6);
    }
    .file-drop-zone:hover {
      border-color: #667eea;
      background: rgba(102, 126, 234, 0.05);
    }
    .drop-prompt, .file-preview {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
    }
    .drop-icon { font-size: 2rem; }
    .drop-text { font-weight: 600; color: var(--text-primary); font-size: 0.95rem; }
    .drop-hint { font-size: 0.8rem; color: var(--text-secondary); }
    .file-icon { font-size: 1.8rem; }
    .file-name { font-weight: 600; color: #667eea; font-size: 0.95rem; word-break: break-all; }
    .file-size { font-size: 0.8rem; color: var(--text-secondary); }

    /* Progress bar */
    .progress-bar-wrap {
      position: relative;
      background: #e2e8f0;
      border-radius: 8px;
      height: 10px;
      margin-bottom: 16px;
      overflow: hidden;
    }
    .progress-bar {
      height: 100%;
      background: var(--primary-gradient);
      border-radius: 8px;
      transition: width 0.3s ease;
    }
    .progress-label {
      position: absolute;
      right: 6px;
      top: -18px;
      font-size: 0.75rem;
      color: var(--text-secondary);
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
    .btn-secondary:hover { border-color: #667eea; color: #667eea; background: rgba(102, 126, 234, 0.05); }

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
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class TeacherUploadComponent {
  title: string = '';
  subject: string = '';
  description: string = '';
  selectedFile: File | null = null;
  isLoading: boolean = false;
  uploadProgress: number = 0;

  constructor(private videoUploadService: VideoUploadService, public router: Router) { }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('video/')) {
        this.selectedFile = file;
      } else {
        alert('Please drop a valid video file.');
      }
    }
  }

  formatSize(bytes: number): string {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  uploadVideo() {
    if (!this.title || !this.subject) {
      alert('Please fill in Title and Subject');
      return;
    }
    if (!this.selectedFile) {
      alert('Please select a video file to upload');
      return;
    }

    this.isLoading = true;
    this.uploadProgress = 0;

    const formData = new FormData();
    formData.append('title', this.title);
    formData.append('subject', this.subject);
    formData.append('description', this.description);
    formData.append('video', this.selectedFile);

    this.videoUploadService.uploadVideo(
      formData,
      (percent) => { this.uploadProgress = percent; },
      (_response) => {
        this.isLoading = false;
        this.uploadProgress = 0;
        alert('Video uploaded successfully!');
        this.title = '';
        this.subject = '';
        this.description = '';
        this.selectedFile = null;
      },
      (_status, message) => {
        this.isLoading = false;
        this.uploadProgress = 0;
        alert(`Failed to upload video: ${message}`);
      }
    );
  }
}

