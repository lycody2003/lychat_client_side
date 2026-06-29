import { io } from "socket.io-client";

let socket = null;

export function useSocket() {
  function connect() {
    if (socket) return socket;
    const token = localStorage.getItem("lychat_token");
    socket = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:5000", {
      auth: { token },
    });
    return socket;
  }

  function disconnect() {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
  }

  function getSocket() {
    return socket;
  }

  return { connect, disconnect, getSocket };
}
