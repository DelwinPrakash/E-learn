import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import Topic from "./Topic.js";

const Quiz = sequelize.define("Quiz", {
  quiz_id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: { type: DataTypes.STRING(255) },
  type: { type: DataTypes.ENUM("solo", "duo"), allowNull: false },
  topic_id: { type: DataTypes.UUID, references: { model: Topic, key: "topic_id" } },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, {
  tableName: "quizzes",
  timestamps: false,
});

export default Quiz;
