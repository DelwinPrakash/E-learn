import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const Flashcard = sequelize.define(
  "Flashcard",
  {
    card_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    deck_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    question: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    answer: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    difficulty: {
      type: DataTypes.ENUM("easy", "medium", "hard"),
      allowNull: false
    },
    category: {
      type: DataTypes.STRING
    }
  },
  {
    tableName: "flashcards",
    timestamps: false
  }
);

export default Flashcard;
