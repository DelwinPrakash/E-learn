import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment.development';
import { AuthService } from '../../../core/auth/auth.service';

interface Video {
  video_id: string;
  title: string;
  description: string;
  url: string;
  subject: string;
  User?: { name: string };
  created_at: string;
}

@Component({
  selector: 'app-video-class',
  template: `
    <div class="video-container">
      <div class="header-section">
        <h1>🎥 Video Classes</h1>
        <p>Explore our library of educational videos</p>
      </div>

      <div *ngIf="isLoading" class="loading-spinner">Loading videos...</div>

      <div *ngIf="!isLoading && videos.length === 0" class="empty-state">
        <p>No video classes available yet.</p>
      </div>

      <div class="video-grid">
        <div *ngFor="let video of videos" class="video-card glass-panel">
          <div class="video-thumbnail">
            <!-- Embed video or show thumbnail -->
                <!-- <iframe [src]="getSafeUrl(video.url)" frameborder="0" allowfullscreen></iframe> -->
          </div>
          <div class="video-info">
            <span class="subject-tag">{{ video.subject }}</span>
            <h3>{{ video.title }}</h3>
            <p class="description">{{ video.description }}</p>
            <div class="meta">
              <span class="author">👤 {{ video.User?.name || 'Unknown' }}</span>
              <span class="date">📅 {{ video.created_at | date:'mediumDate' }}</span>
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
    .video-container {
      padding: 20px;
    }
    .header-section {
      text-align: center;
      margin-bottom: 30px;
    }
    .header-section h1 {
      font-size: 2.5rem;
      margin-bottom: 10px;
      color: var(--text-primary);
    }
    .header-section p {
      color: var(--text-secondary);
    }
    .video-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
    }
    .video-card {
      padding: 20px;
      border-radius: 20px;
      background: var(--glass-bg);
      backdrop-filter: blur(20px);
      border: 1px solid var(--glass-border);
      transition: all var(--transition-speed) ease;
      display: flex;
      flex-direction: column;
      gap: 15px;
      color: var(--text-primary);
    }
    .video-card:hover {
      transform: translateY(-5px);
      background: rgba(255, 255, 255, 0.15);
    }
    .subject-tag {
      background: var(--accent-primary);
      color: white;
      padding: 4px 12px;
      border-radius: 50px;
      font-size: 0.75rem;
      font-weight: 700;
      width: fit-content;
    }
    .video-info h3 {
      font-size: 1.25rem;
      margin: 8px 0;
      font-weight: 800;
    }
    .description {
      color: var(--text-secondary);
      font-size: 0.95rem;
      line-height: 1.5;
      flex-grow: 1;
    }
    .meta {
      display: flex;
      justify-content: space-between;
      font-size: 0.85rem;
      color: var(--text-muted);
      margin-top: 15px;
      border-top: 1px solid var(--glass-border);
      padding-top: 10px;
    }
    .btn-delete {
      background: rgba(239, 68, 68, 0.1);
      color: var(--danger-color);
      border: 1px solid rgba(239, 68, 68, 0.2);
      padding: 10px;
      border-radius: 12px;
      cursor: pointer;
      font-weight: 700;
      margin-top: 10px;
      transition: all 0.3s ease;
    }
    .btn-delete:hover {
      background: var(--danger-color);
      color: white;
    }
  `]
})
export class VideoClassComponent implements OnInit {
  videos: Video[] = [];
  isLoading: boolean = true;
  currentUserId: string = '';

  constructor(private http: HttpClient, private authService: AuthService) { }

  ngOnInit() {
    this.loadVideos();
    const user = this.authService.getUser();
    if (user) this.currentUserId = user.user_id;
  }

  loadVideos() {
    this.isLoading = true;
    const token = this.authService.getToken();
    const headers = { 'Authorization': `Bearer ${token}` };

    this.http.get<Video[]>(`${environment.BACKEND_BASE_URL}/api/video/list`, { headers }).subscribe({
      next: (data) => {
        this.videos = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
      }
    });
  }

  // getSafeUrl(url: string) {
  //     // Simple transformation for YouTube embeds if needed, or just trust the URL for now
  //     // For youtube: replace watch?v= with embed/
  //     let finalUrl = url;
  //     if (url.includes('youtube.com/watch?v=')) {
  //         finalUrl = url.replace('watch?v=', 'embed/');
  //     } else if (url.includes('youtu.be/')) {
  //         const id = url.split('youtu.be/')[1];
  //         finalUrl = `https://www.youtube.com/embed/${id}`;
  //     }
  //     return this.sanitizer.bypassSecurityTrustResourceUrl(finalUrl);
  // }

  canDelete(video: Video): boolean {
    const isAdmin = this.authService.isAdmin();
    const isTeacher = this.authService.isTeacher();
    // Assuming video has author_id but backend returned User object. 
    // Backend controller returns 'include User'. I need to make sure I get author_id or check if it's my video.
    // The backend `getVideos` returns model instances which include `author_id`.
    // My interface didn't include it.
    return isAdmin || (isTeacher && (video as any).author_id === this.currentUserId);
  }

  deleteVideo(id: string) {
    if (!confirm('Are you sure?')) return;

    const token = this.authService.getToken();
    const headers = { 'Authorization': `Bearer ${token}` };

    this.http.delete(`${environment.BACKEND_BASE_URL}/api/video/${id}`, { headers }).subscribe({
      next: () => {
        this.videos = this.videos.filter(v => v.video_id !== id);
        alert('Video deleted');
      },
      error: (err) => alert('Failed to delete video')
    });
  }
}
