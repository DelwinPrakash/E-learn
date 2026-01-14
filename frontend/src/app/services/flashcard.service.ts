import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FlashcardService {

  private apiUrl = 'http://localhost:3000/api/user';

  constructor(private http: HttpClient) {}

  getDecks() {
    const token = localStorage.getItem('token');

    return this.http.get<any[]>(
      `${this.apiUrl}/flashcards/decks`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
  }

  getDeckCards(deckId: string) {
    const token = localStorage.getItem('token');

    return this.http.get<any[]>(
      `${this.apiUrl}/flashcards/decks/${deckId}/cards`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
  }
}
