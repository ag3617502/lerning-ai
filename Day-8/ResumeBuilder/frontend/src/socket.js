// Socket.IO client singleton — shared across the entire React app
// JWT token is passed in handshake auth so the server can verify identity
import { io } from "socket.io-client";

const BACKEND_URL = "http://localhost:5008";

function createSocket() {
  const token = localStorage.getItem("resume_token") || "";
  return io(BACKEND_URL, {
    autoConnect: true,
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 10,
    auth: { token },
  });
}

const socket = createSocket();

// When the token changes (login/logout), reconnect with the new token
export function reconnectWithToken() {
  const token = localStorage.getItem("resume_token") || "";
  socket.auth = { token };
  socket.disconnect().connect();
}

export default socket;

