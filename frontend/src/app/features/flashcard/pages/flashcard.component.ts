import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FlashcardService } from '../../../services/flashcard.service';

@Component({
  selector: 'app-flashcard',
  templateUrl: './flashcard.component.html',
  styleUrls: ['./flashcard.component.css']
})
export class FlashcardComponent implements OnInit {

  // Views
  view: 'decks' | 'study' | 'review' = 'decks';

  // Decks
  decks: any[] = [];
  selectedDeck: any = null;

  // Cards
  cards: any[] = [];
  filteredCards: any[] = [];
  currentCardIndex = 0;
  isCardFlipped = false;

  // Stats
  correctAnswers = 0;
  wrongAnswers = 0;
  studyProgress = 0;

  // Filters
  searchTerm = '';
  selectedDifficulty = 'all';
  selectedCategory = 'all';

  constructor(
    private flashcardService: FlashcardService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadDecks();
  }

  /* =====================
     BACKEND INTEGRATION
     ===================== */

  loadDecks(): void {
    this.flashcardService.getDecks().subscribe({
      next: (data) => this.decks = data,
      error: (err) => console.error(err)
    });
  }

  loadDeck(deck: any): void {
    this.selectedDeck = deck;
    this.view = 'study';
    this.resetProgress();

    this.flashcardService.getDeckCards(deck.deck_id).subscribe({
      next: (data) => {
        this.cards = data;
        this.filteredCards = [...data];
        this.currentCardIndex = 0;
        this.updateProgress();
      },
      error: (err) => console.error(err)
    });
  }

  /* =====================
     CARD LOGIC
     ===================== */

  getCurrentCard() {
    return this.filteredCards[this.currentCardIndex] || null;
  }

  toggleFlip(): void {
    this.isCardFlipped = !this.isCardFlipped;
  }

  markCorrect(): void {
    this.correctAnswers++;
    this.moveToNextCard();
  }

  markWrong(): void {
    this.wrongAnswers++;
    this.moveToNextCard();
  }

  moveToNextCard(): void {
    this.isCardFlipped = false;

    if (this.currentCardIndex < this.filteredCards.length - 1) {
      this.currentCardIndex++;
      this.updateProgress();
    } else {
      this.finishStudySession();
    }
  }

  moveToPreviousCard(): void {
    if (this.currentCardIndex > 0) {
      this.currentCardIndex--;
      this.updateProgress();
    }
  }

  /* =====================
     FILTERS
     ===================== */

  filterCards(): void {
    this.filteredCards = this.cards.filter(card => {
      const matchesDifficulty =
        this.selectedDifficulty === 'all' ||
        card.difficulty === this.selectedDifficulty;

      const matchesCategory =
        this.selectedCategory === 'all' ||
        card.category === this.selectedCategory;

      const matchesSearch =
        card.question.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        card.answer.toLowerCase().includes(this.searchTerm.toLowerCase());

      return matchesDifficulty && matchesCategory && matchesSearch;
    });

    this.currentCardIndex = 0;
    this.updateProgress();
  }

  getCategories(): string[] {
    return Array.from(new Set(this.cards.map(c => c.category)));
  }

  /* =====================
     PROGRESS & REVIEW
     ===================== */

  updateProgress(): void {
    const total = this.filteredCards.length;
    const current = this.currentCardIndex + 1;
    this.studyProgress = total ? (current / total) * 100 : 0;
  }

  resetProgress(): void {
    this.correctAnswers = 0;
    this.wrongAnswers = 0;
    this.studyProgress = 0;
    this.isCardFlipped = false;
  }

  finishStudySession(): void {
    this.view = 'review';
  }

  getAccuracy(): number {
    const total = this.correctAnswers + this.wrongAnswers;
    return total ? Math.round((this.correctAnswers / total) * 100) : 0;
  }

  retryDeck(): void {
    if (this.selectedDeck) {
      this.loadDeck(this.selectedDeck);
    }
  }

  backToDecks(): void {
    this.view = 'decks';
    this.selectedDeck = null;
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }
}
