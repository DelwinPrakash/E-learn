import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms'; // Add this import
import { RouterModule } from '@angular/router';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DashboardComponent } from './features/dashboard/pages/dashboard.component';
import { FlashcardComponent } from './features/flashcard/pages/flashcard.component';
import { LoginComponent } from './features/auth/pages/login/login.component';
import { SignupComponent } from './features/auth/pages/signup/signup.component';
import { LeaderboardComponent } from './features/leaderboard/pages/leaderboard.component';
import { DiscussionfomrComponent } from './features/discussionforum/pages/discussionforum.component';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    FlashcardComponent,
    LoginComponent,
    SignupComponent,
    LeaderboardComponent,
    DiscussionfomrComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule, // Add FormsModule here
    RouterModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }