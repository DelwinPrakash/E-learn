import { io } from "socket.io-client";

const socket = io("http://localhost:3000");

socket.on("connect", () => {
    console.log("Connected to server:", socket.id);

    // Simulate joining queue
    socket.emit("join_queue", { userId: "test-user-id", topicId: "test-topic-id" });
});

socket.on("error", (err) => {
    console.log("Socket Error:", err);
});

socket.on("match_found", (data) => {
    console.log("Match Found:", data);
});

socket.on("disconnect", () => {
    console.log("Disconnected");
});
