import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AuthService } from '../auth/auth.service';

export interface UserProfile {
    user_id: string;
    name: string;
    role: string;
    phone: string;
    rank: number;
    xp: number;
    created_at: Date;
    email: string;
}

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private apiUrl = `${environment.BACKEND_BASE_URL}/api/user/profile`;

    constructor(private http: HttpClient, private authService: AuthService) { }

    
    getUserProfile(): Observable<UserProfile> {
        const token = this.authService.getToken();
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${token}`
        });
        return this.http.get<UserProfile>(this.apiUrl, { headers });
    }
}
