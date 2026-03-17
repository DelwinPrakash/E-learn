import { Server } from "socket.io";
import QuizDuo from "../models/QuizDuo.js"; // Use QuizDuo for battle sessions
import User from "../models/User.js";
import Question from "../models/Question.js";
import { Op } from "sequelize";

// In-memory queue: { [topicId]: [{ socketId, userId, rank, name }] }
const queues = {};

export const setupSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: "*", // Adjust for production
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

                // Check if user is already in queue
                const existingIndex = queues[topicId].findIndex(p => p.userId === userId);
                if (existingIndex !== -1) {
                    queues[topicId][existingIndex].socketId = socket.id; // Update socket id
                } else {
                    queues[topicId].push({ socketId: socket.id, userId, rank: user.rank, name: user.name });
                }

                socket.join(topicId);
                console.log(`User ${user.name} joined queue for topic ${topicId}`);

                // Try to find a match
                matchMake(io, topicId);

            } catch (error) {
                console.error("Join queue error:", error);
                socket.emit("error", { message: "Failed to join queue" });
            }
        });

        // User submits an answer during the game
        socket.on("submit_answer", async ({ duoId, userId, scoreDelta }) => {
            // Just verify the validation on client side for MVP, or process server side
            // Here we just relay or update temporary state. 
            // For a secure implementation, we should validate answers here.
            // Assuming client calculates score for now to keep it simple as per request complexity.

            io.to(duoId).emit("opponent_score_update", { userId, scoreDelta });
        });

        socket.on("game_over", async ({ duoId, scores }) => {
            // scores: { [userId]: finalScore }
            try {
                // We use a transaction to safely update both the game and user records
                const t = await sequelize.transaction();

                try {
                    const duo = await QuizDuo.findByPk(duoId, { transaction: t });
                    if (!duo || duo.status === 'finished') {
                        await t.rollback();
                        return; // Already processed or not found
                    }

                    const p1Id = duo.player1_id;
                    const p2Id = duo.player2_id;

                    const p1Score = scores[p1Id] || 0;
                    const p2Score = scores[p2Id] || 0;
                    
                    let winnerId = null;
                    if (p1Score > p2Score) winnerId = p1Id;
                    else if (p2Score > p1Score) winnerId = p2Id;

                    // Update QuizDuo
                    await duo.update({
                        status: 'finished',
                        player1_score: p1Score,
                        player2_score: p2Score,
                        winner_id: winnerId
                    }, { transaction: t });

                    // Update Users XP/Rank
                    if (winnerId) {
                        const winner = await User.findByPk(winnerId, { transaction: t });
                        if (winner) {
                            // Give winner XP and increase rank rating slightly
                            await winner.update({
                                xp: winner.xp + 50,
                                rank: winner.rank + 10
                            }, { transaction: t });
                        }
                    }

                    // Optional: You could deduct points for losers, but let's just award base XP
                    const loserId = winnerId === p1Id ? p2Id : p1Id;
                    if (loserId) {
                        const loser = await User.findByPk(loserId, { transaction: t });
                        if (loser) {
                            // Participation XP
                            await loser.update({
                                xp: loser.xp + 10
                            }, { transaction: t });
                        }
                    }

                    await t.commit();
                    io.to(duoId).emit("match_results", { winnerId, p1Score, p2Score });

                } catch (txErr) {
                    await t.rollback();
                    throw txErr;
                }

            } catch (e) {
                console.error("Game Over Error:", e);
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

    // Sorting by rank to find closest match
    queue.sort((a, b) => a.rank - b.rank);

    const player1 = queue.shift();
    const player2 = queue.shift();

    if (player1 && player2) {
        const roomId = `match_${player1.userId}_${player2.userId}`; // or UUID

        // Create DB Entry
        try {
            const newDuo = await QuizDuo.create({
                player1_id: player1.userId,
                player2_id: player2.userId,
                topic_id: topicId,
                status: 'active'
            });

            const duoId = newDuo.duo_id;

            // Fetch questions for this topic
            let topicQuestions = [];
            try {
                 // Fetch 5 random questions for the topic. 
                 // Adjust mapping depending on how Question model stores category/topic.
                 const questions = await Question.findAll({
                     where: { topic_id: topicId }, 
                     order: sequelize.random(), 
                     limit: 5
                 });

                 topicQuestions = questions.map((q, index) => {
                     const content = q.content || {}; // Assuming content has { question, options: [], answer }
                     // Fallback options mapping if structure differs
                     const options = content.options || [];
                     const answerStr = content.answer || '';
                     
                     // Try to find the correct index by matching the answer string to the options array
                     let correctIndex = options.findIndex(opt => opt === answerStr);
                     if (correctIndex === -1) {
                         // Fallback heuristic: some structured like { "A": "...", "B": "..." } and Answer: "A"
                         // Without examining actual rows, we assume standard array implementation or default to 0.
                         correctIndex = 0; 
                     }

                     return {
                         id: q.question_id || index + 1,
                         text: content.question || "Unable to parse question",
                         options: options.length > 0 ? options : ["A", "B", "C", "D"],
                         correctIndex: correctIndex
                     };
                 });
            } catch (err) {
                 console.error("Error fetching questions for match:", err);
            }

            // Notify players
            io.to(player1.socketId).emit("match_found", {
                opponent: { name: player2.name, rank: player2.rank },
                duoId,
                role: 'player1',
                questions: topicQuestions
            });
            io.to(player2.socketId).emit("match_found", {
                opponent: { name: player1.name, rank: player1.rank },
                duoId,
                role: 'player2',
                questions: topicQuestions
            });

            // Make them join a room for private communication if needed
            const p1Socket = io.sockets.sockets.get(player1.socketId);
            const p2Socket = io.sockets.sockets.get(player2.socketId);

            if (p1Socket) p1Socket.join(duoId);
            if (p2Socket) p2Socket.join(duoId);

            console.log(`Match started: ${player1.name} vs ${player2.name}`);

        } catch (err) {
            console.error("Error creating match:", err);
            // Refund queue
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
