import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ChatbotService, ChatMessage } from '../services/chatbot.service';

@Component({
  selector: 'app-chatbot',
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.css']
})
export class ChatbotComponent implements OnInit {
  @ViewChild('messagesContainer') private messagesContainer?: ElementRef;
  messages: ChatMessage[] = [];
  newMessage: string = '';
  loading: boolean = false;

  constructor(private chatbotService: ChatbotService) { }

  ngOnInit(): void {
    // Load chat history
    this.chatbotService.getChatHistory().subscribe({
      next: (history) => {
        if (history && history.length > 0) {
          this.messages = history;
        } else {
          // welcome message
          this.messages.push({ sender: 'bot', text: 'Hi! I am your learning assistant. Ask me anything about the course.' });
        }
        setTimeout(() => this.scrollToBottom(), 100);
      },
      error: (err) => {
        console.error('Failed to load chat history', err);
        // Fallback to welcome message
        this.messages.push({ sender: 'bot', text: 'Hi! I am your learning assistant. Ask me anything about the course.' });
      }
    });
  }

  private scrollToBottom(): void {
    try {
      const el = this.messagesContainer?.nativeElement;
      if (el) {
        el.scrollTop = el.scrollHeight;
      }
    } catch (err) { /* ignore */ }
  }

  send(): void {
    const text = this.newMessage.trim();
    if (!text) return;

    const userMsg: ChatMessage = { sender: 'user', text };
    this.messages.push(userMsg);
    this.newMessage = '';
    this.loading = true;

    this.chatbotService.sendMessage(text).subscribe({
      next: (res) => {
        this.messages.push({ sender: 'bot', text: res.text });
        this.loading = false;
        setTimeout(() => this.scrollToBottom(), 0);
      },
      error: (err) => {
        console.error('Chatbot error', err);
        this.messages.push({ sender: 'bot', text: 'Sorry, something went wrong. Try again later.' });
        this.loading = false;
        setTimeout(() => this.scrollToBottom(), 0);
      }
    });
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.send();
    }
  }
}
