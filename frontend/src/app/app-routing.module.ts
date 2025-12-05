import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { FlashcardComponent } from './flashcard/flashcard.component';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { LeaderboardComponent } from './leaderboard/leaderboard.component';
import { EmailverificationComponent } from './emailverification/emailverification.component';
import { DiscussionfomrComponent } from './discussionforum/discussionforum.component';
import { authGuard } from './guard/auth.guard';

const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'verify-email', component: EmailverificationComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'flashcard', component: FlashcardComponent },
  { path: 'leaderboard', component: LeaderboardComponent },
  { path: 'discussion-forum', component: DiscussionfomrComponent },
  { path: '**', redirectTo: '/dashboard' } // Wildcard route
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }