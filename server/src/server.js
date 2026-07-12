import "dotenv/config";
import { createServer } from "http";
import app from "./app.js";
import { initSocket } from "./utils/socket.js";

const PORT = process.env.PORT || 5000;

// Wrap Express app in a raw HTTP server so Socket.IO can attach
const httpServer = createServer(app);

// Boot Socket.IO
initSocket(httpServer);

httpServer.listen(PORT, () => {
  console.log(`NexAsset server is running on port ${PORT}`);
  console.log(`Socket.IO ready for real-time connections`);
});
