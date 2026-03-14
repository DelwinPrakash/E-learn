import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../core/auth/auth.service';
import { NoteUploadService } from '../../upload-notes-for-teachers/services/note-upload.service';
import { FlashcardService } from '../../flashcard/services/flashcard.service';
import { environment } from 'src/environments/environment.development';

interface Note {
    note_id: string;
    title: string;
    description: string;
    url: string;
    subject: string;
    author_id: string;
    User?: { name: string };
    created_at: string;
}

@Component({
    selector: 'app-materials',
    template: `
    <div class="page-wrapper">
      <!-- Header -->
      <div class="page-header">
        <div class="header-text">
          <h1>📚 Study Materials</h1>
          <p>Downloadable notes and PDFs from your teachers</p>
        </div>
        <input
          type="text"
          [(ngModel)]="subjectFilter"
          (ngModelChange)="onFilterChange($event)"
          placeholder="Filter by subject or title..."
          class="filter-input"
        />
      </div>

      <!-- Loading -->
      <div *ngIf="isLoading" class="state-box">
        <div class="spinner"></div>
        <p>Loading materials...</p>
      </div>

      <!-- Empty -->
      <div *ngIf="!isLoading && filteredNotes.length === 0" class="state-box">
        <span class="empty-icon">📄</span>
        <p>No study materials available yet.</p>
      </div>

      <!-- Notes grid -->
      <div class="notes-grid" *ngIf="!isLoading && filteredNotes.length > 0">
        <div class="note-card glass-panel" *ngFor="let note of filteredNotes">
          <!-- PDF preview icon header -->
          <div class="pdf-header">
            <span class="pdf-icon">📄</span>
            <span class="subject-tag">{{ note.subject }}</span>
          </div>

          <div class="card-body">
            <h3 class="note-title">{{ note.title }}</h3>
            <p class="note-desc" *ngIf="note.description">{{ note.description }}</p>
            <div class="meta-row">
              <span>👤 {{ note.User?.name || 'Unknown' }}</span>
              <span>📅 {{ note.created_at | date:'mediumDate' }}</span>
            </div>
          </div>

          <div class="card-actions">
            <!-- View in browser -->
            <a [href]="getNoteUrl(note.url)" target="_blank" class="btn-view">
              👁️ View PDF
            </a>
            <!-- Download -->
            <a [href]="getNoteUrl(note.url)" [download]="note.title + '.pdf'" class="btn-download">
              ⬇️ Download
            </a>
            <!-- Delete (teacher/admin only) -->
            <button *ngIf="canDelete(note)" class="btn-delete" (click)="deleteNote(note.note_id)">
              🗑️ Delete
            </button>
            <!-- Generate Flashcards (teacher/admin only) -->
            <button *ngIf="canDelete(note)" class="btn-gen" (click)="generateFlashcards(note)" [disabled]="isGenerating">
              ✨ <span *ngIf="!isGenerating">Generate Flashcards</span>
              <span *ngIf="isGenerating">Generating...</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .page-wrapper {
      padding: 32px 24px;
      max-width: 1200px;
      margin: 0 auto;
      animation: fadeIn 0.5s ease-out;
    }
    @keyframes fadeIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }

    .page-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 16px;
      margin-bottom: 32px;
    }
    .header-text h1 {
      font-size: 2.2rem;
      font-weight: 800;
      background: var(--primary-gradient);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 6px;
    }
    .header-text p { color: var(--text-secondary); font-size: 1rem; }

    .filter-input {
      padding: 10px 16px;
      border-radius: 10px;
      border: 2px solid #e2e8f0;
      background: rgba(255,255,255,0.9);
      color: var(--text-primary);
      font-size: 0.95rem;
      outline: none;
      transition: all 0.3s ease;
      min-width: 240px;
    }
    .filter-input:focus { border-color: #667eea; box-shadow: 0 0 0 4px rgba(102,126,234,0.15); }

    /* States */
    .state-box {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 16px;
      padding: 80px 0;
      color: var(--text-secondary);
    }
    .spinner {
      width: 40px; height: 40px;
      border: 3px solid rgba(102,126,234,0.2);
      border-top-color: #667eea;
      border-radius: 50%;
      animation: spin 0.9s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .empty-icon { font-size: 3rem; }

    /* Grid */
    .notes-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 24px;
    }

    /* Card */
    .note-card {
      border-radius: 16px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      transition: transform 0.25s ease, box-shadow 0.25s ease;
    }
    .note-card:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(0,0,0,0.15); }

    /* PDF header strip */
    .pdf-header {
      background: linear-gradient(135deg, rgba(102,126,234,0.2), rgba(118,75,162,0.2));
      padding: 24px 16px;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .pdf-icon { font-size: 2.5rem; }
    .subject-tag {
      background: rgba(99,102,241,0.15);
      color: #818cf8;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 0.78rem;
      font-weight: 600;
    }

    /* Body */
    .card-body {
      padding: 16px;
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .note-title { font-size: 1.05rem; font-weight: 700; color: var(--text-primary); margin: 0; }
    .note-desc { font-size: 0.85rem; color: var(--text-secondary); line-height: 1.5; flex: 1; }
    .meta-row {
      display: flex;
      justify-content: space-between;
      font-size: 0.78rem;
      color: var(--text-secondary);
      margin-top: 4px;
    }

    /* Actions */
    .card-actions {
      padding: 12px 16px 16px;
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }
    .btn-view, .btn-download {
      padding: 8px 14px;
      border-radius: 8px;
      font-size: 0.82rem;
      font-weight: 600;
      text-decoration: none;
      transition: all 0.2s ease;
      cursor: pointer;
      border: none;
    }
    .btn-view {
      background: rgba(102,126,234,0.15);
      color: #818cf8;
      border: 1px solid rgba(102,126,234,0.25);
    }
    .btn-view:hover { background: rgba(102,126,234,0.3); }

    .btn-download {
      background: rgba(34,197,94,0.12);
      color: #4ade80;
      border: 1px solid rgba(34,197,94,0.25);
    }
    .btn-download:hover { background: rgba(34,197,94,0.25); }

    .btn-delete {
      padding: 8px 14px;
      background: rgba(239,68,68,0.12);
      color: #fca5a5;
      border: 1px solid rgba(239,68,68,0.25);
      border-radius: 8px;
      cursor: pointer;
      font-size: 0.82rem;
      font-weight: 600;
      transition: background 0.2s ease;
    }
    .btn-delete:hover { background: rgba(239,68,68,0.3); }

    .btn-gen {
      padding: 8px 14px;
      background: rgba(102,126,234,0.12);
      color: #818cf8;
      border: 1px solid rgba(102,126,234,0.25);
      border-radius: 8px;
      cursor: pointer;
      font-size: 0.82rem;
      font-weight: 600;
      transition: all 0.2s ease;
    }
    .btn-gen:hover:not(:disabled) { background: rgba(102,126,234,0.25); }
    .btn-gen:disabled { opacity: 0.6; cursor: not-allowed; }
  `]
})
export class MaterialsComponent implements OnInit {
    notes: Note[] = [];
    filteredNotes: Note[] = [];
    isLoading = true;
    isGenerating = false;
    subjectFilter = '';
    currentUserId = '';

    constructor(
        private noteUploadService: NoteUploadService,
        private authService: AuthService,
        private flashcardService: FlashcardService
    ) { }

    ngOnInit() {
        const user = this.authService.getUser();
        if (user) this.currentUserId = user.user_id;
        this.loadNotes();
    }

    loadNotes() {
        this.isLoading = true;
        this.noteUploadService.getNotes().subscribe({
            next: (data) => {
                this.notes = data;
                this.filteredNotes = data;
                this.isLoading = false;
            },
            error: (err) => {
                console.error('Failed to load notes:', err);
                this.isLoading = false;
            }
        });
    }

    onFilterChange(value: string) {
        const q = value.toLowerCase().trim();
        this.filteredNotes = q
            ? this.notes.filter(n =>
                n.subject.toLowerCase().includes(q) ||
                n.title.toLowerCase().includes(q)
            )
            : this.notes;
    }

    getNoteUrl(relativePath: string): string {
        if (relativePath.startsWith('http')) return relativePath;
        return `${environment.BACKEND_BASE_URL}/${relativePath}`;
    }

    canDelete(note: Note): boolean {
        return this.authService.isAdmin() ||
            (this.authService.isTeacher() && note.author_id === this.currentUserId);
    }

    deleteNote(id: string) {
        if (!confirm('Are you sure you want to delete this note?')) return;
        this.noteUploadService.deleteNote(id).subscribe({
            next: () => {
                this.notes = this.notes.filter(n => n.note_id !== id);
                this.filteredNotes = this.filteredNotes.filter(n => n.note_id !== id);
            },
            error: () => alert('Failed to delete note')
        });
    }

    generateFlashcards(note: Note) {
        if (this.isGenerating) return;
        this.isGenerating = true;
        this.flashcardService.generateFlashcards(note.note_id).subscribe({
            next: (resp) => {
                this.isGenerating = false;
                alert(`Success! Generated ${resp.count} flashcards.`);
            },
            error: (err) => {
                this.isGenerating = false;
                console.error('Flashcard generation failed:', err);
                alert('Failed to generate flashcards: ' + (err.error?.message || 'Server error'));
            }
        });
    }
}
