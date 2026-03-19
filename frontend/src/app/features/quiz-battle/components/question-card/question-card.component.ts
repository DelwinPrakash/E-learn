import { Component, OnInit } from '@angular/core';
import { QuizBattleService } from '../../services/quiz-battle.service';

@Component({
  selector: 'app-question-card',
  templateUrl: './question-card.component.html',
  styleUrls: ['./question-card.component.css']
})
export class QuestionCardComponent implements OnInit {
  constructor(public quiz: QuizBattleService) { }

  ngOnInit(): void { }

  submit() {
    this.quiz.submitAnswer();
  }
}
