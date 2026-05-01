import { Server } from "socket.io";
import QuizDuo from "../models/QuizDuo.js";
import User from "../models/User.js";
import Question from "../models/Question.js";
import QuizParticipant from "../models/QuizParticipant.js";
import { sequelize } from "../config/db.js";

const lobbies = {};
const activeRooms = {};

export const setupSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: "*", 
            methods: ["GET", "POST"],
        },
    });

    io.on("connection", (socket) => {
        console.log(`User connected: ${socket.id}`);

        socket.on("join_queue", async ({ userId, topicId }) => {
            try {
                const user = await User.findByPk(userId);
                if (!user) {
                    socket.emit("error", { message: "User not found" });
                    return;
                }

                if (!lobbies[topicId]) {
                    lobbies[topicId] = {
                        initiatorId: userId,
                        players: []
                    };
                }

                const lobby = lobbies[topicId];
                const existingIndex = lobby.players.findIndex(p => p.userId === userId);
                
                const playerData = { 
                    socketId: socket.id, 
                    userId, 
                    xp: user.xp || 0, 
                    name: user.name,
                    avatar: '👤'
                };

                if (existingIndex !== -1) {
                    lobby.players[existingIndex] = playerData;
                } else {
                    lobby.players.push(playerData);
                }

                // If the initiator left and came back, or if the original initiator is gone
                if (!lobby.players.some(p => p.userId === lobby.initiatorId)) {
                    lobby.initiatorId = userId;
                }

                socket.join(`room_${topicId}`);
                console.log(`User ${user.name} joined lobby for topic ${topicId}`);

                io.to(`room_${topicId}`).emit("lobby_update", {
                    players: lobby.players,
                    initiatorId: lobby.initiatorId,
                    topicId
                });
            } catch (error) {
                console.error("Join queue error:", error);
                socket.emit("error", { message: "Failed to join lobby" });
            }
        });

        socket.on("start_game", async ({ userId, topicId }) => {
            const lobby = lobbies[topicId];
            if (!lobby || lobby.initiatorId !== userId) {
                socket.emit("error", { message: "Only the initiator can start the game" });
                return;
            }

            try {
                // Create a record in QuizDuo to get a unique roomId (duo_id)
                const p1 = lobby.players[0];
                const p2 = lobby.players[1] || p1; 

                const newDuo = await QuizDuo.create({
                    player1_id: p1.userId,
                    player2_id: p2.userId,
                    topic_id: topicId,
                    status: 'active',
                    initiator_user_id: userId
                });

                const roomId = newDuo.duo_id;
                
                // Track all participants
                const participantPromises = lobby.players.map(p => 
                    QuizParticipant.create({ duo_id: roomId, user_id: p.userId })
                );
                await Promise.all(participantPromises);

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

                // Initialize active room tracker
                activeRooms[roomId] = {
                    topicId,
                    players: {},
                    totalPlayers: lobby.players.length,
                    finishedCount: 0
                };

                lobby.players.forEach(p => {
                    activeRooms[roomId].players[p.userId] = {
                        socketId: p.socketId,
                        name: p.name,
                        score: 0,
                        finished: false
                    };
                    
                    const s = io.sockets.sockets.get(p.socketId);
                    if (s) s.join(roomId);
                });

                io.to(roomId).emit("match_found", {
                    players: lobby.players.map(p => ({ id: p.userId, name: p.name, xp: p.xp })),
                    duoId: roomId,
                    questions: formattedQuestions
                });

                // Clear lobby
                delete lobbies[topicId];
                console.log(`Game started in room ${roomId} for topic ${topicId} with ${activeRooms[roomId].totalPlayers} players`);

            } catch (err) {
                console.error("Error starting match:", err);
                socket.emit("error", { message: "Failed to start game" });
            }
        });

        socket.on("submit_answer", async ({ duoId, userId, scoreDelta }) => {
            const room = activeRooms[duoId];
            if (room && room.players[userId]) {
                room.players[userId].score += scoreDelta;
                // Broadcast update to everyone in the room
                io.to(duoId).emit("opponent_score_update", { userId, scoreDelta, currentScore: room.players[userId].score });
            }
        });

        socket.on("game_over", async ({ duoId, userId, finalScore }) => {
            const room = activeRooms[duoId];
            if (!room || !room.players[userId]) return;

            const player = room.players[userId];
            if (player.finished) return;

            player.score = finalScore;
            player.finished = true;
            room.finishedCount++;

            io.to(duoId).emit("opponent_finished", { userId });

            // If all players finished
            if (room.finishedCount === room.totalPlayers) {
                try {
                    const results = {};
                    let highestScore = -Infinity;
                    let winnerId = null;

                    for (const [id, p] of Object.entries(room.players)) {
                        let xpGained = Math.round(p.score / 10);
                        
                        if (p.score > highestScore) {
                            highestScore = p.score;
                            winnerId = id;
                        }

                        results[id] = { score: p.score, xpGained: Math.max(-25, Math.min(90, xpGained)) };
                    }

                    // Add winner bonus (+15)
                    if (winnerId && results[winnerId].score > 0) {
                        results[winnerId].xpGained = Math.min(90, results[winnerId].xpGained + 15);
                    }

                    // Final DB updates
                    await QuizDuo.update({
                        status: 'finished',
                        winner_id: winnerId
                    }, { where: { duo_id: duoId } });

                    const xpUpdatePromises = Object.entries(results).map(([id, res]) => 
                        User.increment('xp', { by: res.xpGained, where: { user_id: id } })
                    );
                    await Promise.all(xpUpdatePromises);

                    io.to(duoId).emit("battle_result", {
                        winnerId,
                        players: results
                    });

                    delete activeRooms[duoId];
                } catch (e) {
                    console.error("Error finalizing game:", e);
                }
            }
        });

        socket.on("disconnect", () => {
            console.log(`User disconnected: ${socket.id}`);
            handleDisconnect(io, socket.id);
        });
    });
};

const handleDisconnect = (io, socketId) => {
    // Remove from lobbies
    for (const topicId in lobbies) {
        const lobby = lobbies[topicId];
        const playerIndex = lobby.players.findIndex(p => p.socketId === socketId);
        
        if (playerIndex !== -1) {
            const removedPlayer = lobby.players.splice(playerIndex, 1)[0];
            
            if (lobby.players.length === 0) {
                delete lobbies[topicId];
            } else {
                if (lobby.initiatorId === removedPlayer.userId) {
                    lobby.initiatorId = lobby.players[0].userId;
                }
                io.to(`room_${topicId}`).emit("lobby_update", {
                    players: lobby.players,
                    initiatorId: lobby.initiatorId,
                    topicId
                });
            }
        }
    }
};
