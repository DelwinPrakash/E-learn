import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import UserAuth from "./UserAuth.js";

const Chat = sequelize.define("Chat", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: UserAuth,
            key: "user_id",
        },
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    response: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
}, {
    tableName: "chats",
    timestamps: false,
});

export default Chat;
