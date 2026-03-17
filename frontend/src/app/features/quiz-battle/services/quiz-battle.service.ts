import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { AuthService, UserInfo } from '../../../core/auth/auth.service';
import { environment } from 'src/environments/environment.development';

export interface Player {
  id: string;
  name: string;
  avatar: string;
  score: number;
}

export interface Question {
  id: number;
  text: string;
  options: string[];
  correctIndex: number;
}

type QuizStatus = 'waiting' | 'searching' | 'playing' | 'finished';

@Injectable({ providedIn: 'root' })
export class QuizBattleService {
  private socket: Socket;

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

  private countdownSubject = new BehaviorSubject<number>(10);
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
  private currentDuoId: string | null = null;
  private currentUserId: string | null = null;

  topics = [
    { id: 'percentage', name: 'Percentage Calculations', icon: '📈' },
    { id: 'age', name: 'Age Problems', icon: '👴' },
    { id: 'ratio', name: 'Ratio & Proportion', icon: '⚖️' },
    { id: 'profit', name: 'Profit & Loss', icon: '💰' },
    { id: 'time', name: 'Time & Work', icon: '⏳' }
  ];

  constructor(private authService: AuthService) {
    this.socket = io(environment.BACKEND_BASE_URL || 'http://localhost:3000');
    this.setupSocketListeners();
    this.setupLocalPlayer();
  }

  private setupLocalPlayer() {
    const user = this.authService.getUser();
    if (user) {
      this.currentUserId = user.user_id;
      this.playersSubject.next([{ id: user.user_id, name: user.name, avatar: '', score: 0 }]);
    }
  }

  private setupSocketListeners() {
    this.socket.on('match_found', (data: any) => {
      this.currentDuoId = data.duoId;
      
      const p1 = this.playersSubject.getValue()[0];
      const p2 = {
        id: 'opp',
        name: data.opponent.name,
        avatar: '',
        score: 0
      };
      
      this.playersSubject.next([p1, p2]);
      
      if (data.questions && data.questions.length > 0) {
        this.questionsSubject.next(data.questions);
      } else {
        // Fallback to local questions if backend doesn't send them yet
        this.questionsSubject.next(this.getQuestionsByTopicFallback(this.selectedTopicSubject.value || ''));
      }

      this.statusSubject.next('playing');
      this.currentIndexSubject.next(0);
      this.scoresSubject.next({ [this.currentUserId || 'p1']: 0, 'opp': 0 });
      this.nextQuestionCycle();
    });

    this.socket.on('opponent_score_update', (data: any) => {
      // Data structure from backend: { userId, scoreDelta }
      if (data.userId !== this.currentUserId) {
         this.opponentStatusSubject.next('answered');
         const currentScores = this.scoresSubject.value;
         this.scoresSubject.next({
           ...currentScores,
           'opp': (currentScores['opp'] || 0) + data.scoreDelta
         });
      }
    });

    this.socket.on('error', (err: any) => {
      console.error('Socket error:', err);
      this.cancelMatchmaking();
    });
  }

  getQuestionsByTopicFallback(topicId: string): Question[] {
    const questionBank: Record<string, Question[]> = {
      percentage: [
        { id: 1, text: 'If 20% of a number is 120, then 120% of that number will be:', options: ['20', '120', '480', '720'], correctIndex: 3 },
        { id: 2, text: 'A student has to obtain 33% of the total marks to pass. He got 125 marks and failed by 40 marks. The maximum marks are:', options: ['300', '500', '800', '1000'], correctIndex: 1 },
        { id: 3, text: 'What is 25% of 25% of 100?', options: ['6.25', '0.625', '62.5', '25'], correctIndex: 0 },
        { id: 4, text: 'If the price of a commodity is increased by 50%, by what fraction must its consumption be reduced so as to keep the same expenditure?', options: ['1/4', '1/3', '1/2', '2/3'], correctIndex: 1 },
        { id: 5, text: '30% of 28% of 480 is same as:', options: ['15% of 56% of 480', '60% of 28% of 240', 'Both are correct', 'None of these'], correctIndex: 2 }
      ],
      age: [
        { id: 1, text: "Father is four times the age of his son. In 20 years, he will be twice as old as his son. Find the father's present age.", options: ['40', '32', '36', '48'], correctIndex: 0 },
        { id: 2, text: 'The ratio of ages of A and B is 3:4. The sum of their ages is 28 years. The ratio of their ages after 4 years will be:', options: ['4:3', '3:4', '4:5', '7:9'], correctIndex: 2 },
        { id: 3, text: "A's age is 1/6 of B's age. B's age will be twice of C's age after 10 years. If C's eighth birthday was celebrated two years ago, then the age of A is:", options: ['5 years', '10 years', '15 years', '20 years'], correctIndex: 0 },
        { id: 4, text: 'Present ages of Sameer and Anand are in the ratio of 5 : 4 respectively. Three years hence, the ratio of their ages will become 11 : 9 respectively. What is Anand\'s present age in years?', options: ['24', '27', '40', 'Cannot be determined'], correctIndex: 0 },
        { id: 5, text: 'The sum of the ages of a father and his son is 45 years. Five years ago, the product of their ages was 34. The ages of the son and the father are respectively:', options: ['6 and 39', '7 and 38', '9 and 36', '11 and 34'], correctIndex: 0 }
      ],
      ratio: [
        { id: 1, text: 'If A:B = 2:3 and B:C = 4:5, then A:B:C is:', options: ['8:12:15', '2:3:5', '8:10:15', '12:8:15'], correctIndex: 0 },
        { id: 2, text: 'Two numbers are in the ratio 3 : 5. If 9 is subtracted from each, the new numbers are in the ratio 12 : 23. The smaller number is:', options: ['27', '33', '49', '55'], correctIndex: 1 },
        { id: 3, text: 'If 40% of a number is equal to two-third of another number, what is the ratio of first number to the second number?', options: ['2:5', '3:7', '5:3', '7:3'], correctIndex: 2 },
        { id: 4, text: 'The salaries of A, B, and C are in the ratio 2 : 3 : 5. If the increments of 15%, 10% and 20% are allowed respectively in their salaries, then what will be the new ratio of their salaries?', options: ['3:3:10', '10:11:20', '23:33:60', 'None of these'], correctIndex: 2 },
        { id: 5, text: 'A sum of money is to be distributed among A, B, C, D in the proportion of 5 : 2 : 4 : 3. If C gets Rs. 1000 more than D, what is B\'s share?', options: ['Rs. 500', 'Rs. 1500', 'Rs. 2000', 'None of these'], correctIndex: 2 }
      ],
      profit: [
        { id: 1, text: 'A person incurs 5% loss by selling a watch for Rs. 1140. At what price should the watch be sold to earn 5% profit?', options: ['Rs. 1200', 'Rs. 1230', 'Rs. 1260', 'Rs. 1290'], correctIndex: 2 },
        { id: 2, text: 'A shopkeeper sells some articles at Rs. 10 each and makes a profit of 25%. If he sells them at Rs. 8 each, what will be his profit or loss percentage?', options: ['5% profit', 'No profit no loss', '5% loss', '10% loss'], correctIndex: 1 },
        { id: 3, text: 'The cost price of 20 articles is the same as the selling price of x articles. If the profit is 25%, then the value of x is:', options: ['15', '16', '18', '25'], correctIndex: 1 },
        { id: 4, text: 'If a man were to sell his chair for Rs. 720, he would lose 25%, to gain 25% he should sell it for:', options: ['Rs. 1200', 'Rs. 1000', 'Rs. 960', 'Rs. 900'], correctIndex: 0 },
        { id: 5, text: 'A vendor bought toffees at 6 for a rupee. How many for a rupee must he sell to gain 20%?', options: ['3', '4', '5', '6'], correctIndex: 2 }
      ],
      time: [
        { id: 1, text: 'A can do a work in 15 days and B in 20 days. If they work on it together for 4 days, then the fraction of the work that is left is:', options: ['1/4', '1/10', '7/15', '8/15'], correctIndex: 3 },
        { id: 2, text: 'A and B together can complete a piece of work in 4 days. If A alone can complete the same work in 12 days, in how many days can B alone complete that work?', options: ['4 days', '5 days', '6 days', '7 days'], correctIndex: 2 },
        { id: 3, text: 'If 6 men and 8 boys can do a piece of work in 10 days while 26 men and 48 boys can do the same in 2 days, the time taken by 15 men and 20 boys in doing the same type of work will be:', options: ['4 days', '5 days', '6 days', '7 days'], correctIndex: 0 },
        { id: 4, text: 'A can do a piece of work in 80 days. He works at it for 10 days and then B alone finishes the remaining work in 42 days. In how much time will A and B working together, finish the work?', options: ['30 days', '25 days', '20 days', '40 days'], correctIndex: 0 },
        { id: 5, text: '4 men and 6 women can complete a work in 8 days, while 3 men and 7 women can complete it in 10 days. In how many days will 10 women complete it?', options: ['35', '40', '45', '50'], correctIndex: 1 }
      ]
    };
    return (questionBank[topicId] || []).slice(0, 5);
  }

  selectTopic(topicId: string) {
    this.selectedTopicSubject.next(topicId);
  }

  setGameMode(mode: 'single' | 'multiplayer') {
    this.gameModeSubject.next(mode);
  }

  startSearching() {
    this.setupLocalPlayer(); // Refresh in case they just logged in
    if (!this.selectedTopicSubject.value || !this.gameModeSubject.value) return;

    if (this.gameModeSubject.value === 'single') {
      this.questionsSubject.next(this.getQuestionsByTopicFallback(this.selectedTopicSubject.value));
      this.statusSubject.next('playing');
      this.currentIndexSubject.next(0);
      this.scoresSubject.next({ [this.currentUserId || 'p1']: 0 });
      this.nextQuestionCycle();
    } else {
      if (!this.currentUserId) {
        console.error('Cannot join queue: UserId not found');
        return;
      }
      this.statusSubject.next('searching');
      this.socket.emit('join_queue', {
        userId: this.currentUserId,
        topicId: this.selectedTopicSubject.value
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
    this.countdownSubject.next(10);
    this.opponentStatusSubject.next('waiting');
    this.questionStart = Date.now();
  }

  startCountdown() {
    if (this.timer) clearInterval(this.timer);
    this.countdownSubject.next(10);
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
    const elapsedSeconds = Math.min(10, elapsedMs / 1000);
    this.timeTakenSubject.next(elapsedSeconds);
    this.lockedSubject.next(true);

    const q = this.questionsSubject.value[this.currentIndexSubject.value];
    let scoreGain = 0;
    
    // Fallback: If no correctIndex (e.g. dynamic backend questions pending map) defaults to 0 internally or matching text
    // Assuming backend questions have a correctIndex mapped.
    if (q && index === q.correctIndex) {
      scoreGain = Math.round(100 - (elapsedSeconds * 5));
      const currentScores = this.scoresSubject.value;
      this.scoresSubject.next({
        ...currentScores,
        [this.currentUserId || 'p1']: (currentScores[this.currentUserId || 'p1'] || 0) + scoreGain
      });
    }

    if (this.gameModeSubject.value === 'multiplayer' && this.currentDuoId && this.currentUserId) {
      this.socket.emit('submit_answer', {
        duoId: this.currentDuoId,
        userId: this.currentUserId,
        scoreDelta: scoreGain
      });
      setTimeout(() => this.checkAndMoveToNext(), 1500);
    } else {
      setTimeout(() => this.proceedToNext(), 1500);
    }
  }

  checkAndMoveToNext() {
    if (this.opponentStatusSubject.value === 'answered') {
      this.proceedToNext();
    } else {
      const checkInterval = setInterval(() => {
        if (this.opponentStatusSubject.value === 'answered' || this.countdownSubject.value <= 0) {
          clearInterval(checkInterval);
          this.proceedToNext();
        }
      }, 500);
    }
  }

  proceedToNext() {
    const next = this.currentIndexSubject.value + 1;
    if (next >= this.questionsSubject.value.length) {
      this.finishQuiz();
      return;
    }
    this.currentIndexSubject.next(next);
    this.nextQuestionCycle();
  }

  finishQuiz() {
    this.statusSubject.next('finished');
    if (this.timer) clearInterval(this.timer);

    if (this.gameModeSubject.value === 'multiplayer' && this.currentDuoId) {
      this.socket.emit('game_over', {
        duoId: this.currentDuoId,
        scores: this.scoresSubject.value
      });
    }
  }

  cancelMatchmaking() {
    this.statusSubject.next('waiting');
    this.gameModeSubject.next(null);
  }

  resetQuiz() {
    this.statusSubject.next('waiting');
    this.selectedTopicSubject.next(null);
    this.gameModeSubject.next(null);
    this.currentIndexSubject.next(0);
    this.currentDuoId = null;
    this.questionsSubject.next([]);
    this.resetQuestionState();
    if (this.timer) clearInterval(this.timer);
  }

  nextQuestion() {
    this.proceedToNext();
  }

  getLeaderboard() {
    const scores = this.scoresSubject.value;
    const players = this.playersSubject.value.map(p => ({ ...p, score: scores[p.id] || 0 }));
    return players.sort((a, b) => b.score - a.score);
  }
}
