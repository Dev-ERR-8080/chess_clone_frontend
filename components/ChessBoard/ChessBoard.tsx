
"use client";
import React, { useEffect, useRef, useState } from "react";
import BoardGrid from "./BoardGrid";
import { CHESS_COM_GREEN } from "@/components/ChessBoard/Theme";
import { HoveredSquare, LastMove, LegalMove, SelectedSquare, UILegalMove } from "./types";
import { getPseudoLegalMoves } from "./moveGenerator";
import { createEngine } from "./engine/engineFactory";
import { isKingInCheck } from "./logic/checkDetection";
import PromotionModal from "./logic/promotion";
import MoveHistory from "../ui/history";
import { createChessSocket } from "@/hooks/chessSocket";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import GameTimer from "../ui/timer";
import { match } from "assert";
import { useMatch } from "@/lib/MatchContext";

const initialBoard = [
  ["bR","bN","bB","bQ","bK","bB","bN","bR"],
  ["bP","bP","bP","bP","bP","bP","bP","bP"],
  ...Array.from({ length: 4 }, () => Array(8).fill(null)),
  ["wP","wP","wP","wP","wP","wP","wP","wP"],
  ["wR","wN","wB","wQ","wK","wB","wN","wR"],
];

type ChessBoardProps = {
  size?: number;
  matchId: string | undefined;
  color: string | undefined;
  matchType: "CLASSIC" | "BLITZ" | "RAPID" | "BULLET"|undefined;
};


export default function ChessBoard({ size = 560, matchId, color, matchType }: ChessBoardProps) {
  const {match} = useMatch();
  const [board, setBoard] = useState(initialBoard);
  const [dragged, setDragged] = useState<any>(null);
  const [lastMove, setLastMove] = useState<LastMove>(null);
  const [selectedSquare, setSelectedSquare] = useState<SelectedSquare>(null);
  const [hoveredSquare, setHoveredSquare] = useState<HoveredSquare>(null);
  const [legalMoves, setLegalMoves] = useState<UILegalMove[]>([]);
  const [orientation, setOrientation] = useState<"WHITE" | "BLACK">(color==="WHITE"?"WHITE":"BLACK");
  const [check, setCheck] = useState<"WHITE" | "BLACK" | null>(null);
  const [checkmate, setCheckmate] = useState<"WHITE" | "BLACK" | null>(null);
  const [promotion, setPromotion] = useState<{ row: number; col: number; color: "WHITE" | "BLACK" } | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [isWsConnected, setIsWsConnected] = useState(false);
  const [currentTurn, setCurrentTurn] = useState<"WHITE"|"BLACK">("WHITE");

  // console.log("match context at chessboard layer"+match?.matchId+match?.color+match?.mode);
  const engineRef = useRef(
    createEngine("custom") 
    );

    useEffect(() => {
    engineRef.current.init(board);
  }, []);
  const socketRef = useRef< Client | null >(null);
  const [timer,setTimer] = useState({
    whiteTimeMs:0,
    blackTimeMs:0,
    turn:"WHITE",
    result:null
  });

  

  
  useEffect(() => {
    const socket = new SockJS("http://localhost:8080/ws");
    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
    });

    client.onConnect = () => {
      console.log("GAME WS CONNECTED");
      setIsWsConnected(true);
      client.subscribe(`/topic/match/${matchId}`, (msg) => {
        const data = JSON.parse(msg.body);
        // handleRemoteMove(move);
        handleSocketMessage(data);
      });
    };

    client.onDisconnect= ()=>{
      setIsWsConnected(false);
    }
    
    client.activate();
    socketRef.current = client;

    return () => {
      if (socketRef.current) {
      socketRef.current.deactivate(); // NOT awaited
      }
    };
  }, [matchId]);

  useEffect(()=>{
    if(timer.result) return;

    const interval = setInterval(()=>{
      setTimer(prev=>{
        if(prev.turn==="WHITE"){
          return {...prev, whiteTimeMs: Math.max(prev.whiteTimeMs-1000,0)};
        }else{
          return {...prev, blackTimeMs: Math.max(prev.blackTimeMs-1000,0)};
        }
      });
    },1000);

    return ()=> clearInterval(interval);
  },[timer.turn,timer.result]);



 
  function pieceCharToColor(c: string): "WHITE" | "BLACK" {
    return c === "w" ? "WHITE" : "BLACK";
  }


  function handleSocketMessage(data:any){

    console.log("WS DATA:", data);

    // ---------- GAME RESULT ----------
    if(data.winner || data.draw){
      setTimer(prev=>({
        ...prev,
        result:data
      }));
      setGameOver(true);
      return;
    }

    // ---------- MOVE ----------
    if(data.type==="MOVE"){

      engineRef.current.makeMove(
        {row:data.fromRow,col:data.fromCol},
        {row:data.toRow,col:data.toCol}
      );

      engineRef.current.setTurn(data.nextTurn==="WHITE"?"WHITE":"BLACK");

      setBoard(engineRef.current.getBoard());

      setLastMove({
        from:{row:data.fromRow,col:data.fromCol},
        to:{row:data.toRow,col:data.toCol}
      });

      setMoveHistory(engineRef.current.getHistory());

      // 🔥 TIMER UPDATE
      setTimer(prev=>({
        ...prev,
        whiteTimeMs:data.whiteTimeMs,
        blackTimeMs:data.blackTimeMs,
        turn:data.nextTurn
      }));

      setCurrentTurn(data.nextTurn);
    }
  }



  function onDragStart(r: number, c: number, piece: string) {
    if (gameOver) return;

    const playerColor = match?.color; // "WHITE" | "BLACK"
    const pieceColor = pieceCharToColor(piece[0]);
    const engineTurn = engineRef.current.getTurn(); // "WHITE" | "BLACK"
    setCurrentTurn(engineTurn === 'WHITE'? "WHITE":"BLACK");

    // ❌ Not your piece
    if (pieceColor !== playerColor){
      console.log("Not your piece");
      return
    };

    // ❌ Not your turn
    // Normalize playerColor to "WHITE" or "BLACK" for comparison
    const normalizedPlayerColor = playerColor === "WHITE" ? "WHITE" : playerColor === "BLACK" ? "BLACK" : playerColor;

    if (engineTurn !== normalizedPlayerColor) return;

    setDragged({ r, c, piece });
    setSelectedSquare({ row: r, col: c });

    const engineMoves = engineRef.current.getLegalMoves({ row: r, col: c });

    const normalizedMoves = engineMoves.map((m) => ({
      to: m.to,
      capture: m.capture ?? false,
    }));

    setLegalMoves(normalizedMoves);
  }

  

  // function onDrop(r: number, c: number) {
  //   if (!dragged) return;
  //   const engineTurn = engineRef.current.getTurn();
  //   if (engineTurn !== color) {
  //     setDragged(null);
  //     return;
  //   }

  //   const from = { row: dragged.r, col: dragged.c };
  //   const to = { row: r, col: c };

  //   const success = engineRef.current.makeMove(from, to);
    
  //   // const nextTurn = engineRef.current.getTurn();

  //   // if (engineRef.current.isCheckmate(nextTurn)) {
  //   //   setCheckmate(nextTurn);
  //   //   setGameOver(true);
  //   // } else if (isKingInCheck(engineRef.current.getBoard(), nextTurn)) {
  //   //   setCheck(nextTurn);
  //   // } else {
  //   //   setCheck(null);
  //   // }
  //   if (!success) {
  //     setDragged(null);
  //     return;
  //   }


  //   setHoveredSquare(null);
  //   setSelectedSquare(null);
  //   setLegalMoves([]);


  //   const san = engineRef.current.getHistory().slice(-1)[0];

  //   // Promotion trigger
  //   if (dragged.piece[1] === "P" && (to.row === 0 || to.row === 7)) {
  //     setPromotion({
  //       row: to.row,
  //       col: to.col,
  //       color: dragged.piece[0],
  //     });
  //     setDragged(null);
  //     return;
  //   }

  //   console.log("Match id: "+matchId+" fromRow: "+ from.row+" fromCol: "+ from.col+ " toRow: "+ to.row+" toCol: "+ to.col+" san: "+san+
  //       " uci: "+ `${from.col}${from.row}${to.col}${to.row}`);

  //   socketRef.current?.publish({
  //     destination: "/app/match/move",
  //     body: JSON.stringify({
  //       matchId,
  //       fromRow: from.row,
  //       fromCol: from.col,
  //       toRow: to.row,
  //       toCol: to.col,
  //       san,
  //       uci: `${from.col}${from.row}${to.col}${to.row}`
  //     })
      

  //   });

  //   // setBoard(engineRef.current.getBoard());
  //   // setMoveHistory(engineRef.current.getHistory());
  //   // setLastMove({ from, to });
  //   // setDragged(null);
  // }

  function onDrop(r: number, c: number) {
    if (!dragged) return;
    const engineTurn = engineRef.current.getTurn();
    if (engineTurn !== color) {
      setDragged(null);
      return;
    }

    const from = { row: dragged.r, col: dragged.c };
    const to = { row: r, col: c };

    const success = engineRef.current.makeMove(from, to);
    
    if (!success) {
      setDragged(null);
      return;
    }

    const san = engineRef.current.getHistory().slice(-1)[0];
    
    const fenAfter = engineRef.current.getFen(); 
   

    setHoveredSquare(null);
    setSelectedSquare(null);
    setLegalMoves([]);

    socketRef.current?.publish({
      destination: "/app/match/move",
      body: JSON.stringify({
        matchId,
        fromRow: from.row,
        fromCol: from.col,
        toRow: to.row,
        toCol: to.col,
        san,
        fenAfter: fenAfter, // <--- ADD THIS LINE
        uci: `${from.col}${from.row}${to.col}${to.row}`
      })
    });
  }

  // console.log("ENGINE TURN", engineRef.current.getTurn());
  // console.log("UI TURN", currentTurn);

  return (
    <div className="justify-center">
    <div>
        
        <GameTimer
          whiteTimeMs={timer.whiteTimeMs}
          blackTimeMs={timer.blackTimeMs}
          turn={currentTurn}
          result={timer.result}
        />

        {promotion &&<PromotionModal
          color={promotion.color}
          onSelect={(piece) => {
            engineRef.current.promotePawn(
              { row: promotion.row, col: promotion.col },
              piece[1]
            );

            const san = engineRef.current.getHistory().slice(-1)[0];

            socketRef.current?.publish({
              destination: "/app/match/move",
              body: JSON.stringify({
                matchId,
                promotion: piece[1],
                san
              })
            });

            setBoard(engineRef.current.getBoard());
            setPromotion(null);
          }}

        />}

      </div>
      <div id="chess board" className="m-4 justify-around gap-5 align-middle flex flex-row">
          
          <BoardGrid
              board={board}
              size={size}
              theme={CHESS_COM_GREEN}
              lastMove={lastMove}
              selectedSquare={selectedSquare}
              hoveredSquare={hoveredSquare}
              setHoveredSquare={setHoveredSquare}
              legalMoves={legalMoves}
              orientation={orientation}
              onDrop={onDrop}
              onDragStart={onDragStart}
              checkmate={checkmate}
          />
          <MoveHistory moves={moveHistory} />
          
      </div>
      <div>



          {check && (
            <div className="check-indicator">
              {check === "WHITE" ? "WHITE" : "BLACK"} is in Check
            </div>
          )}
          {checkmate && (
            <div className="text-red-600" >
              CHECKMATE — {checkmate === "WHITE" ? "WHITE" : "BLACK"} lost
            </div>
          )}

      </div>
    </div>
  );
}
