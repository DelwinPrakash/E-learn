import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './features/dashboard/pages/dashboard.component';
import { FlashcardComponent } from './features/flashcard/pages/flashcard.component';
import { LoginComponent } from './features/auth/pages/login/login.component';
import { SignupComponent } from './features/auth/pages/signup/signup.component';
import { LeaderboardComponent } from './features/leaderboard/pages/leaderboard.component';
import { EmailverificationComponent } from './features/emailverification/pages/emailverification.component';
import { DiscussionfomrComponent } from './features/discussionforum/pages/discussionforum.component';
import { ChatbotComponent } from './features/chatbot/pages/chatbot.component';
import { authGuard } from './core/guard/auth.guard';

const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'verify-email', component: EmailverificationComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'flashcard', component: FlashcardComponent },
  { path: 'leaderboard', component: LeaderboardComponent },
  { path: 'chatbot', component: ChatbotComponent },
  { path: 'discussion-forum', component: DiscussionfomrComponent },
  { path: '**', redirectTo: '/dashboard' } // Wildcard route
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }