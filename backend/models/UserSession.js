import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import UserAuth from "./UserAuth.js";

const UserSession = sequelize.define("UserSession", {
  session_id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: UserAuth, key: "user_id" },
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: "user_session",
  timestamps: false,
});

export default UserSession;
