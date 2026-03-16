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

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }

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
    color: var(--text-primary);
    margin-bottom: 6px;
    line-height: 1.2;
  }

  .header-text p {
    color: var(--text-secondary);
    font-size: 1rem;
  }

  .filter-input {
    padding: 10px 16px;
    border-radius: 10px;
    border: 1px solid var(--glass-border-strong);
    background: var(--input-bg);
    color: var(--input-text-color);
    font-size: 0.95rem;
    outline: none;
    transition: border-color 0.3s ease, box-shadow 0.3s ease;
    min-width: 240px;
  }

  .filter-input::placeholder {
    color: var(--input-placeholder);
  }

  .filter-input:focus {
    border-color: var(--accent-primary);
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
  }

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
    width: 40px;
    height: 40px;
    border: 3px solid var(--glass-border-strong);
    border-top-color: var(--accent-primary);
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

  /* Card — give it a solid white surface in light mode so text is readable */
  .note-card {
    border-radius: 16px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    transition: transform 0.25s ease, box-shadow 0.25s ease;
    background: rgba(255, 255, 255, 0.92);
    border: 1px solid rgba(99, 102, 241, 0.15);
    box-shadow: 0 4px 20px rgba(99, 102, 241, 0.1);
  }

  /* Dark mode override — restore glass surface */
  :host-context(body.dark-mode) .note-card {
    background: rgba(15, 23, 42, 0.75);
    border-color: rgba(255, 255, 255, 0.1);
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
  }

  .note-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 36px rgba(99, 102, 241, 0.2);
  }

  :host-context(body.dark-mode) .note-card:hover {
    box-shadow: var(--glass-shadow-hover);
  }

  /* PDF header — solid light surface */
  .pdf-header {
    background: rgba(99, 102, 241, 0.08);
    border-bottom: 1px solid rgba(99, 102, 241, 0.15);
    padding: 20px 16px;
    display: flex;
    align-items: center;
    gap: 12px;
  }

  :host-context(body.dark-mode) .pdf-header {
    background: rgba(99, 102, 241, 0.12);
    border-bottom-color: rgba(255, 255, 255, 0.08);
  }

  .pdf-icon {
    font-size: 2rem;
    line-height: 1;
  }

  /* Subject tag — darker text for light mode contrast */
  .subject-tag {
    background: rgba(99, 102, 241, 0.15);
    color: #4338ca;
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 0.78rem;
    font-weight: 700;
    border: 1px solid rgba(99, 102, 241, 0.3);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 160px;
  }

  :host-context(body.dark-mode) .subject-tag {
    color: var(--accent-primary);
    border-color: rgba(99, 102, 241, 0.25);
  }

  /* Card body — explicit dark text in light mode */
  .card-body {
    padding: 16px;
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .note-title {
    font-size: 1.05rem;
    font-weight: 700;
    color: #1e293b;
    margin: 0;
    line-height: 1.35;
    background: rgba(99, 102, 241, 0.15);
    padding: 4px 12px;
    border-radius: 20px;
  }

  :host-context(body.dark-mode) .note-title {
    color: #f8fafc;
  }

  .note-desc {
    font-size: 0.85rem;
    color: #475569;
    line-height: 1.5;
    flex: 1;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  :host-context(body.dark-mode) .note-desc {
    color: #cbd5e1;
  }

  .meta-row {
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 4px;
    font-size: 0.78rem;
    color: #64748b;
    margin-top: 4px;
  }

  :host-context(body.dark-mode) .meta-row {
    color: #94a3b8;
  }

  /* Card actions */
  .card-actions {
    padding: 12px 16px 16px;
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    align-items: center;
    border-top: 1px solid rgba(99, 102, 241, 0.1);
  }

  :host-context(body.dark-mode) .card-actions {
    border-top-color: rgba(255, 255, 255, 0.06);
  }

  .btn-view,
  .btn-download,
  .btn-delete,
  .btn-gen {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 7px 13px;
    border-radius: 8px;
    font-size: 0.82rem;
    font-weight: 600;
    text-decoration: none;
    cursor: pointer;
    transition: background 0.2s ease, transform 0.15s ease;
    white-space: nowrap;
    line-height: 1;
  }

  .btn-view {
    background: rgba(99, 102, 241, 0.12);
    color: #4338ca;
    border: 1px solid rgba(99, 102, 241, 0.3);
  }
  .btn-view:hover {
    background: rgba(99, 102, 241, 0.22);
    transform: translateY(-1px);
  }

  :host-context(body.dark-mode) .btn-view {
    color: var(--accent-primary);
    border-color: rgba(99, 102, 241, 0.25);
  }

  .btn-download {
    background: rgba(16, 185, 129, 0.12);
    color: #047857;
    border: 1px solid rgba(16, 185, 129, 0.3);
  }
  .btn-download:hover {
    background: rgba(16, 185, 129, 0.22);
    transform: translateY(-1px);
  }

  :host-context(body.dark-mode) .btn-download {
    color: var(--success-color);
    border-color: rgba(16, 185, 129, 0.25);
  }

  .btn-delete {
    background: rgba(244, 63, 94, 0.1);
    color: #be123c;
    border: 1px solid rgba(244, 63, 94, 0.3);
  }
  .btn-delete:hover {
    background: rgba(244, 63, 94, 0.2);
    transform: translateY(-1px);
  }

  :host-context(body.dark-mode) .btn-delete {
    color: var(--danger-color);
    border-color: rgba(244, 63, 94, 0.25);
  }

  .btn-gen {
    background: rgba(168, 85, 247, 0.12);
    color: #7e22ce;
    border: 1px solid rgba(168, 85, 247, 0.3);
  }
  .btn-gen:hover:not(:disabled) {
    background: rgba(168, 85, 247, 0.22);
    transform: translateY(-1px);
  }
  .btn-gen:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }

  :host-context(body.dark-mode) .btn-gen {
    color: var(--accent-secondary);
    border-color: rgba(168, 85, 247, 0.25);
  }

  @media (max-width: 600px) {
    .page-header { flex-direction: column; }
    .filter-input { width: 100%; min-width: unset; }
    .notes-grid { grid-template-columns: 1fr; }
  }
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
