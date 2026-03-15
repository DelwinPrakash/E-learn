import { Component } from '@angular/core';
import { QuizBattleService } from '../../services/quiz-battle.service';

@Component({
  selector: 'app-quiz-progress',
  templateUrl: './quiz-progress.component.html',
  styleUrls: ['./quiz-progress.component.css']
})
export class QuizProgressComponent {
  constructor(public quiz: QuizBattleService) {}
}
