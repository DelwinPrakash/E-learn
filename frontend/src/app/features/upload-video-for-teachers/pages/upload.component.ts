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
      border-radius: 24px;
      display: flex;
      flex-direction: column;
      gap: 25px;
    }

    .header-section {
      text-align: center;
      margin-bottom: 10px;
    }

    .header-section h2 {
      font-size: 2.2rem;
      font-weight: 800;
      margin-bottom: 8px;
      color: var(--text-primary);
      letter-spacing: -0.5px;
      line-height: 1.2;
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
      width: 100%;
      padding: 14px 18px;
      border-radius: 12px;
      border: 1px solid var(--glass-border);
      background: var(--input-bg);
      color: var(--input-text-color);
      outline: none;
      font-family: inherit;
      font-size: 0.95rem;
      transition: border-color 0.3s ease, box-shadow 0.3s ease;
      box-sizing: border-box;
    }

    .input-field::placeholder, .textarea-field::placeholder {
      color: var(--input-placeholder);
    }

    .input-field:focus, .textarea-field:focus {
      border-color: var(--accent-primary);
      background: var(--input-bg);
      box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.15);
    }

    .input-field:hover:not(:focus), .textarea-field:hover:not(:focus) {
      border-color: var(--glass-border-strong);
    }

    .textarea-field { resize: none; min-height: 120px; }

    .file-drop-zone {
      border: 2px dashed var(--glass-border);
      border-radius: 12px;
      padding: 28px 20px;
      text-align: center;
      cursor: pointer;
      transition: border-color 0.3s ease, background 0.3s ease;
      background: var(--nav-bg);
    }

    .file-drop-zone:hover {
      border-color: var(--accent-primary);
      background: rgba(99, 102, 241, 0.05);
    }

    .drop-prompt, .file-preview {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
    }

    .drop-icon { font-size: 2rem; line-height: 1; }
    .drop-text { font-weight: 600; color: var(--text-primary); font-size: 0.95rem; }
    .drop-hint { font-size: 0.8rem; color: var(--text-muted); }
    .file-icon { font-size: 1.8rem; line-height: 1; }

    .file-name { font-weight: 600; color: var(--accent-primary); font-size: 0.95rem; word-break: break-all; }
    .file-size { font-size: 0.8rem; color: var(--text-secondary); }

    .progress-bar-wrap {
      background: var(--glass-border);
      border-radius: 8px;
      height: 10px;
      margin-bottom: 20px;
    }

    .progress-bar {
      height: 100%;
      background: var(--accent-primary);
      border-radius: 8px;
      transition: width 0.3s ease;
    }

    .progress-label {
      display: block;
      text-align: right;
      font-size: 0.75rem;
      color: var(--text-muted);
      margin-top: 4px;
    }

    .btn-primary {
      width: 100%;
      padding: 16px;
      background: var(--accent-primary);
      color: #ffffff;
      border: none;
      border-radius: 12px;
      font-weight: 700;
      font-size: 1.1rem;
      cursor: pointer;
      transition: opacity 0.25s ease, transform 0.25s ease, box-shadow 0.25s ease;
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 8px;
    }

    .btn-primary:hover:not(:disabled) {
      opacity: 0.9;
      transform: translateY(-2px);
      box-shadow: 0 10px 24px rgba(99, 102, 241, 0.4);
    }

    .btn-primary:active:not(:disabled) {
      transform: translateY(0);
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.25);
    }

    .btn-primary:disabled {
      opacity: 0.45;
      cursor: not-allowed;
      transform: none;
      box-shadow: none;
    }

    .nav-link-row {
      display: flex;
      justify-content: center;
    }

    .btn-secondary {
      padding: 10px 20px;
      background: transparent;
      color: var(--text-secondary);
      border: 1px solid var(--glass-border);
      border-radius: 10px;
      font-size: 0.95rem;
      font-weight: 600;
      cursor: pointer;
      transition: border-color 0.2s ease, color 0.2s ease, background 0.2s ease;
    }

    .btn-secondary:hover {
      border-color: var(--accent-primary);
      color: var(--accent-primary);
      background: rgba(99, 102, 241, 0.05);
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
      border: 2px solid rgba(255, 255, 255, 0.35);
      border-top-color: #ffffff;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      flex-shrink: 0;
    }

    @keyframes spin { to { transform: rotate(360deg); } }

    @media (max-width: 600px) {
      .upload-container { padding: 32px 16px; }
      .form-card { padding: 24px 20px; }
      .header-section h2 { font-size: 1.7rem; }
    }
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

