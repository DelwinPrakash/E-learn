import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import Quiz from "./Quiz.js";
import User from "./User.js";
import Topic from "./Topic.js";

const QuizDuo = sequelize.define("QuizDuo", {
  duo_id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  quiz_id: {
    type: DataTypes.UUID,
    references: { model: Quiz, key: "quiz_id" },
  },
  player1_id: {
    type: DataTypes.UUID,
    references: { model: User, key: "user_id" },
  },
  player2_id: {
    type: DataTypes.UUID,
    references: { model: User, key: "user_id" },
  },
  topic_id: {
    type: DataTypes.UUID,
    references: { model: Topic, key: "topic_id" },
  },
  status: {
    type: DataTypes.ENUM("waiting", "active", "finished"),
    defaultValue: "waiting",
  },
  winner_id: {
    type: DataTypes.UUID,
    references: { model: User, key: "user_id" },
  },
  player1_score: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  player2_score: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  initiator_user_id: { // Keep this for backward compatibility or remove if replaced by player1_id
    type: DataTypes.UUID,
    references: { model: User, key: "user_id" },
  },
}, {
  tableName: "quiz_duo",
  timestamps: false,
});

export default QuizDuo;
