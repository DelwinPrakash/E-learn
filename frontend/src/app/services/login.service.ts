import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  constructor(private http: HttpClient) {}

  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post(`${environment.BACKEND_BASE_URL}/api/auth/login`, credentials);
  }

  verifyEmailToken(data: { token: string }): Observable<any> {
    return this.http.get(`${environment.BACKEND_BASE_URL}/api/user/verify-email?token=${data.token}`);
  }

  logout(data: { session_id: string }): Observable<any> {
    return this.http.post(`${environment.BACKEND_BASE_URL}/api/auth/logout`, data);
  }
}