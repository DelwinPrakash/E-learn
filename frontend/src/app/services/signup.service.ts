import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class SignupService {
  constructor(private http: HttpClient) {}

  signup(data: { name: string; email: string; password: string }): Observable<any> {
    return this.http.post(`${environment.BACKEND_BASE_URL}/api/auth/signup`, data);
  }
}
