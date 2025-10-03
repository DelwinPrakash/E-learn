import { DataTypes } from "sequelize";
import sequelize from "../db.js";
import User from "./User.js";
import Topic from "./Topic.js";

const Doubt = sequelize.define("Doubt", {
  doubt_id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.UUID,
    references: { model: User, key: "user_id" },
  },
  topic_id: {
    type: DataTypes.UUID,
    references: { model: Topic, key: "topic_id" },
  },
  query_text: { type: DataTypes.TEXT, allowNull: false },
  ai_response: { type: DataTypes.TEXT },
  human_response: { type: DataTypes.TEXT },
  resolved_at: { type: DataTypes.DATE },
  status: { type: DataTypes.ENUM("pending", "ai_resolved", "human_resolved") },
}, {
  tableName: "doubts",
  timestamps: false,
});

export default Doubt;
