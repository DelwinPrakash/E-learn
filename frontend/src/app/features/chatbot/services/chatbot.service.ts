import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment.development';
import { AuthService } from 'src/app/core/auth/auth.service';

export interface ChatMessage {
  sender: 'user' | 'bot';
  text: string;
}

@Injectable({ providedIn: 'root' })
export class ChatbotService {
  private apiUrl = `${environment.BACKEND_BASE_URL}/api/chat`;

  constructor(private http: HttpClient, private authService: AuthService) { }

  sendMessage(text: string): Observable<{ text: string }> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.post<{ response: string }>(this.apiUrl, { message: text }, { headers }).pipe(
      map(res => ({ text: res.response }))
    );
  }

  getChatHistory(): Observable<ChatMessage[]> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.get<{ chats: any[] }>(`${this.apiUrl}/history`, { headers }).pipe(
      map(res => {
        const history: ChatMessage[] = [];
        res.chats.forEach(chat => {
          if (chat.message) {
            history.push({ sender: 'user', text: chat.message });
          }
          if (chat.response) {
            history.push({ sender: 'bot', text: chat.response });
          }
        });
        return history;
      })
    );
  }
}
