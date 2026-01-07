import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../core/auth/auth.service'; // ✅ FIXED

@Injectable({
  providedIn: 'root'
})
export class FlashcardService {

  private API = 'http://localhost:3000/api/flashcards';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private headers() {
    const token = this.authService.getToken();
    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`
      })
    };
  }

  getDecks(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API}/decks`, this.headers());
  }

  getDeckCards(deckId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.API}/decks/${deckId}/cards`, this.headers());
  }
}
