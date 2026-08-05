import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

let client = null;

export function connectSocket(onConnect) {
  const token = localStorage.getItem("jwt_token");
  if (!token) return null;

  client = new Client({
    webSocketFactory: () => new SockJS(`http://localhost:8083/ws?token=${token}`),
    reconnectDelay: 5000,
    onConnect: () => onConnect?.(client),
  });
  client.activate();
  return client;
}

export function disconnectSocket() {
  client?.deactivate();
  client = null;
}

export function getSocket() {
  return client;
}
