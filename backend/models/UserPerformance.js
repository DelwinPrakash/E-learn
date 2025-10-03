import { DataTypes } from "sequelize";
import sequelize from "../db.js";
import User from "./User.js";
import Topic from "./Topic.js";

const UserPerformance = sequelize.define("UserPerformance", {
  performance_id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: User, key: "user_id" },
  },
  topic_id: {
    type: DataTypes.UUID,
    references: { model: Topic, key: "topic_id" },
  },
  score: { type: DataTypes.DECIMAL(5, 2) },
  weak_areas: { type: DataTypes.JSONB },
  updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, {
  tableName: "user_performances",
  timestamps: false,
});

export default UserPerformance;
