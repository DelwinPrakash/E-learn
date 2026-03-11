import { Component, OnInit } from '@angular/core';
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
  searchTerm: string = '';
  selectedFilter: string = 'all';

  constructor(private leaderboardService: LeaderboardService) { }

  ngOnInit() {
    this.loadLeaderboardData();
  }

  loadLeaderboardData() {
    // this.players = [
    //   { rank: 1, name: 'Antony', score: 9850, wins: 145, battles: 150, winRate: 96.7, avatar: '🏆', trend: 'up' },
    //   { rank: 2, name: 'Delwin', score: 9720, wins: 138, battles: 145, winRate: 95.2, avatar: '⭐', trend: 'same' },
    //   { rank: 3, name: 'Sneha', score: 9680, wins: 135, battles: 142, winRate: 95.1, avatar: '🎯', trend: 'up' },
    //   { rank: 4, name: 'Hari', score: 9540, wins: 130, battles: 140, winRate: 92.9, avatar: '💎', trend: 'down' },
    //   { rank: 5, name: 'Revathi', score: 9450, wins: 128, battles: 138, winRate: 92.8, avatar: '🔥', trend: 'up' },
    //   { rank: 6, name: 'Anjal', score: 9320, wins: 125, battles: 136, winRate: 91.9, avatar: '✨', trend: 'same' },
    //   { rank: 7, name: 'Akshay', score: 9180, wins: 122, battles: 134, winRate: 91.0, avatar: '⚡', trend: 'up' },
    //   { rank: 8, name: 'Anshida', score: 9050, wins: 119, battles: 132, winRate: 90.2, avatar: '🌟', trend: 'down' },
    //   { rank: 9, name: 'Arshad', score: 8920, wins: 115, battles: 130, winRate: 88.5, avatar: '🎓', trend: 'up' },
    //   { rank: 10, name: 'Jerin', score: 8780, wins: 112, battles: 128, winRate: 87.5, avatar: '👑', trend: 'same' }
    // ];
    this.leaderboardService.getLeaderboard().subscribe({
      next: (data: any[]) => {
        this.players = data.map((user: any) => ({
          rank: user.rank,
          name: user.name,
          xp: user.xp,
          avatar: this.getRandomAvatar(), // Backend doesn't have an avatar field right now, generate randomly or use a default
          trend: 'same', // We don't have historical trend data yet
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

  filterPlayers() {
    let filtered = [...this.players];

    // search
    if (this.searchTerm) {
      filtered = filtered.filter(player =>
        player.name.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }

    // category filter
    if (this.selectedFilter === 'top10') {
      filtered = filtered.slice(0, 10);
    } else if (this.selectedFilter === 'rising') {
      filtered = filtered.filter(player => player.trend === 'up');
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