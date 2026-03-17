import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment.development';
import { AuthService } from '../../../core/auth/auth.service';

@Injectable({
    providedIn: 'root'
})
export class NoteUploadService {
    private baseUrl = `${environment.BACKEND_BASE_URL}/api/note`;

    constructor(private http: HttpClient, private authService: AuthService) { }

    private getHeaders(): HttpHeaders {
        return new HttpHeaders({ 'Authorization': `Bearer ${this.authService.getToken()}` });
    }

    /**
     * Upload a PDF file with metadata.
     * Uses XHR directly to support upload progress tracking.
     * Returns the XHR instance so the caller can cancel if needed.
     */
    uploadNote(
        formData: FormData,
        onProgress: (percent: number) => void,
        onSuccess: (response: any) => void,
        onError: (status: number, message: string) => void
    ): XMLHttpRequest {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', `${this.baseUrl}/upload`);
        xhr.setRequestHeader('Authorization', `Bearer ${this.authService.getToken()}`);

        xhr.upload.addEventListener('progress', (e) => {
            if (e.lengthComputable) {
                onProgress(Math.round((e.loaded / e.total) * 100));
            }
        });

        xhr.onload = () => {
            const body = JSON.parse(xhr.responseText);
            if (xhr.status === 201) {
                onSuccess(body);
            } else {
                onError(xhr.status, body.message || 'Upload failed');
            }
        };

        xhr.onerror = () => onError(0, 'Network error. Please try again.');

        xhr.send(formData);
        return xhr;
    }

    /** Fetch all notes, optionally filtered by subject. */
    getNotes(subject?: string): Observable<any[]> {
        const params = subject ? `?subject=${encodeURIComponent(subject)}` : '';
        return this.http.get<any[]>(`${this.baseUrl}/list${params}`, { headers: this.getHeaders() });
    }

    /** Delete a note by ID (teacher or admin only). */
    deleteNote(noteId: string): Observable<any> {
        return this.http.delete<any>(`${this.baseUrl}/${noteId}`, { headers: this.getHeaders() });
    }
}
