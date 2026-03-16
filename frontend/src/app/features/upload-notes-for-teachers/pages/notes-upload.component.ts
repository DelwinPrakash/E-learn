import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NoteUploadService } from '../services/note-upload.service';

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
          <label>PDF File</label>
          <div class="file-drop-zone" (click)="pdfFileInput.click()" (dragover)="$event.preventDefault()" (drop)="onDrop($event)">
            <input #pdfFileInput type="file" accept="application/pdf" (change)="onFileSelected($event)" style="display:none">
            <div *ngIf="!selectedFile" class="drop-prompt">
              <span class="drop-icon">📄</span>
              <span class="drop-text">Click or drag & drop a PDF file</span>
              <span class="drop-hint">PDF only — up to 50 MB</span>
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
          <textarea [(ngModel)]="description" rows="4" placeholder="What topics does this PDF cover?" class="textarea-field"></textarea>
        </div>

        <div *ngIf="uploadProgress > 0 && uploadProgress < 100" class="progress-bar-wrap">
          <div class="progress-bar" [style.width.%]="uploadProgress"></div>
          <span class="progress-label">{{ uploadProgress }}%</span>
        </div>

        <div class="form-group checkbox-group">
          <label class="checkbox-container">
            <input type="checkbox" [(ngModel)]="generateFlashcards">
            <span class="checkmark"></span>
            Auto-generate flashcards from this note
          </label>
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

    .header-section h2 {
      font-size: 2.2rem;
      font-weight: 800;
      margin-bottom: 8px;
      color: var(--text-primary);
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
      border: 1px solid var(--glass-border);
      background: var(--input-bg);
      color: var(--input-text-color);
      font-size: 1rem;
      font-family: inherit;
      outline: none;
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

    .drop-icon { font-size: 2rem; }
    .drop-text { font-weight: 600; color: var(--text-primary); font-size: 0.95rem; }
    .drop-hint { font-size: 0.8rem; color: var(--text-secondary); }
    .file-icon { font-size: 1.8rem; }

    .file-name { font-weight: 600; color: var(--accent-primary); font-size: 0.95rem; word-break: break-all; }
    .file-size { font-size: 0.8rem; color: var(--text-secondary); }

       label moved to normal flow below the bar */
    .progress-bar-wrap {
      position: relative;
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
      font-size: 1.1rem;
      font-weight: 600;
      cursor: pointer;
      transition: opacity 0.25s ease, transform 0.25s ease, box-shadow 0.25s ease;
      margin-top: 8px;
      box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 8px;
    }

    .btn-primary:hover:not(:disabled) {
      opacity: 0.9;
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
    }

    .btn-primary:active:not(:disabled) { transform: translateY(0); }
    .btn-primary:disabled { opacity: 0.45; cursor: not-allowed; transform: none; box-shadow: none; }

    .nav-link-row {
      margin-top: 16px;
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
      border: 2px solid rgba(255, 255, 255, 0.4);
      border-top-color: #ffffff;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    .checkbox-group {
      margin-top: -8px;
      margin-bottom: 24px;
    }

    .checkbox-container {
      display: flex;
      align-items: center;
      gap: 12px;
      cursor: pointer;
      font-size: 0.95rem;
      font-weight: 500;
      color: var(--text-primary);
      user-select: none;
    }

    .checkbox-container input {
      position: absolute;
      opacity: 0;
      cursor: pointer;
      height: 0;
      width: 0;
    }

    .checkmark {
      height: 22px;
      width: 22px;
      min-width: 22px;
      background: var(--nav-bg);
      border: 1px solid var(--glass-border);
      border-radius: 6px;
      transition: background 0.2s ease, border-color 0.2s ease;
      position: relative;
    }

    .checkbox-container:hover input ~ .checkmark {
      background: rgba(99, 102, 241, 0.1);
      border-color: var(--accent-primary);
    }

    .checkbox-container input:checked ~ .checkmark {
      background: var(--accent-primary);
      border-color: var(--accent-primary);
    }

    .checkmark:after {
      content: "";
      position: absolute;
      display: none;
      left: 8px;
      top: 4px;
      width: 5px;
      height: 10px;
      border: solid white;
      border-width: 0 2px 2px 0;
      transform: rotate(45deg);
    }

    .checkbox-container input:checked ~ .checkmark:after { display: block; }

    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class TeacherNotesUploadComponent {
    title: string = '';
    subject: string = '';
    description: string = '';
    selectedFile: File | null = null;
    generateFlashcards: boolean = false;
    isLoading: boolean = false;
    uploadProgress: number = 0;

    constructor(public router: Router, private noteUploadService: NoteUploadService) { }

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
            if (file.type === 'application/pdf') {
                this.selectedFile = file;
            } else {
                alert('Please drop a valid PDF file.');
            }
        }
    }

    formatSize(bytes: number): string {
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }

    uploadNote() {
        if (!this.title || !this.subject) {
            alert('Please fill in Title and Subject');
            return;
        }
        if (!this.selectedFile) {
            alert('Please select a PDF file to upload');
            return;
        }

        this.isLoading = true;
        this.uploadProgress = 0;

        const formData = new FormData();
        formData.append('title', this.title);
        formData.append('subject', this.subject);
        formData.append('description', this.description);
        formData.append('pdf', this.selectedFile);
        formData.append('generateFlashcards', this.generateFlashcards.toString());

        this.noteUploadService.uploadNote(
            formData,
            (percent) => { this.uploadProgress = percent; },
            (_response) => {
                this.isLoading = false;
                this.uploadProgress = 0;
                alert('Notes uploaded successfully!');
                this.title = '';
                this.subject = '';
                this.description = '';
                this.generateFlashcards = false;
                this.selectedFile = null;
            },
            (_status, message) => {
                this.isLoading = false;
                this.uploadProgress = 0;
                alert(`Failed to upload notes: ${message}`);
            }
        );
    }
}
