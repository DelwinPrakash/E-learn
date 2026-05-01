import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import User from "./User.js";
import QuizDuo from "./QuizDuo.js";

const PlayerQuizData = sequelize.define("PlayerQuizData", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  duo_id: {
    type: DataTypes.UUID,
    references: { model: QuizDuo, key: "duo_id" },
  },
  user_id: {
    type: DataTypes.UUID,
    references: { model: User, key: "user_id" },
  },
  score: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  xp_gained: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  is_winner: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  }
}, {
  tableName: "player_quiz_data",
  timestamps: true,
});

export default PlayerQuizData;
