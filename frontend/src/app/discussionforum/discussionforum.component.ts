import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment.development';

interface Thread {
  id: string;
  title: string;
  content: string;
  author: string;
  replies: number;
  views: number;
  createdAt: string;
  lastReplyAt: string;
}

interface Reply {
  id: string;
  threadId: string;
  content: string;
  author: string;
  createdAt: string;
  likes: number;
}

@Component({
  selector: 'app-discussionforum',
  templateUrl: './discussionforum.component.html',
  styleUrls: ['./discussionforum.component.css']
})
export class DiscussionfomrComponent implements OnInit {
  threads: Thread[] = [];
  selectedThread: Thread | null = null;
  replies: Reply[] = [];
  newThreadTitle: string = '';
  newThreadContent: string = '';
  newReplyContent: string = '';
  showNewThreadForm: boolean = false;
  showThreadDetail: boolean = false;
  userName: string = '';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadUserName();
    this.loadThreads();
  }

  loadUserName(): void {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      this.userName = user.firstName + ' ' + user.lastName;
    }
  }

  loadThreads(): void {
    // Load threads from mock data or API
    this.threads = [
      {
        id: '1',
        title: 'How to prepare for JavaScript interviews?',
        content: 'Can anyone share tips for preparing JavaScript interviews?',
        author: 'John Doe',
        replies: 5,
        views: 23,
        createdAt: '2 days ago',
        lastReplyAt: '1 day ago'
      },
      {
        id: '2',
        title: 'Best Angular practices',
        content: 'What are the current best practices in Angular development?',
        author: 'Jane Smith',
        replies: 8,
        views: 45,
        createdAt: '3 days ago',
        lastReplyAt: '2 hours ago'
      },
      {
        id: '3',
        title: 'Learning TypeScript fundamentals',
        content: 'I am new to TypeScript. Where should I start?',
        author: 'Mike Johnson',
        replies: 3,
        views: 12,
        createdAt: '5 days ago',
        lastReplyAt: '3 days ago'
      }
    ];
  }

  createNewThread(): void {
    if (this.newThreadTitle.trim() && this.newThreadContent.trim()) {
      const newThread: Thread = {
        id: Date.now().toString(),
        title: this.newThreadTitle,
        content: this.newThreadContent,
        author: this.userName,
        replies: 0,
        views: 1,
        createdAt: 'just now',
        lastReplyAt: 'just now'
      };
      this.threads.unshift(newThread);
      this.newThreadTitle = '';
      this.newThreadContent = '';
      this.showNewThreadForm = false;
      alert('Thread created successfully!');
    } else {
      alert('Please fill in all fields');
    }
  }

  selectThread(thread: Thread): void {
    this.selectedThread = thread;
    this.showThreadDetail = true;
    this.loadReplies(thread.id);
  }

  loadReplies(threadId: string): void {
    // Mock replies data
    this.replies = [
      {
        id: '1',
        threadId: threadId,
        content: 'Great question! You should focus on async/await, closures, and event loop.',
        author: 'Alex Chen',
        createdAt: '1 day ago',
        likes: 12
      },
      {
        id: '2',
        threadId: threadId,
        content: 'Don\'t forget about promises and error handling. These are frequently asked!',
        author: 'Sarah Williams',
        createdAt: '1 day ago',
        likes: 8
      }
    ];
  }

  addReply(): void {
    if (this.newReplyContent.trim() && this.selectedThread) {
      const newReply: Reply = {
        id: Date.now().toString(),
        threadId: this.selectedThread.id,
        content: this.newReplyContent,
        author: this.userName,
        createdAt: 'just now',
        likes: 0
      };
      this.replies.push(newReply);
      this.selectedThread.replies += 1;
      this.newReplyContent = '';
      alert('Reply posted successfully!');
    } else {
      alert('Please write a reply');
    }
  }

  backToThreads(): void {
    this.showThreadDetail = false;
    this.selectedThread = null;
    this.replies = [];
  }

  likeReply(reply: Reply): void {
    reply.likes += 1;
  }

  deleteThread(threadId: string): void {
    if (confirm('Are you sure you want to delete this thread?')) {
      this.threads = this.threads.filter(t => t.id !== threadId);
      alert('Thread deleted successfully!');
    }
  }

  deleteReply(replyId: string): void {
    if (confirm('Are you sure you want to delete this reply?')) {
      this.replies = this.replies.filter(r => r.id !== replyId);
      alert('Reply deleted successfully!');
    }
  }
}
