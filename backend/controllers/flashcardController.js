import { Flashcard, FlashcardDeck } from "../models/index.js";
import { sequelize } from "../config/db.js";


// GET ALL DECKS WITH CARD COUNT
const getDecks = async (req, res) => {
  try {
    const decks = await FlashcardDeck.findAll({
      include: [
        {
          model: Flashcard,
          attributes: []
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
      group: ["FlashcardDeck.deck_id"]
    });

    return res.json(decks);
  } catch (error) {
    console.error("GET DECKS ERROR:", error);
    return res.status(500).json({ message: "Server side error" });
  }
};

// GET CARDS FOR A SPECIFIC DECK
const getDeckCards = async (req, res) => {
  const { deckId } = req.params;

  try {
    const cards = await Flashcard.findAll({
      where: { deck_id: deckId },
      order: [["created_at", "ASC"]]
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
