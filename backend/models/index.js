import Flashcard from "./Flashcard.js";
import FlashcardDeck from "./FlashcardDeck.js";

// DEFINE ASSOCIATIONS HERE
FlashcardDeck.hasMany(Flashcard, {
  foreignKey: "deck_id"
});

Flashcard.belongsTo(FlashcardDeck, {
  foreignKey: "deck_id"
});

export {
  Flashcard,
  FlashcardDeck
};
