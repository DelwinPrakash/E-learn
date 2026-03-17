import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../core/auth/auth.service';
import { VideoClassService } from '../services/video-class.service';
import { environment } from 'src/environments/environment.development';

interface Video {
  video_id: string;
  title: string;
  description: string;
  url: string;
  subject: string;
  author_id: string;
  User?: { name: string };
  created_at: string;
}

@Component({
    selector: 'app-video-class',
    template: `
    <div class="page-wrapper">
      <!-- Header -->
      <div class="page-header">
        <div class="header-text">
          <h1>🎥 Video Classes</h1>
          <p>Explore our library of educational videos</p>
        </div>
        <!-- Subject filter -->
        <div class="filter-row">
          <input
            type="text"
            [(ngModel)]="subjectFilter"
            (ngModelChange)="onFilterChange($event)"
            placeholder="Filter by subject..."
            class="filter-input"
          />
        </div>
      </div>

      <!-- Loading -->
      <div *ngIf="isLoading" class="state-box">
        <div class="spinner"></div>
        <p>Loading videos...</p>
      </div>

      <!-- Empty -->
      <div *ngIf="!isLoading && filteredVideos.length === 0" class="state-box empty">
        <span class="empty-icon">🎬</span>
        <p>No video classes available yet.</p>
      </div>

      <!-- Video grid -->
      <div class="video-grid" *ngIf="!isLoading && filteredVideos.length > 0">
        <div class="video-card glass-panel" *ngFor="let video of filteredVideos">

          <!-- Native video player -->
          <div class="player-wrap">
            <video controls preload="metadata" class="video-player">
              <source [src]="getVideoUrl(video.url)" type="video/mp4">
              <source [src]="getVideoUrl(video.url)" type="video/webm">
              Your browser does not support the video tag.
            </video>
          </div>

          <div class="card-body">
            <span class="subject-tag">{{ video.subject }}</span>
            <h3 class="video-title">{{ video.title }}</h3>
            <p class="video-desc" *ngIf="video.description">{{ video.description }}</p>
            <div class="meta-row">
              <span>👤 {{ video.User?.name || 'Unknown' }}</span>
              <span>📅 {{ video.created_at | date:'mediumDate' }}</span>
            </div>
          </div>

          <button *ngIf="canDelete(video)" class="btn-delete" (click)="deleteVideo(video.video_id)">
            🗑️ Delete
          </button>
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
      color: var(--text-primary);
      font-size: 2.2rem;
      font-weight: 800;
      margin-bottom: 6px;
    }
    .header-text p { color: var(--text-secondary); font-size: 1rem; }

    .filter-input {
      padding: 10px 16px;
      border-radius: 10px;
      border: 1px solid var(--glass-border-strong);
      background: var(--input-bg);
      color: var(--input-text-color);
      font-size: 0.95rem;
      outline: none;
      transition: border-color 0.3s ease, box-shadow 0.3s ease;
      min-width: 220px;
    }
    .filter-input::placeholder { color: var(--input-placeholder); }
    .filter-input:focus { border-color: var(--accent-primary); box-shadow: 0 0 0 3px rgba(99,102,241,0.15); }

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
      border: 3px solid var(--glass-border);
      border-top-color: var(--accent-primary);
      border-radius: 50%;
      animation: spin 0.9s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .empty-icon { font-size: 3rem; }

    /* Grid */
    .video-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 24px;
    }

    /* Card */
    .video-card {
      border-radius: 16px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      transition: transform 0.25s ease, box-shadow 0.25s ease;
    }
    .video-card:hover { transform: translateY(-4px); box-shadow: var(--glass-shadow-hover); }

    /* Player */
    .player-wrap {
      background: #000;
      width: 100%;
      aspect-ratio: 16/9;
    }
    .video-player {
      width: 100%;
      height: 100%;
      display: block;
      object-fit: contain;
    }

    /* Card body */
    .card-body {
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      flex: 1;
    }
    .subject-tag {
      display: inline-block;
      background: rgba(0, 8, 255, 0.15);
      color: var(--primary-color);
      border: 1px solid rgba(99,102,241,0.25);
      padding: 3px 10px;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 700;
      width: fit-content;
    }
    .video-title { font-size: 1.05rem; font-weight: 700; color: var(--text-primary); margin: 0; }
    .video-desc { font-size: 0.85rem; color: var(--text-secondary); line-height: 1.5; flex: 1; }
    .meta-row {
      display: flex;
      justify-content: space-between;
      font-size: 0.78rem;
      color: var(--text-secondary);
      margin-top: 4px;
    }

    /* Delete */
    .btn-delete {
      margin: 0 16px 16px;
      padding: 8px 14px;
      background: rgba(244,63,94,0.1);
      color: var(--danger-color);
      border: 1px solid rgba(244,63,94,0.25);
      border-radius: 8px;
      cursor: pointer;
      font-size: 0.85rem;
      font-weight: 600;
      transition: background 0.2s ease;
    }
    .btn-delete:hover { background: rgba(244,63,94,0.22); }
  `]
})
export class VideoClassComponent implements OnInit {
    videos: Video[] = [];
    filteredVideos: Video[] = [];
    isLoading = true;
    subjectFilter = '';
    currentUserId = '';

    constructor(
        private videoClassService: VideoClassService,
        private authService: AuthService
    ) { }

    ngOnInit() {
        const user = this.authService.getUser();
        if (user) this.currentUserId = user.user_id;
        this.loadVideos();
    }

    loadVideos() {
        this.isLoading = true;
        this.videoClassService.getVideos().subscribe({
            next: (data) => {
                this.videos = data;
                this.filteredVideos = data;
                this.isLoading = false;
            },
            error: (err) => {
                console.error('Failed to load videos:', err);
                this.isLoading = false;
            }
        });
    }

    onFilterChange(value: string) {
        const q = value.toLowerCase().trim();
        this.filteredVideos = q
            ? this.videos.filter(v => v.subject.toLowerCase().includes(q) || v.title.toLowerCase().includes(q))
            : this.videos;
    }

    getVideoUrl(relativePath: string): string {
        // If it's already a full URL leave it, otherwise prepend backend base
        if (relativePath.startsWith('http')) return relativePath;
        return `${environment.BACKEND_BASE_URL}/${relativePath}`;
    }

    canDelete(video: Video): boolean {
        return this.authService.isAdmin() ||
            (this.authService.isTeacher() && video.author_id === this.currentUserId);
    }

    deleteVideo(id: string) {
        if (!confirm('Are you sure you want to delete this video?')) return;
        this.videoClassService.deleteVideo(id).subscribe({
            next: () => {
                this.videos = this.videos.filter(v => v.video_id !== id);
                this.filteredVideos = this.filteredVideos.filter(v => v.video_id !== id);
            },
            error: () => alert('Failed to delete video')
        });
    }
}
