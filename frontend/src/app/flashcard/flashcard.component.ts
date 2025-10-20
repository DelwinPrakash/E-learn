import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

interface Flashcard {
  id: number;
  question: string;
  answer: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  isAnswered: boolean;
}

interface Deck {
  id: number;
  name: string;
  description: string;
  cardCount: number;
  category: string;
}

@Component({
  selector: 'app-flashcard',
  templateUrl: './flashcard.component.html',
  styleUrls: ['./flashcard.component.css']
})
export class FlashcardComponent implements OnInit {
  // Views
  view: 'decks' | 'study' | 'review' = 'decks';
  
  // Decks
  decks: Deck[] = [];
  selectedDeck: Deck | null = null;
  
  // Flashcards
  cards: Flashcard[] = [];
  currentCardIndex: number = 0;
  isCardFlipped: boolean = false;
  
  // Stats
  correctAnswers: number = 0;
  wrongAnswers: number = 0;
  studyProgress: number = 0;
  
  // Filters
  selectedDifficulty: string = 'all';
  selectedCategory: string = 'all';
  searchTerm: string = '';
  filteredCards: Flashcard[] = [];

  constructor(private router: Router) {}

  ngOnInit() {
    this.loadDecks();
  }

  // Load mock decks
  loadDecks() {
    this.decks = [
      {
        id: 1,
        name: 'Spanish Vocabulary',
        description: 'Learn common Spanish words and phrases',
        cardCount: 45,
        category: 'Language'
      },
      {
        id: 2,
        name: 'Biology Basics',
        description: 'Fundamental concepts in biology',
        cardCount: 38,
        category: 'Science'
      },
      {
        id: 3,
        name: 'World Capitals',
        description: 'Capital cities around the world',
        cardCount: 52,
        category: 'Geography'
      },
      {
        id: 4,
        name: 'Math Formulas',
        description: 'Essential mathematical formulas',
        cardCount: 30,
        category: 'Mathematics'
      },
      {
        id: 5,
        name: 'History Events',
        description: 'Important historical events',
        cardCount: 42,
        category: 'History'
      }
    ];
  }

  // Load flashcards for a deck
  loadDeck(deck: Deck) {
    this.selectedDeck = deck;
    this.view = 'study';
    this.generateCards();
    this.resetProgress();
  }

  // Generate mock cards
  generateCards() {
    const mockCards: Flashcard[] = [
      {
        id: 1,
        question: 'What is the capital of Spain?',
        answer: 'Madrid',
        difficulty: 'easy',
        category: 'Geography',
        isAnswered: false
      },
      {
        id: 2,
        question: 'What is the process by which plants make food?',
        answer: 'Photosynthesis',
        difficulty: 'medium',
        category: 'Science',
        isAnswered: false
      },
      {
        id: 3,
        question: 'How do you say "hello" in Spanish?',
        answer: 'Hola',
        difficulty: 'easy',
        category: 'Language',
        isAnswered: false
      },
      {
        id: 4,
        question: 'What is the formula for calculating distance?',
        answer: 'Distance = Speed × Time',
        difficulty: 'hard',
        category: 'Mathematics',
        isAnswered: false
      },
      {
        id: 5,
        question: 'In what year did World War II end?',
        answer: '1945',
        difficulty: 'medium',
        category: 'History',
        isAnswered: false
      },
      {
        id: 6,
        question: 'What is the largest planet in our solar system?',
        answer: 'Jupiter',
        difficulty: 'easy',
        category: 'Science',
        isAnswered: false
      },
      {
        id: 7,
        question: 'What is the chemical symbol for Gold?',
        answer: 'Au',
        difficulty: 'hard',
        category: 'Science',
        isAnswered: false
      },
      {
        id: 8,
        question: 'How do you say "goodbye" in Spanish?',
        answer: 'Adiós',
        difficulty: 'easy',
        category: 'Language',
        isAnswered: false
      }
    ];

    this.cards = mockCards;
    this.filteredCards = [...this.cards];
    this.currentCardIndex = 0;
    this.isCardFlipped = false;
  }

  // Get current card
  getCurrentCard(): Flashcard | null {
    return this.filteredCards[this.currentCardIndex] || null;
  }

  // Flip card
  toggleFlip() {
    this.isCardFlipped = !this.isCardFlipped;
  }

  // Mark answer
  markCorrect() {
    const card = this.getCurrentCard();
    if (card) {
      card.isAnswered = true;
      this.correctAnswers++;
      this.moveToNextCard();
    }
  }

  markWrong() {
    const card = this.getCurrentCard();
    if (card) {
      card.isAnswered = true;
      this.wrongAnswers++;
      this.moveToNextCard();
    }
  }

  // Navigate cards
  moveToNextCard() {
    if (this.currentCardIndex < this.filteredCards.length - 1) {
      this.currentCardIndex++;
      this.isCardFlipped = false;
      this.updateProgress();
    } else {
      this.finishStudySession();
    }
  }

  moveToPreviousCard() {
    if (this.currentCardIndex > 0) {
      this.currentCardIndex--;
      this.isCardFlipped = false;
      this.updateProgress();
    }
  }

  // Filter cards
  filterCards() {
    this.filteredCards = this.cards.filter(card => {
      const difficultyMatch = 
        this.selectedDifficulty === 'all' || card.difficulty === this.selectedDifficulty;
      const categoryMatch = 
        this.selectedCategory === 'all' || card.category === this.selectedCategory;
      const searchMatch = 
        card.question.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        card.answer.toLowerCase().includes(this.searchTerm.toLowerCase());

      return difficultyMatch && categoryMatch && searchMatch;
    });

    this.currentCardIndex = 0;
    this.isCardFlipped = false;
    this.updateProgress();
  }

  // Update progress
  updateProgress() {
    const total = this.filteredCards.length;
    const current = this.currentCardIndex + 1;
    this.studyProgress = (current / total) * 100;
  }

  // Reset progress
  resetProgress() {
    this.correctAnswers = 0;
    this.wrongAnswers = 0;
    this.studyProgress = 0;
    this.updateProgress();
  }

  // Finish study session
  finishStudySession() {
    this.view = 'review';
  }

  // Get stats
  getAccuracy(): number {
    const total = this.correctAnswers + this.wrongAnswers;
    return total > 0 ? Math.round((this.correctAnswers / total) * 100) : 0;
  }

  // Go back to decks
  backToDecks() {
    this.view = 'decks';
    this.selectedDeck = null;
    this.correctAnswers = 0;
    this.wrongAnswers = 0;
  }

  // Retry deck
  retryDeck() {
    if (this.selectedDeck) {
      this.loadDeck(this.selectedDeck);
    }
  }

  // Go to dashboard
  goToDashboard() {
    this.router.navigate(['/dashboard']);
  }

  // Get unique categories
  getCategories(): string[] {
    const categories = new Set(this.cards.map(card => card.category));
    return Array.from(categories);
  }
}