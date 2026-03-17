import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AuthService } from '../../../core/auth/auth.service';

@Injectable({
    providedIn: 'root'
})
export class SummarizationService {
    private apiUrl = `${environment.BACKEND_BASE_URL}/api/chat/summarize`;

    constructor(private http: HttpClient, private authService: AuthService) { }

    summarize(text: string): Observable<{ summary: string }> {
        const token = this.authService.getToken();
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        });

        return this.http.post<{ summary: string }>(this.apiUrl, { text }, { headers });
    }
}
