/**
 * Socket.IO Singleton
 * Import `getIO` anywhere in the server to emit real-time events to all connected clients.
 *
 * Initialization (in server.js):
 *   import { initSocket } from "./utils/socket.js";
 *   initSocket(httpServer);
 *
 * Usage in controllers:
 *   import { getIO } from "../utils/socket.js";
 *   getIO().emit("asset:updated", { ...asset });
 */
import { Server } from "socket.io";

let _io = null;

export const initSocket = (httpServer) => {
  _io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
    transports: ["websocket", "polling"],
  });

  _io.on("connection", (socket) => {
    console.log(`[Socket] Client connected: ${socket.id}`);
    socket.on("disconnect", () => {
      console.log(`[Socket] Client disconnected: ${socket.id}`);
    });
  });

  console.log("[Socket] Socket.IO initialized");
  return _io;
};

/**
 * Returns the Socket.IO instance.
 * Falls back to a no-op object if not yet initialized (safe for tests/early boot).
 */
export const getIO = () => {
  if (!_io) {
    return { emit: () => {} };
  }
  return _io;
};
