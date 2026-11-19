import { io, Socket } from "socket.io-client";
import { baseURL } from "./BaseURL";

let socket: Socket | null = null;

const getAuthToken = (): string | null => {
  if (typeof window === "undefined") return null;

  const match = document.cookie.match(new RegExp("(?:^|; )alexandertel-admin-token=([^;]*)"));
  if (match) return decodeURIComponent(match[1]);

  return localStorage.getItem("accessToken") || localStorage.getItem("token") || null;
};

export const getSocket = (): Socket => {
  if (!socket) {
    const token = getAuthToken();

    socket = io(baseURL, {
      auth: {
        token: token || "",
      },
      transports: ["websocket", "polling"],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socket.on("connect", () => {
      console.log("Connected to ENG WebSocket with auth:", socket?.id);
    });

    socket.on("connect_error", (err) => {
      console.warn("WebSocket connection error:", err.message);
    });
  }

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
