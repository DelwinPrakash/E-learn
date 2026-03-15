import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { QuizBattleService } from '../../services/quiz-battle.service';

@Component({
  selector: 'app-answer-options',
  templateUrl: './answer-options.component.html',
  styleUrls: ['./answer-options.component.css']
})
export class AnswerOptionsComponent implements OnInit, OnDestroy {
  @Input() options: string[] = [];
  @Input() correctIndex: number | null = null;

  selected: number | null = null;
  locked = false;

  private subs: Subscription[] = [];

  constructor(private quiz: QuizBattleService) { }

  ngOnInit(): void {
    this.subs.push(this.quiz.isLocked$.subscribe(v => this.locked = v));
    this.subs.push(this.quiz.selectedAnswer$.subscribe(s => this.selected = s));
  }

  pick(i: number) {
    if (this.locked) return;
    this.selected = i;
    this.quiz.selectAnswer(i);
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }
}
