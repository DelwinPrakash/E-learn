import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment.development';
import { AuthService } from '../../../core/auth/auth.service';

@Injectable({
    providedIn: 'root'
})
export class VideoClassService {
    private baseUrl = `${environment.BACKEND_BASE_URL}/api/video`;

    constructor(private http: HttpClient, private authService: AuthService) { }

    private getHeaders(): HttpHeaders {
        return new HttpHeaders({ 'Authorization': `Bearer ${this.authService.getToken()}` });
    }

    /** Fetch all videos, optionally filtered by subject. */
    getVideos(subject?: string): Observable<any[]> {
        const params = subject ? `?subject=${encodeURIComponent(subject)}` : '';
        return this.http.get<any[]>(`${this.baseUrl}/list${params}`, { headers: this.getHeaders() });
    }

    /** Delete a video by ID (teacher or admin only). */
    deleteVideo(videoId: string): Observable<any> {
        return this.http.delete<any>(`${this.baseUrl}/${videoId}`, { headers: this.getHeaders() });
    }
}
