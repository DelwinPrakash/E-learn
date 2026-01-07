import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const FlashcardDeck = sequelize.define(
  "FlashcardDeck",
  {
    deck_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT
    },
    category: {
      type: DataTypes.STRING
    }
  },
  {
    tableName: "flashcard_decks",
    timestamps: false
  }
);

export default FlashcardDeck;
