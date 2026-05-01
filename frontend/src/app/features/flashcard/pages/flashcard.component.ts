import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FlashcardService } from '../services/flashcard.service';

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
  easyCount = 0;
  mediumCount = 0;
  hardCount = 0;
  studyProgress = 0;

  // Filters
  searchTerm = '';
  selectedDifficulty = 'all';
  selectedCategory = 'all';

  constructor(
    private flashcardService: FlashcardService,
    private router: Router
  ) { }

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

  markAnswer(rating: 'easy' | 'medium' | 'hard'): void {
    if (rating === 'easy') this.easyCount++;
    else if (rating === 'medium') this.mediumCount++;
    else if (rating === 'hard') this.hardCount++;

    this.isCardFlipped = false;

    if (this.currentCardIndex < this.filteredCards.length - 1) {
      this.reorderNextCard(rating);
      this.currentCardIndex++;
      this.updateProgress();
    } else {
      this.finishStudySession();
    }
  }

  reorderNextCard(lastRating: string): void {
    const nextIdx = this.currentCardIndex + 1;
    let targetDifficulties: string[] = [];
    
    if (lastRating === 'easy') targetDifficulties = ['medium', 'hard'];
    else if (lastRating === 'medium') targetDifficulties = ['easy', 'hard'];
    else if (lastRating === 'hard') targetDifficulties = ['easy', 'medium'];

    let foundIdx = -1;
    for (let i = nextIdx; i < this.filteredCards.length; i++) {
      const cardDiff = this.filteredCards[i].difficulty || 'easy';
      if (targetDifficulties.includes(cardDiff)) {
        foundIdx = i;
        break;
      }
    }

    if (foundIdx !== -1 && foundIdx !== nextIdx) {
      const temp = this.filteredCards[nextIdx];
      this.filteredCards[nextIdx] = this.filteredCards[foundIdx];
      this.filteredCards[foundIdx] = temp;
    }
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
    this.easyCount = 0;
    this.mediumCount = 0;
    this.hardCount = 0;
    this.studyProgress = 0;
    this.isCardFlipped = false;
  }

  finishStudySession(): void {
    this.view = 'review';
  }

  getMastery(): number {
    const total = this.easyCount + this.mediumCount + this.hardCount;
    if (!total) return 0;
    const score = (this.easyCount * 1) + (this.mediumCount * 0.5);
    return Math.round((score / total) * 100);
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
