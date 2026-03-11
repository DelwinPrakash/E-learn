import { Flashcard, FlashcardDeck } from "../models/index.js";
import { sequelize } from "../config/db.js";


// GET ALL DECKS WITH CARD COUNT
const getDecks = async (req, res) => {
  try {
    const decks = await FlashcardDeck.findAll({
      include: [
        {
          model: Flashcard,
          attributes: [],
          required: false   // ✅ LEFT JOIN (CRITICAL)
        }
      ],
      attributes: [
        "deck_id",
        "name",
        "description",
        "category",
        [
          sequelize.fn("COUNT", sequelize.col("Flashcards.card_id")),
          "cardCount"
        ]
      ],
      group: [
        "FlashcardDeck.deck_id",
        "FlashcardDeck.name",
        "FlashcardDeck.description",
        "FlashcardDeck.category"
      ]
    });

    res.json(decks);
  } catch (error) {
    console.error("GET DECKS ERROR:", error);
    res.status(500).json({ message: "Server side error" });
  }
};

// GET CARDS FOR A SPECIFIC DECK
const getDeckCards = async (req, res) => {
  const { deckId } = req.params;

  try {
    const cards = await Flashcard.findAll({
      where: { deck_id: deckId },
      order: [["card_id", "ASC"]]
    });

    return res.json(cards);
  } catch (error) {
    console.error("GET DECK CARDS ERROR:", error);
    return res.status(500).json({ message: "Server side error" });
  }
};

export {
  getDecks,
  getDeckCards
};
