import { Server } from "socket.io";
import QuizDuo from "../models/QuizDuo.js"; // Use QuizDuo for battle sessions
import User from "../models/User.js";
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
            // Update DB
            try {
                // Logic to update QuizDuo with final scores and winner
            } catch (e) {
                console.error(e);
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

    // Simple FIFO match for now, or sort by rank
    // To implement Rank-based: sort queue by rank, then find neighbors.

    // Sorting by rank to find closest match
    queue.sort((a, b) => a.rank - b.rank);

    // Find a pair within rank threshold? For MVP, just match the first two close enough or just first two.
    // Let's just match first two for MVP speed to test.

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

            // Notify players
            io.to(player1.socketId).emit("match_found", {
                opponent: { name: player2.name, rank: player2.rank },
                duoId,
                role: 'player1'
            });
            io.to(player2.socketId).emit("match_found", {
                opponent: { name: player1.name, rank: player1.rank },
                duoId,
                role: 'player2'
            });

            // Make them join a room for private communication if needed
            const p1Socket = io.sockets.sockets.get(player1.socketId);
            const p2Socket = io.sockets.sockets.get(player2.socketId);

            if (p1Socket) p1Socket.join(duoId);
            if (p2Socket) p2Socket.join(duoId);

            console.log(`Match started: ${player1.name} vs ${player2.name}`);

        } catch (err) {
            console.error("Error creating match:", err);
            // Refund queue?
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
