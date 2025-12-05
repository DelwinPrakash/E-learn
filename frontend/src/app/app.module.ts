import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms'; // Add this import
import { RouterModule } from '@angular/router';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { FlashcardComponent } from './flashcard/flashcard.component';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { LeaderboardComponent } from './leaderboard/leaderboard.component';
import { DiscussionfomrComponent } from './discussionforum/discussionforum.component';
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