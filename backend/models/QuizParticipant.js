import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import QuizDuo from "./QuizDuo.js";
import User from "./User.js";

const QuizParticipant = sequelize.define("QuizParticipant", {
  duo_id: {
    type: DataTypes.UUID,
    references: { model: QuizDuo, key: "duo_id" },
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.UUID,
    references: { model: User, key: "user_id" },
    primaryKey: true,
  },
}, {
  tableName: "quiz_participants",
  timestamps: false,
});

export default QuizParticipant;
