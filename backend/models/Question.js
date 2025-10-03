import { DataTypes } from "sequelize";
import sequelize from "../db.js";
import Topic from "./Topic.js";

const Question = sequelize.define("Question", {
  question_id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  topic_id: {
    type: DataTypes.UUID,
    references: { model: Topic, key: "topic_id" },
  },
  content: { type: DataTypes.JSONB, allowNull: false },
  difficulty_level: {
    type: DataTypes.ENUM("easy", "medium", "hard"),
  },
  generated_by_ai: { type: DataTypes.BOOLEAN, defaultValue: true },
}, {
  tableName: "questions",
  timestamps: false,
});

export default Question;
