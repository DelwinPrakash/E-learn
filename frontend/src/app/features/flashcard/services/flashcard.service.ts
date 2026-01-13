import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../../../core/auth/auth.service'; // ✅ FIXED
import { environment } from 'src/environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class FlashcardService {

  private API = `${environment.BACKEND_BASE_URL}/api/user/flashcards`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

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
