import { Server } from "socket.io";
import QuizDuo from "../models/QuizDuo.js";
import User from "../models/User.js";
import Question from "../models/Question.js";
import { sequelize } from "../config/db.js";

const queues = {};
const activeMatches = {};

export const setupSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: "*", 
            methods: ["GET", "POST"],
        },
    });

    io.on("connection", (socket) => {
        console.log(`User connected: ${socket.id}`);

        // User joins matchmaking queue
        socket.on("join_queue", async ({ userId, topicId }) => {
            try {
                const user = await User.findByPk(userId);
                if (!user) {
                    socket.emit("error", { message: "User not found" });
                    return;
                }

                if (!queues[topicId]) {
                    queues[topicId] = [];
                }

                const existingIndex = queues[topicId].findIndex(p => p.userId === userId);
                if (existingIndex !== -1) {
                    queues[topicId][existingIndex].socketId = socket.id;
                } else {
                    queues[topicId].push({ socketId: socket.id, userId, xp: user.xp || 0, name: user.name });
                }

                socket.join(topicId);
                console.log(`User ${user.name} joined queue for topic ${topicId}`);

                matchMake(io, topicId);
            } catch (error) {
                console.error("Join queue error:", error);
                socket.emit("error", { message: "Failed to join queue" });
            }
        });

        socket.on("submit_answer", async ({ duoId, userId, scoreDelta }) => {
            io.to(duoId).emit("opponent_score_update", { userId, scoreDelta });
        });

        socket.on("game_over", async ({ duoId, userId, finalScore }) => {
            const match = activeMatches[duoId];
            if (!match) return;

            if (userId === match.player1_id) {
                match.player1_score = finalScore;
            } else if (userId === match.player2_id) {
                match.player2_score = finalScore;
            }

            // Tell the other player this player finished
            io.to(duoId).emit("opponent_finished", { userId });

            // If both players finished
            if (match.player1_score !== undefined && match.player2_score !== undefined) {
                try {
                    let winnerId = null;
                    let p1XpGained = 10;
                    let p2XpGained = 10;

                    if (match.player1_score > match.player2_score) {
                        winnerId = match.player1_id;
                        p1XpGained = 30;
                    } else if (match.player2_score > match.player1_score) {
                        winnerId = match.player2_id;
                        p2XpGained = 30;
                    }

                    // Update QuizDuo
                    await QuizDuo.update({
                        status: 'finished',
                        winner_id: winnerId,
                        player1_score: match.player1_score,
                        player2_score: match.player2_score
                    }, { where: { duo_id: duoId } });

                    // Update XP
                    await User.increment('xp', { by: p1XpGained, where: { user_id: match.player1_id } });
                    await User.increment('xp', { by: p2XpGained, where: { user_id: match.player2_id } });

                    io.to(duoId).emit("battle_result", {
                        winnerId,
                        players: {
                            [match.player1_id]: { score: match.player1_score, xpGained: p1XpGained },
                            [match.player2_id]: { score: match.player2_score, xpGained: p2XpGained }
                        }
                    });

                    delete activeMatches[duoId];
                } catch (e) {
                    console.error("Error finalizing game:", e);
                }
            }
        });

        socket.on("disconnect", () => {
            console.log(`User disconnected: ${socket.id}`);
            removeFromQueues(socket.id);
        });
    });
};

const matchMake = async (io, topicId) => {
    const queue = queues[topicId];
    if (queue.length < 2) return;

    // Sort by XP to match closest
    queue.sort((a, b) => a.xp - b.xp);

    const player1 = queue.shift();
    const player2 = queue.shift();

    if (player1 && player2) {
        try {
            const newDuo = await QuizDuo.create({
                player1_id: player1.userId,
                player2_id: player2.userId,
                topic_id: topicId,
                status: 'active'
            });

            const duoId = newDuo.duo_id;

            // Initialize active match tracker
            activeMatches[duoId] = {
                player1_id: player1.userId,
                player2_id: player2.userId,
                player1_socket: player1.socketId,
                player2_socket: player2.socketId
            };

            // Fetch questions
            const questions = await Question.findAll({
                where: { topic_id: topicId },
                order: sequelize.random(),
                limit: 5
            });

            const formattedQuestions = questions.map((q) => {
                const content = q.content || {};
                return {
                    id: q.question_id,
                    text: content.text || content.question || 'Missing question',
                    options: content.options || [],
                    correctIndex: typeof content.correctIndex === 'number' ? content.correctIndex : 0
                };
            });

            io.to(player1.socketId).emit("match_found", {
                opponent: { id: player2.userId, name: player2.name, xp: player2.xp },
                duoId,
                role: 'player1',
                questions: formattedQuestions
            });

            io.to(player2.socketId).emit("match_found", {
                opponent: { id: player1.userId, name: player1.name, xp: player1.xp },
                duoId,
                role: 'player2',
                questions: formattedQuestions
            });

            const p1Socket = io.sockets.sockets.get(player1.socketId);
            const p2Socket = io.sockets.sockets.get(player2.socketId);

            if (p1Socket) p1Socket.join(duoId);
            if (p2Socket) p2Socket.join(duoId);

            console.log(`Match started: ${player1.name} vs ${player2.name}`);

        } catch (err) {
            console.error("Error creating match:", err);
            queue.push(player1);
            queue.push(player2);
        }
    }
};

const removeFromQueues = (socketId) => {
    for (const topicId in queues) {
        queues[topicId] = queues[topicId].filter(p => p.socketId !== socketId);
    }
};
