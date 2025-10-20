import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

interface User {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
}

interface MenuItem {
  name: string;
  icon: string;
  route: string;
}

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

  user: User = {
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    avatar: ''
  };

  menuItems = {
    overview: [
      { name: 'Dashboard', icon: '📊', route: 'dashboard' },
      { name: 'Leaderboard', icon: '🏆', route: 'leaderboard' }
    ],
    learn: [
      { name: 'Video Class', icon: '🎥', route: 'video-class' },
      { name: 'Materials', icon: '📚', route: 'materials' },
      { name: 'Learning Paths', icon: '🛤️', route: 'learning-paths' }
    ],
    practice: [
      { name: 'Chatbot', icon: '🤖', route: 'chatbot' },
      { name: 'Flash Card', icon: '🎴', route: 'flash-card' },
      { name: 'Quiz', icon: '📝', route: 'quiz' },
      { name: 'Discussion Forum', icon: '💬', route: 'discussion-forum' }
    ],
    profile: [
      { name: 'Profile', icon: '👤', route: 'profile' }
    ]
  };

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Load user data from localStorage or API
    this.loadUserData();
    // Load theme preference
    this.loadThemePreference();
  }

  loadUserData(): void {
    // Replace with actual API call to fetch user data
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      this.user = JSON.parse(storedUser);
    } else {
      // Default values for testing
      this.user = {
        username: 'Name',
        firstName: 'Firstname',
        lastName: 'Lastname',
        email: 'example@gmail.com',
        avatar: ''
      };
    }
  }

  loadThemePreference(): void {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      this.isDarkMode = true;
      document.body.classList.add('dark-mode');
    }
  }

  // Handle sidebar menu item clicks
  selectMenuItem(section: string): void {
    this.activeSection = section;
    // Set active tab based on section
    this.setActiveTab(section);
  }

  // Handle top navigation tab clicks
  selectTab(tab: string): void {
    this.activeTab = tab;
    
    if (tab === 'Profile') {
      this.activeSection = 'profile';
    } else {
      this.activeSection = 'dashboard';
    }
  }

  private setActiveTab(section: string): void {
    // Map section to tab name
    const tabMap: { [key: string]: string } = {
      'dashboard': 'Dashboard',
      'profile': 'Profile',
      'leaderboard': 'Dashboard',
      'video-class': 'Dashboard',
      'materials': 'Dashboard',
      'learning-paths': 'Dashboard',
      'chatbot': 'Dashboard',
      'flash-card': 'Dashboard',
      'quiz': 'Dashboard',
      'discussion-forum': 'Dashboard'
    };
    this.activeTab = tabMap[section] || 'Dashboard';
  }

  // Toggle dark/light theme
  toggleTheme(): void {
    this.isDarkMode = !this.isDarkMode;
    
    if (this.isDarkMode) {
      document.body.classList.add('dark-mode');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark-mode');
      localStorage.setItem('theme', 'light');
    }
  }

  getInitials(): string {
    if (this.user.firstName && this.user.lastName) {
      return this.user.firstName.charAt(0).toUpperCase() + this.user.lastName.charAt(0).toUpperCase();
    }
    return '??';
  }

  toggleSidebar(): void {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  updateUsername(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.user.username = input.value;
  }

  updateFirstName(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.user.firstName = input.value;
  }

  updateLastName(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.user.lastName = input.value;
  }

  updateEmail(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.user.email = input.value;
  }

  saveProfile(): void {
    // API call to save profile
    console.log('Saving profile:', this.user);
    localStorage.setItem('currentUser', JSON.stringify(this.user));
    alert('Profile saved successfully!');
  }

  resetPassword(): void {
    // Navigate to password reset or open modal
    console.log('Reset password clicked');
    alert('Password reset link sent to your email!');
  }

  deleteAccount(): void {
    const confirmed = confirm('Are you sure you want to delete your account? This action cannot be undone.');
    if (confirmed) {
      // API call to delete account
      console.log('Deleting account');
      localStorage.removeItem('currentUser');
      localStorage.removeItem('theme');
      this.router.navigate(['/login']);
    }
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    this.router.navigate(['/login']);
  }
}