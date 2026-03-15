import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { QuizBattleService, Player } from '../../services/quiz-battle.service';

@Component({
  selector: 'app-score-board',
  templateUrl: './score-board.component.html',
  styleUrls: ['./score-board.component.css']
})
export class ScoreBoardComponent implements OnInit, OnDestroy {
  leaderboard: Player[] = [];
  private sub: Subscription | null = null;

  constructor(public quiz: QuizBattleService) {}

  ngOnInit(): void {
    this.sub = this.quiz.scores$.subscribe(() => {
      this.leaderboard = this.quiz.getLeaderboard();
    });
    // initial
    this.leaderboard = this.quiz.getLeaderboard();
  }

  ngOnDestroy(): void { if (this.sub) this.sub.unsubscribe(); }
}
