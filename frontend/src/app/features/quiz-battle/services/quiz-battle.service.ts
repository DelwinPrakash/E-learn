import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { io, Socket } from 'socket.io-client';
import { AuthService } from 'src/app/core/auth/auth.service';

export interface Player {
  id: string;
  name: string;
  avatar: string;
  score: number;
  xp?: number;
}

export interface Question {
  id: number;
  text: string;
  options: string[];
  correctIndex: number;
}

type QuizStatus = 'waiting' | 'searching' | 'playing' | 'finished';

@Injectable({ providedIn: 'root' })
export class QuizBattleService implements OnDestroy {
  private socket: Socket | null = null;
  private backendUrl = environment.BACKEND_BASE_URL;

  private questionsSubject = new BehaviorSubject<Question[]>([]);
  questions$ = this.questionsSubject.asObservable();

  private playersSubject = new BehaviorSubject<Player[]>([]);
  players$ = this.playersSubject.asObservable();

  private statusSubject = new BehaviorSubject<QuizStatus>('waiting');
  status$ = this.statusSubject.asObservable();

  private gameModeSubject = new BehaviorSubject<'single' | 'multiplayer' | null>(null);
  gameMode$ = this.gameModeSubject.asObservable();

  private opponentStatusSubject = new BehaviorSubject<'waiting' | 'answered'>('waiting');
  opponentStatus$ = this.opponentStatusSubject.asObservable();

  public readonly QUESTION_TIMEOUT = 10;

  private countdownSubject = new BehaviorSubject<number>(this.QUESTION_TIMEOUT);
  countdown$ = this.countdownSubject.asObservable();

  private timer: any;

  private currentIndexSubject = new BehaviorSubject<number>(0);
  currentQuestionIndex$ = this.currentIndexSubject.asObservable();

  private selectedAnswerSubject = new BehaviorSubject<number | null>(null);
  selectedAnswer$ = this.selectedAnswerSubject.asObservable();

  private lockedSubject = new BehaviorSubject<boolean>(false);
  isLocked$ = this.lockedSubject.asObservable();

  private scoresSubject = new BehaviorSubject<Record<string, number>>({});
  scores$ = this.scoresSubject.asObservable();

  private selectedTopicSubject = new BehaviorSubject<string | null>(null);
  selectedTopic$ = this.selectedTopicSubject.asObservable();

  private timeTakenSubject = new BehaviorSubject<number>(0);
  timeTaken$ = this.timeTakenSubject.asObservable();

  private questionStart = 0;
  private currentUserId: string = '';
  private duoId: string = '';
  private winnerIdSubject = new BehaviorSubject<string | null>(null);
  winnerId$ = this.winnerIdSubject.asObservable();
  xpGained: number = 0;

  topics: any[] = [];

  constructor(private http: HttpClient, private authService: AuthService) {
    this.extractUserId();
    this.fetchTopics();
  }

  private extractUserId() {
    const user = this.authService.getUser();
    if (user) this.currentUserId = user.user_id;
  }

  private fetchTopics() {
    this.http.get<any[]>(`${this.backendUrl}/api/quiz/topics`).subscribe({
      next: (data) => {
        this.topics = data;
      },
      error: (err) => console.error('Error fetching topics', err)
    });
  }

  selectTopic(topicId: string) {
    this.selectedTopicSubject.next(topicId);
  }

  selectedTopicName(){
    return this.topics.find(topic => topic.id === this.selectedTopicSubject.value)?.name;
  }

  setGameMode(mode: 'single' | 'multiplayer') {
    this.gameModeSubject.next(mode);
  }

  startSearching() {
    const topicId = this.selectedTopicSubject.value;
    const mode = this.gameModeSubject.value;
    if (!topicId || !mode) return;

    if (mode === 'single') {
      this.statusSubject.next('searching');
      this.http.get<Question[]>(`${this.backendUrl}/api/quiz/questions?topicId=${topicId}`).subscribe({
        next: (questions) => {
          this.questionsSubject.next(questions);
          this.playersSubject.next([{ id: 'p1', name: 'You', avatar: '👤', score: 0 }]);
          this.statusSubject.next('playing');
          this.currentIndexSubject.next(0);
          this.scoresSubject.next({ 'p1': 0 });
          this.nextQuestionCycle();
        },
        error: (err) => {
          console.error(err);
          this.cancelMatchmaking();
        }
      });
    } else {
      this.statusSubject.next('searching');
      this.connectSocket();
      this.socket?.emit('join_queue', { userId: this.currentUserId, topicId });
    }
  }

  private connectSocket() {
    if (!this.socket) {
      this.socket = io(this.backendUrl);
      
      this.socket.on('match_found', (data: any) => {
        this.duoId = data.duoId;
        this.questionsSubject.next(data.questions);
        
        const myPlayer: Player = { id: 'p1', name: 'You', avatar: '👤', score: 0 };
        const oppPlayer: Player = { id: 'opp', name: data.opponent.name, avatar: '🤖', score: 0, xp: data.opponent.xp };
        this.playersSubject.next([myPlayer, oppPlayer]);
        
        this.statusSubject.next('playing');
        this.currentIndexSubject.next(0);
        this.scoresSubject.next({ 'p1': 0, 'opp': 0 });
        this.nextQuestionCycle();
      });

      this.socket.on('opponent_score_update', (data: any) => {
         if (data.userId !== this.currentUserId) {
           const currentScores = this.scoresSubject.value;
           this.scoresSubject.next({
             ...currentScores,
             'opp': (currentScores['opp'] || 0) + data.scoreDelta
           });
         }
      });

      this.socket.on('opponent_finished', () => {
         this.opponentStatusSubject.next('answered');
      });

      this.socket.on('battle_result', (data: any) => {
         this.winnerIdSubject.next(data.winnerId);
         const myData = data.players[this.currentUserId];
         if (myData) {
            this.xpGained = myData.xpGained;
         }
         this.finishQuiz(); 
      });
    }
  }

  nextQuestionCycle() {
    this.resetQuestionState();
    this.startCountdown();
  }

  resetQuestionState() {
    this.selectedAnswerSubject.next(null);
    this.lockedSubject.next(false);
    this.timeTakenSubject.next(0);
    this.countdownSubject.next(this.QUESTION_TIMEOUT);
    this.opponentStatusSubject.next('waiting');
    this.questionStart = Date.now();
  }

  startCountdown() {
    if (this.timer) clearInterval(this.timer);
    this.countdownSubject.next(this.QUESTION_TIMEOUT);
    this.timer = setInterval(() => {
      const current = this.countdownSubject.value;
      if (current > 0) {
        this.countdownSubject.next(current - 1);
      } else {
        if (!this.lockedSubject.value) {
          if (this.selectedAnswerSubject.value === null) {
            this.selectedAnswerSubject.next(-1);
          }
          this.submitAnswer();
        }
        clearInterval(this.timer);
      }
    }, 1000);
  }

  selectAnswer(index: number) {
    if (this.lockedSubject.value) return;
    this.selectedAnswerSubject.next(index);
  }

  submitAnswer() {
    const index = this.selectedAnswerSubject.value;
    if (this.lockedSubject.value || index === null) return;
    if (this.timer) clearInterval(this.timer);

    const endTime = Date.now();
    const elapsedMs = endTime - this.questionStart;
    const elapsedSeconds = Math.min(this.QUESTION_TIMEOUT, elapsedMs / 1000);
    this.timeTakenSubject.next(elapsedSeconds);
    this.lockedSubject.next(true);

    const q = this.questionsSubject.value[this.currentIndexSubject.value];
    if (!q) return;

    let scoreGain = 0;
    if (index === q.correctIndex) {
      // Correct: +100 base + up to +50 speed bonus
      const remainingTime = this.QUESTION_TIMEOUT - elapsedSeconds;
      scoreGain = 100 + Math.round(50 * Math.max(0, remainingTime / this.QUESTION_TIMEOUT));
    } else if (index === -1) {
      // Did Not Answer (Timeout) penalty
      scoreGain = -20;
    } else {
      // Incorrect Answer penalty
      scoreGain = -50;
    }

    const currentScores = this.scoresSubject.value;
    this.scoresSubject.next({
      ...currentScores,
      'p1': (currentScores['p1'] || 0) + scoreGain
    });

    if (this.gameModeSubject.value === 'multiplayer') {
      this.socket?.emit('submit_answer', { duoId: this.duoId, userId: this.currentUserId, scoreDelta: scoreGain });
    }

    // Move to next automatically after delay
    setTimeout(() => this.proceedToNext(), 1500);
  }

  proceedToNext() {
    const next = this.currentIndexSubject.value + 1;
    const total = this.questionsSubject.value.length;
    if (next >= total) {
      this.sendGameOver();
    } else {
      this.currentIndexSubject.next(next);
      this.nextQuestionCycle();
    }
  }

  sendGameOver() {
    const finalScore = this.scoresSubject.value['p1'] || 0;
    if (this.gameModeSubject.value === 'single') {
       this.http.post(`${this.backendUrl}/api/quiz/single-player-result`, {
          topicId: this.selectedTopicSubject.value,
          score: finalScore
       }).subscribe({
          next: (res: any) => {
             this.xpGained = res.xpGained || 0;
             this.finishQuiz();
          },
          error: (err) => {
             console.error('Error saving single player score', err);
             this.finishQuiz();
          }
       });
    } else {
       // Multiplayer - tell socket we're done
       this.socket?.emit('game_over', { duoId: this.duoId, userId: this.currentUserId, finalScore });
       this.opponentStatusSubject.next('waiting'); 
    }
  }

  finishQuiz() {
    this.statusSubject.next('finished');
    if (this.timer) clearInterval(this.timer);
  }

  cancelMatchmaking() {
    this.statusSubject.next('waiting');
    this.gameModeSubject.next(null);
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  resetQuiz() {
    this.statusSubject.next('waiting');
    this.selectedTopicSubject.next(null);
    this.gameModeSubject.next(null);
    this.currentIndexSubject.next(0);
    this.xpGained = 0;
    this.winnerIdSubject.next(null);
    this.resetQuestionState();
    if (this.timer) clearInterval(this.timer);
    
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getLeaderboard() {
    const scores = this.scoresSubject.value;
    const players = this.playersSubject.value.map(p => ({ ...p, score: scores[p.id] || 0 }));
    return players.sort((a, b) => b.score - a.score);
  }

  ngOnDestroy() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}
