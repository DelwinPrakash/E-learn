import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AuthService } from '../../../core/auth/auth.service';

@Injectable({
    providedIn: 'root'
})
export class LeaderboardService {
    constructor(private http: HttpClient, private authService: AuthService) { }

    getLeaderboard(): Observable<any[]> {
        const token = this.authService.getToken();
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${token}`
        });
        const leaderboardUrl = `${environment.BACKEND_BASE_URL}/api/user/leaderboard`;
        return this.http.get<any[]>(leaderboardUrl, { headers });
    }
}
