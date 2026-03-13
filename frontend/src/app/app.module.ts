import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DashboardComponent } from './features/dashboard/pages/dashboard.component';
import { FlashcardComponent } from './features/flashcard/pages/flashcard.component';
import { LoginComponent } from './features/auth/pages/login/login.component';
import { SignupComponent } from './features/auth/pages/signup/signup.component';
import { LeaderboardComponent } from './features/leaderboard/pages/leaderboard.component';
import { DiscussionfomrComponent } from './features/discussionforum/pages/discussionforum.component';
import { ChatbotComponent } from './features/chatbot/pages/chatbot.component';
import { MainLayoutComponent } from './core/layout/main-layout/main-layout.component';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { MarkdownModule } from 'ngx-markdown';
import { VideoToTextComponent } from './features/video-to-text/pages/video-to-text.component';
import { ProfileComponent } from './features/profile/profile.component';
import { TeacherUploadComponent } from './features/upload-video-for-teachers/pages/upload.component';
import { TeacherNotesUploadComponent } from './features/upload-notes-for-teachers/pages/notes-upload.component';
import { VideoClassComponent } from './features/video-class/pages/video-class.component';
import { AuthHeaderInterceptor } from './core/interceptor/auth-header.interceptor';
import { ReactiveFormsModule } from '@angular/forms';
import { SchedulerComponent } from './features/microlearning-scheduler/pages/scheduler.component';
import { QuizBattleComponent } from './features/quiz-battle/pages/quiz-battle.component';
import { BattleLobbyComponent } from './features/quiz-battle/components/battle-lobby/battle-lobby.component';
import { QuestionCardComponent } from './features/quiz-battle/components/question-card/question-card.component';
import { AnswerOptionsComponent } from './features/quiz-battle/components/answer-options/answer-options.component';
import { QuizTimerComponent } from './features/quiz-battle/components/quiz-timer/quiz-timer.component';
import { ScoreBoardComponent } from './features/quiz-battle/components/score-board/score-board.component';
import { PlayerListComponent } from './features/quiz-battle/components/player-list/player-list.component';
import { QuizProgressComponent } from './features/quiz-battle/components/quiz-progress/quiz-progress.component';
import { ResultBoardComponent } from './features/quiz-battle/components/result-board/result-board.component';

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    FlashcardComponent,
    LoginComponent,
    SignupComponent,
    LeaderboardComponent,
    DiscussionfomrComponent,
    ChatbotComponent,
    VideoToTextComponent,
    ProfileComponent,
    TeacherUploadComponent,
    TeacherNotesUploadComponent,
    VideoClassComponent,
    MainLayoutComponent,
    SchedulerComponent,
    QuizBattleComponent,
    BattleLobbyComponent,
    QuestionCardComponent,
    AnswerOptionsComponent,
    QuizTimerComponent,
    PlayerListComponent,
    ScoreBoardComponent,
    QuizProgressComponent,
    ResultBoardComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,    
    RouterModule,
    AppRoutingModule,
    ReactiveFormsModule,
    MarkdownModule.forRoot()
  ],
  providers: [{
    provide: HTTP_INTERCEPTORS,
    useClass: AuthHeaderInterceptor,
    multi: true
  }],
  bootstrap: [AppComponent]
})
export class AppModule { }