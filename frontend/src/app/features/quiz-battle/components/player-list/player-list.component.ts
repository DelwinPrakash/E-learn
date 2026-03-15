import { Component } from '@angular/core';
import { QuizBattleService } from '../../services/quiz-battle.service';

@Component({
  selector: 'app-player-list',
  templateUrl: './player-list.component.html',
  styleUrls: ['./player-list.component.css']
})
export class PlayerListComponent {
  constructor(public quiz: QuizBattleService) {}
}
