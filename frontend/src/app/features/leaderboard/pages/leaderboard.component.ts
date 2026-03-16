import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { LeaderboardService } from '../services/leaderboard.service';

interface Player {
  rank: number;
  name: string;
  xp: number;
  avatar: string;
  trend: 'up' | 'down' | 'same';
  role?: string;
}

@Component({
  selector: 'app-leaderboard',
  templateUrl: './leaderboard.component.html',
  styleUrls: ['./leaderboard.component.css']
})
export class LeaderboardComponent implements OnInit {
  players: Player[] = [];
  filteredPlayers: Player[] = [];

  searchControl = new FormControl('');
  currentPeriod = 'weekly';
  currentCategory = 'All';

  periods = ['daily', 'weekly', 'monthly', 'all time'];
  categories = ['All', 'Top 10', 'Rising'];

  constructor(private leaderboardService: LeaderboardService) {}

  ngOnInit(): void {
    this.loadLeaderboardData();

    this.searchControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(() => this.filterPlayers());
  }

  loadLeaderboardData(): void {
    this.leaderboardService.getLeaderboard().subscribe({
      next: (data: any[]) => {
        this.players = data.map((user: any) => ({
          rank: user.rank,
          name: user.name,
          xp: user.xp,
          avatar: this.getRandomAvatar(),
          trend: 'same' as const,
          role: user.role
        }));
        this.filteredPlayers = [...this.players];
      },
      error: (err: Error) => {
        console.error('Error fetching leaderboard data', err);
      }
    });
  }

  getRandomAvatar(): string {
    const avatars = ['🏆', '⭐', '🎯', '💎', '🔥', '✨', '⚡', '🌟', '🎓', '👑'];
    return avatars[Math.floor(Math.random() * avatars.length)];
  }

  setPeriod(period: string): void {
    this.currentPeriod = period;
    this.filterPlayers();
  }

  setCategory(category: string): void {
    this.currentCategory = category;
    this.filterPlayers();
  }

  filterPlayers(): void {
    let filtered = [...this.players];
    const term = this.searchControl.value?.toLowerCase() || '';

    if (term) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(term)
      );
    }

    if (this.currentCategory === 'Top 10') {
      filtered = filtered.slice(0, 10);
    } else if (this.currentCategory === 'Rising') {
      filtered = filtered.filter(p => p.trend === 'up');
    }

    this.filteredPlayers = filtered;
  }

  getRankClass(rank: number): string {
    if (rank === 1) return 'rank-gold';
    if (rank === 2) return 'rank-silver';
    if (rank === 3) return 'rank-bronze';
    return 'rank-normal';
  }

  getTrendIcon(trend: string): string {
    if (trend === 'up') return '↑';
    if (trend === 'down') return '↓';
    return '−';
  }

  getTrendClass(trend: string): string {
    if (trend === 'up') return 'trend-up';
    if (trend === 'down') return 'trend-down';
    return 'trend-same';
  }
}