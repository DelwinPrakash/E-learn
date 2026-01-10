import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const FlashcardProgress = sequelize.define(
  "FlashcardProgress",
  {
    progress_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    user_id: DataTypes.UUID,
    deck_id: DataTypes.UUID,
    card_id: DataTypes.UUID,
    is_correct: DataTypes.BOOLEAN
  },
  {
    tableName: "flashcard_progress",
    timestamps: false
  }
);

export default FlashcardProgress;
