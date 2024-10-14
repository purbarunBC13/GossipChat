import { Server as SocketIOServer } from "socket.io";
import Message from "./models/MessegesModel.js";

const setupSocket = (server) => {
  const io = new SocketIOServer(server, {
    cors: {
      origin: process.env.ORIGIN,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  const userSocketMap = new Map();

  const disconnect = (socket) => {
    for (const [userId, socketId] of userSocketMap.entries()) {
      if (socketId === socket.id) {
        userSocketMap.delete(userId);
        console.log(`userId ${userId} disconnected`);
        break;
      }
    }
  };

  const sendMessage = async (message) => {
    const senderSocketId = userSocketMap.get(message.sender);
    const recipientSocketId = userSocketMap.get(message.recipient);
    const createdMessage = await Message.create(message);

    const messageData = await Message.findById(createdMessage._id)
      .populate("sender", "id firstName lastName email image color")
      .populate("recipient", "id firstName lastName email image color");

    if (recipientSocketId) {
      io.to(recipientSocketId).emit("receiveMessage", messageData);
    }
    if (senderSocketId) {
      io.to(senderSocketId).emit("receiveMessage", messageData);
    }
  };

  io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;
    if (userId) {
      userSocketMap.set(userId, socket.id);
      console.log(`userId ${userId} connected with socketId ${socket.id}`);
    } else {
      console.log("userId not found");
    }

    socket.on("sendMessage", sendMessage);
    socket.on("disconnect", () => disconnect(socket));
  });
};

export default setupSocket;
