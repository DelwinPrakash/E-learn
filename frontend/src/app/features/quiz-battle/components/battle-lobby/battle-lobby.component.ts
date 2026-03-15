import { Component } from '@angular/core';
import { QuizBattleService } from '../../services/quiz-battle.service';

@Component({
  selector: 'app-battle-lobby',
  templateUrl: './battle-lobby.component.html',
  styleUrls: ['./battle-lobby.component.css']
})
export class BattleLobbyComponent {
  constructor(public quiz: QuizBattleService) { }

  selectTopic(topicId: string) {
    this.quiz.selectTopic(topicId);
  }

  start() {
    this.quiz.startSearching();
  }
}
