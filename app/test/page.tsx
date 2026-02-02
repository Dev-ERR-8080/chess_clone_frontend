'use client'
import React, { useEffect, useRef, useState } from 'react';
import SockJS from 'sockjs-client';
import { Client, IMessage } from '@stomp/stompjs';
import PlayerProfile from '@/components/ui/profile';
import { Button } from '@/components/ui/button';

const WebSocketTest: React.FC = () => {
    const [status, setStatus] = useState<string>("Disconnected");
    const [messages, setMessages] = useState<string[]>([]);
    const stompClientRef = useRef<Client | null>(null);

    useEffect(() => {
        // 1. Initialize SockJS and Stomp Client
        const socket = new SockJS('http://localhost:8080/game/ws'); // Adjust to your backend URL
        const client = new Client({
            webSocketFactory: () => socket,
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
        });

        // 2. Define Connection Callback
        client.onConnect = (frame) => {
            console.log("WS CONNECTED", frame);
            setStatus("Connected");

            // 3. Subscribe to the topic
            client.subscribe('/topic/match/1', (msg: IMessage) => {
                console.log("WS RECEIVED:", msg.body);
                setMessages((prev) => [...prev, msg.body]);
            });
        };

        client.onStompError = (frame) => {
            console.error('Broker reported error: ' + frame.headers['message']);
            console.error('Additional details: ' + frame.body);
        };

        client.activate();
        stompClientRef.current = client;

        // Cleanup on unmount
        return () => {
            if (stompClientRef.current) {
                stompClientRef.current.deactivate();
                console.log("WS DISCONNECTED");
            }
        };
    }, []);

    // 4. Test Send Function
    const sendMove = () => {
        if (stompClientRef.current && stompClientRef.current.connected) {
            const moveData = {
              matchId: 1,
              fromRow: 6,
              fromCol: 4,
              toRow: 4,
              toCol: 4,
              uci: "e2e4",
              san: "e4",
              fenBefore: "start",
              fenAfter: "after"
            };

            stompClientRef.current.publish({
                destination: "/app/move",
                body: JSON.stringify(moveData),
            });
            console.log("WS SENT: ", moveData);
        } else {
            console.error("Cannot send: STOMP client is not connected");
        }
    };

    return (
        <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
            <PlayerProfile
                name='preetham'
                rating={502}
                isTurn={true}
                timeLeft='6000'
                avatarUrl='https://lh3.googleusercontent.com/a/ACg8ocKZ_jmGKVsgccu9XsufFH1gMX1ZwrElm4uufUNQqXofUgJV-8nJ=s360-c-no'
                isBottom={true}
            />
            <Button />

            <h2>WebSocket Test (STOMP)</h2>
            <p>Status: <strong>{status}</strong></p>
            
            <button onClick={sendMove} style={{ padding: '10px 20px', cursor: 'pointer' }}>
                Send Test Move
            </button>

            <h3>Received Messages:</h3>
            <ul>
                {messages.map((m, i) => <li key={i}>{m}</li>)}
            </ul>
        </div>
    );
};

export default WebSocketTest;