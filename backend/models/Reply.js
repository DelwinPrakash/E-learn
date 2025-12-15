import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import User from "./User.js";
import Thread from "./Thread.js";

const Reply = sequelize.define("Reply", {
    reply_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    thread_id: {
        type: DataTypes.UUID,
        references: { model: Thread, key: "thread_id" },
        onDelete: 'CASCADE',
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    author_id: {
        type: DataTypes.UUID,
        references: { model: User, key: "user_id" },
    },
    likes: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
}, {
    tableName: "replies",
    timestamps: false,
});

export default Reply;
