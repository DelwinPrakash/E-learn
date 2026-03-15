import { Component } from '@angular/core';
import { QuizBattleService } from '../../services/quiz-battle.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-result-board',
  templateUrl: './result-board.component.html',
  styleUrls: ['./result-board.component.css']
})
export class ResultBoardComponent {
  leaderboard = [] as any;

  constructor(public quiz: QuizBattleService, private router: Router) {
    this.leaderboard = this.quiz.getLeaderboard();
  }

  close() {
    this.router.navigate(['/dashboard']);
  }

  restart() {
    this.quiz.resetQuiz();
  }
}
