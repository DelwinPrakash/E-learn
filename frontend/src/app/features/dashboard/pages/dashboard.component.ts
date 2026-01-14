import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, UserInfo } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  activeTab: string = 'Dashboard';
  activeSection: string = 'dashboard';
  isSidebarCollapsed: boolean = false;
  isDarkMode: boolean = false;

  // user: User = {
  //   username: '',
  //   firstName: '',
  //   lastName: '',
  //   email: '',
  //   avatar: ''
  // };

  menuItems = {
    overview: [
      { name: 'Dashboard', icon: '📊', route: 'dashboard' },
      { name: 'Leaderboard', icon: '🏆', route: 'leaderboard' }
    ],
    learn: [
      { name: 'Video Class', icon: '🎥', route: 'video-class' },
      { name: 'Video to Text', icon: '✨', route: 'video-to-text' },
      { name: 'Materials', icon: '📚', route: 'materials' },
      { name: 'Learning Paths', icon: '🛤️', route: 'learning-paths' }
    ],
    practice: [
      { name: 'Chatbot', icon: '🤖', route: 'chatbot' },
      { name: 'Flash Card', icon: '🎴', route: 'flashcard' },
      { name: 'Quiz', icon: '📝', route: 'quiz' },
      { name: 'Discussion Forum', icon: '💬', route: 'discussion-forum' }
    ],
    profile: [
      { name: 'Profile', icon: '👤', route: 'profile' }
    ]
  };

  userDetails: UserInfo | null = null;

  constructor(private router: Router, private authService: AuthService) { }

  ngOnInit(): void {
    this.loadUserData();
  }

  loadUserData(): void {
    const storedUser = localStorage.getItem('e_learning_user');
    if (storedUser) {
      this.userDetails = JSON.parse(storedUser);
    }
  }

  getSectionTitle(section: string): string {
    const titleMap: { [key: string]: string } = {
      'dashboard': 'Dashboard',
      'profile': 'Profile Settings',
      'leaderboard': 'Leaderboard',
      'video-class': 'Video Classes',
      'materials': 'Learning Materials',
      'learning-paths': 'Learning Paths',
      'chatbot': 'AI Chatbot',
      'flashcard': 'Flash Cards',
      'quiz': 'Quizzes',
      'discussion-forum': 'Discussion Forum',
      'video-to-text': 'Video to Text'
    };
    return titleMap[section] || section;
  }
}