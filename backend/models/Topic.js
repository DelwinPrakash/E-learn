import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import Course from "./Course.js";

const Topic = sequelize.define("Topic", {
  topic_id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  course_id: {
    type: DataTypes.UUID,
    references: { model: Course, key: "course_id" },
  },
  name: { type: DataTypes.STRING(255), allowNull: false },
  content: { type: DataTypes.TEXT },
  difficulty_level: {
    type: DataTypes.ENUM("easy", "medium", "hard"),
  },
}, {
  tableName: "topics",
  timestamps: false,
});

export default Topic;
