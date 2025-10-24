import { Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private tokenKey = 'e_learning_token';
  
  constructor() { }

  setToken(token: string): void{
    localStorage.setItem(this.tokenKey, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    if(!token) return false;

    try{
      const decoded: any = jwtDecode(token);
      return decoded.exp * 1000 > Date.now();
    }catch{
      return false;
    }
  }

  logout(): void{
    localStorage.removeItem(this.tokenKey);
  }
}
