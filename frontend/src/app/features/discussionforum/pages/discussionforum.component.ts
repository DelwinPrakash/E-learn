import { Component, OnInit } from '@angular/core';
import { DiscussionService, Thread, Reply } from '../services/discussion.service';
import { AuthService, UserInfo } from '../../../core/auth/auth.service';

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
  userId: string = '';

  constructor(private discussionService: DiscussionService, private authService: AuthService) { }

  ngOnInit(): void {
    this.loadUserName();
    this.loadThreads();
  }

  loadUserName(): void {
    this.authService.user$.subscribe(user => {
      if (user) {
        this.userName = user.name;
        this.userId = user.user_id;
      }
    });
  }

  loadThreads(): void {
    this.discussionService.getThreads().subscribe({
      next: (data) => {
        this.threads = data;
      },
      error: (error) => {
        console.error('Error fetching threads:', error);
      }
    });
  }

  createNewThread(): void {
    if (this.newThreadTitle.trim() && this.newThreadContent.trim()) {
      const newThreadData = {
        title: this.newThreadTitle,
        content: this.newThreadContent,
        author_id: this.userId
      };

      this.discussionService.createThread(newThreadData).subscribe({
        next: (response) => {
          this.loadThreads(); // Reload threads to show the new one
          this.newThreadTitle = '';
          this.newThreadContent = '';
          this.showNewThreadForm = false;
          alert('Thread created successfully!');
        },
        error: (error) => {
          console.error('Error creating thread:', error);
          alert('Failed to create thread.');
        }
      });
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
    this.discussionService.getReplies(threadId).subscribe({
      next: (data) => {
        this.replies = data;
      },
      error: (error) => {
        console.error('Error fetching replies:', error);
      }
    });
  }

  addReply(): void {
    if (this.newReplyContent.trim() && this.selectedThread) {
      const newReplyData = {
        thread_id: this.selectedThread.id,
        content: this.newReplyContent,
        author_id: this.userId
      };

      this.discussionService.addReply(newReplyData).subscribe({
        next: (response) => {
          if (this.selectedThread) {
            this.loadReplies(this.selectedThread.id);
            this.selectedThread.replies += 1; // Optimistic update
          }
          this.newReplyContent = '';
          alert('Reply posted successfully!');
        },
        error: (error) => {
          console.error('Error adding reply:', error);
          alert('Failed to add reply.');
        }
      });
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
    // reply.likes += 1;
  }

  deleteThread(threadId: string): void {
    if (confirm('Are you sure you want to delete this thread?')) {
      this.discussionService.deleteThread(threadId).subscribe({
        next: () => {
          this.threads = this.threads.filter(t => t.id !== threadId);
          if (this.selectedThread && this.selectedThread.id === threadId) {
            this.backToThreads();
          }
          alert('Thread deleted successfully!');
        },
        error: (error) => {
          console.error('Error deleting thread:', error);
          alert('Failed to delete thread.');
        }
      });
    }
  }

  deleteReply(replyId: string): void {
    if (confirm('Are you sure you want to delete this reply?')) {
      this.discussionService.deleteReply(replyId).subscribe({
        next: () => {
          this.replies = this.replies.filter(r => r.id !== replyId);
          if (this.selectedThread) {
            this.selectedThread.replies = Math.max(0, this.selectedThread.replies - 1);
          }
          alert('Reply deleted successfully!');
        },
        error: (error) => {
          console.error('Error deleting reply:', error);
          alert('Failed to delete reply.');
        }
      });
    }
  }
}
