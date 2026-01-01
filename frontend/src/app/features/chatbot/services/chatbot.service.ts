import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';

export interface ChatMessage {
  sender: 'user' | 'bot';
  text: string;
}

@Injectable({ providedIn: 'root' })
export class ChatbotService {
  constructor() { }

  sendMessage(text: string): Observable<{ text: string }> {
    // For now return a stubbed response. Replace with HTTP calls to your backend when ready.
    const reply = this.generateReply(text);
    return of({ text: reply }).pipe(delay(700));
  }

  private generateReply(userText: string): string {
    const lower = userText.toLowerCase();
    if (lower.includes('hello') || lower.includes('hi')) return 'Hello! How can I help you with your learning today?';
    if (lower.includes('quiz')) return 'You can take quizzes under the Quiz section. Want a sample question?';
    if (lower.includes('flash') || lower.includes('flashcard')) return 'Flash cards help with active recall. Try the Flash Cards section to start practicing.';
    if (lower.includes('course') || lower.includes('materials')) return 'You can access course materials from the Dashboard under Learning Materials.';
    return "That's interesting — tell me more, or ask me a specific question about your course or quizzes.";
  }
}
