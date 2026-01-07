import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment.development';

@Injectable({
    providedIn: 'root'
})
export class AuthService {

    constructor(private http: HttpClient) { }

    login(credentials: { email: string, password: string }): Observable<any> {
        return this.http.post<any>(`${environment.BACKEND_BASE_URL}/api/auth/login`, credentials);
    }

    signup(credentials: { name: string, email: string, password: string }): Observable<any> {
        return this.http.post<any>(`${environment.BACKEND_BASE_URL}/api/auth/signup`, credentials);
    }
}
