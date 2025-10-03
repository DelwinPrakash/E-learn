import { DataTypes } from "sequelize";
import sequelize from "../db.js";
import Quiz from "./Quiz.js";
import User from "./User.js";

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
  initiator_user_id: {
    type: DataTypes.UUID,
    references: { model: User, key: "user_id" },
  },
}, {
  tableName: "quiz_duo",
  timestamps: false,
});

export default QuizDuo;
