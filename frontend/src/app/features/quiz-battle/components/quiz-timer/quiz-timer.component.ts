import { Component, OnDestroy, OnInit } from '@angular/core';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-quiz-timer',
  templateUrl: './quiz-timer.component.html',
  styleUrls: ['./quiz-timer.component.css']
})
export class QuizTimerComponent implements OnInit, OnDestroy {
  elapsed = 0;
  private sub: Subscription | null = null;

  ngOnInit(): void {
    this.start();
  }

  start() {
    this.stop();
    const start = Date.now();
    this.sub = interval(100).subscribe(() => {
      this.elapsed = (Date.now() - start) / 1000;
    });
  }

  stop() {
    if (this.sub) {
      this.sub.unsubscribe();
      this.sub = null;
    }
  }

  ngOnDestroy(): void {
    this.stop();
  }
}
