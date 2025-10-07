import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import Quiz from "./Quiz.js";
import Question from "./Question.js";

const QuizQuestion = sequelize.define("QuizQuestion", {
  quiz_id: {
    type: DataTypes.UUID,
    references: { model: Quiz, key: "quiz_id" },
    primaryKey: true,
  },
  question_id: {
    type: DataTypes.UUID,
    references: { model: Question, key: "question_id" },
    primaryKey: true,
  },
}, {
  tableName: "quiz_questions",
  timestamps: false,
});

export default QuizQuestion;
