import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SignupService {
  private apiUrl = 'http://localhost:5000/api/auth/signup';  

  constructor(private http: HttpClient) {}

  signup(userData: { name: string; email: string; password: string }): Observable<any> {
    return this.http.post<any>(this.apiUrl, userData);
  }
}
