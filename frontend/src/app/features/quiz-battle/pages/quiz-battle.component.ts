import { Component, OnInit } from '@angular/core';
import { QuizBattleService } from '../services/quiz-battle.service';

@Component({
  selector: 'app-quiz-battle',
  templateUrl: './quiz-battle.component.html',
  styleUrls: ['./quiz-battle.component.css']
})
export class QuizBattleComponent implements OnInit {
  constructor(public quiz: QuizBattleService) {}

  ngOnInit(): void {
  }
}
