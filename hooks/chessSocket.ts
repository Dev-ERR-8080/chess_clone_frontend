import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

export function createChessSocket(
  matchId: number,
  onMove: (move: any) => void
) {
  const socket = new SockJS("http://localhost:8080/ws");
  const client = new Client({
    webSocketFactory: () => socket,
    reconnectDelay: 5000,
  });

  client.onConnect = () => {
    console.log("WS CONNECTED");

    client.subscribe(`/topic/match/${matchId}`, msg => {
      const move = JSON.parse(msg.body);
      onMove(move);
    });
  };

  client.activate();

  return client;
}
