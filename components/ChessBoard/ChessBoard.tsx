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
// import { createChessSocket } from "@/hooks/chessSocket";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import GameTimer from "../ui/timer";
import { match } from "assert";
import { useMatch } from "@/context/MatchContext";
import { useSocket } from "@/context/SocketContext";
import { useUser } from "@/context/UserContext";
import { useParams } from "next/navigation";

const initialBoard = [
  ["bR","bN","bB","bQ","bK","bB","bN","bR"],
  ["bP","bP","bP","bP","bP","bP","bP","bP"],
  ...Array.from({ length: 4 }, () => Array(8).fill(null)),
  ["wP","wP","wP","wP","wP","wP","wP","wP"],
  ["wR","wN","wB","wQ","wK","wB","wN","wR"],
];

type TimerResult = {
  draw: boolean;
  winner: string;
  reason: string
 };

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
    const [currentTurn, setCurrentTurn] = useState<"WHITE"|"BLACK">("WHITE");
    const { isConnected, stompClient } = useSocket();
    const {user} = useUser();
    
    // console.log("match context at chessboard layer"+match?.matchId+match?.color+match?.mode);
    const engineRef = useRef( createEngine("custom") );

    useEffect(() => {
      engineRef.current.init(board);
    }, []);
    
    const socketRef = useRef< Client | null >(null);
    
    const [timer, setTimer] = useState<{
      whiteTimeMs: number;
      blackTimeMs: number;
      turn: string;
      result: TimerResult | null;
    }>({
      whiteTimeMs: 0,
      blackTimeMs: 0,
      turn: "WHITE",
      result: null
    });

    useEffect(() => {
    
      if (!matchId || !isConnected || !stompClient) {
        console.log("⏳ Waiting for matchId or Connection...");
        return; 
      }
      console.log("Re-using Global Socket for Match:", matchId);
      
      const sub = stompClient.subscribe(`/topic/match/${matchId}`, (msg) => {
        const data = JSON.parse(msg.body);
        handleSocketMessage(data);
      });   
      const syncSub = stompClient.subscribe(`/user/queue/sync`, (msg) => {
          const state = JSON.parse(msg.body);
          handleInitialSync(state);
        });
        stompClient.publish({
          destination: "/app/match/sync",
          body: matchId
        });

        return () => {
          sub.unsubscribe();
          syncSub.unsubscribe();
        };

    }, [isConnected, stompClient]);

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


    function handleInitialSync(state: any) {
      if (!state || !state.fen) return;

      console.log("🔄 SYNCING GAME STATE:", state);

      // 1. Force the engine to the current position
      engineRef.current.loadFen(state.fen);

      // 2. Update React state to match engine
      setBoard(engineRef.current.getBoard());
      
      const currentTurn = state.fen.includes(" w ") ? "WHITE" : "BLACK";
      setCurrentTurn(currentTurn);

      // 3. Sync Timers (if you store them in the Redis Hash)
      if (state.whiteTimeMs) {
        setTimer({
          whiteTimeMs: parseInt(state.whiteTimeMs),
          blackTimeMs: parseInt(state.blackTimeMs),
          turn: currentTurn,
          result: state.status === "FINISHED" ? state.result : null
        });
    }

    // 4. Handle orientation (if you refresh, you still need to know your color)
    // Ensure 'color' prop is passed correctly from your routing/context
    setOrientation(color === "WHITE" ? "WHITE" : "BLACK");
  }
  
    function pieceCharToColor(c: string): "WHITE" | "BLACK" {
      return c === "w" ? "WHITE" : "BLACK";
    }

    function handleSocketMessage(data: any) {
      if(data.type !== "TICK"){
        console.log("WS DATA RECEIVED:", data);
      }

      const unwrap = (val: any) => (Array.isArray(val) ? val[1] : val)

      if (timer.result && data.type === "TICK") return;
      if(data.playerId === user?.userId){
        console.log("Ignoring own move data");
        return;
      }
      // 1. Handle Server-Side Heartbeat (TICK)
      if (data.type === "TICK") {
        console.log("Processing TICK:", data);
        setTimer({
          whiteTimeMs: unwrap(data.whiteTimeMs),
          blackTimeMs: unwrap(data.blackTimeMs),
          turn: data.turn,
          result: null
        });
        // Sync the internal engine turn if it drifted
        if (currentTurn !== data.turn) {
            setCurrentTurn(data.turn);
        }
        return;
      }
      

      // 2. Handle Game Endings (Including TIMEOUT)
      if (data.type === "TIMEOUT") {
          setTimer(prev => ({
            whiteTimeMs: 0,
            blackTimeMs: 0,
            turn: prev.turn,
            result: { 
              draw: false,
              winner: data.loser === "WHITE" ? "BLACK" : "WHITE", 
              reason: "TIME EXPIRED" 
            }
          }));
          setGameOver(true);
          return;
        }
      // 3. Handle Game Results
      if ( data.reason === "CHECKMATE") {
        setTimer(prev => ({ ...prev, result: data }));
        setCheckmate(data.winner ? (data.winner === "WHITE" ? "BLACK" : "WHITE") : null);
        setGameOver(true);
        return;
      }

      // 4    . Handle Moves
      // Check for the 'uci' property instead of 'data.type === "MOVE"'
      if (data.uci) {
        // A. Parse the UCI string if your engine needs coordinates
        // "h2h4" -> from: {row: 6, col: 7}, to: {row: 4, col: 7}
        const moveCoords = uciToCoords(data.uci);

        // B. Apply move to the engine
        const success = engineRef.current.makeMove(moveCoords.from, moveCoords.to);
        console.log("Applying opponent's move:", moveCoords, "Success:", success);
        if (success && moveCoords.promotion) { 
          console.log("Handling promotion to:", moveCoords.promotion);
          engineRef.current.promotePawn(moveCoords.to, moveCoords.promotion);
        } 
        
        const newBoard = engineRef.current.getBoard();
        setBoard([...newBoard]);       
        setLastMove({
          from: moveCoords.from,
          to: moveCoords.to
        });

        setMoveHistory(engineRef.current.getHistory());

        // E. Determine whose turn it is now (if player 2 just moved, it's player 1's turn)
        // You can calculate this based on the FEN or let the backend send 'nextTurn'
        const nextTurn = data.fen.includes(" w ") ? "WHITE" : "BLACK";
        setCurrentTurn(nextTurn);
      }
    }

  // Helper to convert "h2h4" back to {row, col} for your UI/Engine
  function uciToCoords(uci: string) {
      const f = (char: string) => char.charCodeAt(0) - 'a'.charCodeAt(0);
      const r = (char: string) => 8 - parseInt(char);
      
      return {
        from: { row: r(uci[1]), col: f(uci[0]) },
        to: { row: r(uci[3]), col: f(uci[2]) },
        promotion: uci.length === 5 ? uci[4].toUpperCase() : null
      };
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
      const newBoard = engineRef.current.getBoard();
      setBoard(newBoard); // This triggers the re-render
      setLastMove({ from, to });

      //check for promotion
      const movedPiece = dragged.piece;
      if (
        (movedPiece === "wP" && to.row === 0) ||
        (movedPiece === "bP" && to.row === 7)
      ) {
        setPromotion({ row: to.row, col: to.col, color: movedPiece[0] === "w" ? "WHITE" : "BLACK" });
        engineRef.current.promotePawn(to, "Q"); // Default to Queen for now
        // setBoard(engineRef.current.getBoard());
        // setDragged(null);
        return;
      }
      

      //calculate check/checkmate
      const kingInCheck = isKingInCheck(newBoard, engineRef.current.getTurn());
      setCheck(kingInCheck ? engineRef.current.getTurn() : null);

      const isCheckmate = engineRef.current.getLegalMoves(from).length === 0 && kingInCheck;
      setCheckmate(isCheckmate ? engineRef.current.getTurn() : null);

      if (isCheckmate) {
        setGameOver(true);
      }
      // Update timers
      let timeIncrement = 0;
      if (matchType === "BLITZ") timeIncrement = 5 * 1000;
      else if (matchType === "RAPID") timeIncrement = 15 * 1000;
      else if (matchType === "CLASSIC") timeIncrement = 30 * 1000;

      setTimer((prev) => { {
        if (engineRef.current.getTurn() === "WHITE") {
          return {  
            ...prev,
            blackTimeMs: prev.blackTimeMs + timeIncrement,
            turn: "WHITE"
          };
        } else {
          return {
            ...prev,
            whiteTimeMs: prev.whiteTimeMs + timeIncrement,
            turn: "BLACK"
          };
        }
      }});


      const nextEngineTurn = engineRef.current.getTurn();
      setCurrentTurn(nextEngineTurn);
      setMoveHistory(engineRef.current.getHistory());

      console.log("Move History:", engineRef.current.getHistory());


      const san = engineRef.current.getHistory().slice(-1)[0];
      const fenAfter = engineRef.current.getFen(); 
    
      setHoveredSquare(null);
      setSelectedSquare(null);
      setLegalMoves([]);
      
      const moveData = {
        matchId,
          fromRow: from.row,
          fromCol: from.col,
          toRow: to.row,
          toCol: to.col,
          san,
          fenAfter: fenAfter, // <--- ADD THIS LINE
          uci: `${String.fromCharCode(97 + from.col)}${8 - from.row}${String.fromCharCode(97 + to.col)}${8 - to.row}`,
          moveTimeMs: Date.now()
      }
      console.log("EMITTING MOVE DATA:", moveData);

      stompClient?.publish({
        destination: "/app/move",
        body: JSON.stringify(moveData)
      });
    }


    return (
      <div className="justify-center">
      <div>
          
          <GameTimer
            whiteTimeMs={timer.whiteTimeMs}
            blackTimeMs={timer.blackTimeMs}
            turn={currentTurn}
            result={timer.result}
          />

            {promotion && (
              <PromotionModal
                color={promotion.color === "WHITE" ? "w" : "b" }
                onSelect={(piece) => {

                  console.log("Selected promotion piece:", piece);
                  const pieceType = piece[1].toLowerCase(); 
                  const from = { row: dragged.r, col: dragged.c };
                  const to = { row: promotion.row, col: promotion.col };

                  // 2. Update local engine
                  engineRef.current.promotePawn(to, pieceType.toUpperCase());
                  const nextTurn = engineRef.current.getTurn();
                  setCurrentTurn(nextTurn);


                  // 3. Generate Move Data
                  const san = engineRef.current.getHistory().slice(-1)[0];
                  const fenAfter = engineRef.current.getFen();
                  
                  const moveData = {
                    matchId,
                    fromRow: from.row,
                    fromCol: from.col,
                    toRow: to.row,
                    toCol: to.col,
                    promotion: pieceType, 
                    san,
                    fenAfter,
                    // ✅ UCI for promotion: "e7e8q"
                    // uci: `${from.col}${from.row}${to.col}${to.row}${pieceType}`,
                    uci: `${String.fromCharCode(97 + from.col)}${8 - from.row}${String.fromCharCode(97 + to.col)}${8 - to.row}${pieceType}`,
                    moveTimeMs: Date.now()
                  };

                  // 4. Publish to the SAME destination as standard moves
                  stompClient?.publish({
                    destination: "/app/move", 
                    body: JSON.stringify(moveData)
                  });

                  // 5. Update local state
                  setBoard([...engineRef.current.getBoard()]);
                  setPromotion(null);
                  setDragged(null);
                }}
              />
            )}

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



            {/* {check && (
              <div className="check-indicator">
                {check === "WHITE" ? "WHITE" : "BLACK"} is in Check
              </div>
            )}
            {checkmate && (
              <div className="text-red-600" >
                CHECKMATE — {checkmate === "WHITE" ? "WHITE" : "BLACK"} lost
              </div>
            )} */}

        </div>
      </div>
    );

    // return (
    //     <div className="royal-container flex flex-col items-center">
    //         {/* 🏰 HEADER SECTION */}
    //         <div className="mb-8 text-center">
    //             <h1 className="text-3xl font-bold royal-text-gold mb-2">The Royal Match</h1>
    //             <div className="flex items-center gap-4 justify-center">
    //                 <span className="px-3 py-1 bg-[#c5a05922] border border-[#c5a059] rounded text-sm uppercase tracking-widest text-[#c5a059]">
    //                     {matchType || "Classic"}
    //                 </span>
    //                 <span className="text-[#888]">Room: {matchId?.split('-')[0]}</span>
    //             </div>
    //         </div>

    //         <div className="flex flex-col lg:flex-row gap-8 items-start justify-center w-full max-w-7xl">
                
    //             {/* 📜 LEFT COLUMN: Game Info & Timers */}
    //             <div className="w-full lg:w-72 flex flex-col gap-6 order-2 lg:order-1">
    //                 <div className="royal-panel">
    //                     <h2 className="royal-text-gold text-sm mb-4 border-b border-[#c5a05933] pb-2">Clocks</h2>
    //                     <GameTimer
    //                         whiteTimeMs={timer.whiteTimeMs}
    //                         blackTimeMs={timer.blackTimeMs}
    //                         turn={currentTurn}
    //                         result={timer.result}
    //                     />
    //                 </div>

    //                 <div className="royal-panel">
    //                     <h2 className="royal-text-gold text-sm mb-4 border-b border-[#c5a05933] pb-2">Status</h2>
    //                     <div className="space-y-4">
    //                         {check && (
    //                             <div className="animate-pulse py-2 px-3 bg-red-900/30 border border-red-700 text-red-200 rounded text-center">
    //                                 ⚔️ {check} is in Check
    //                             </div>
    //                         )}
    //                         {checkmate && (
    //                             <div className="py-4 px-3 bg-red-950 border-2 border-red-600 text-red-100 rounded text-center font-bold shadow-lg">
    //                                 👑 CHECKMATE — {checkmate} LOST
    //                             </div>
    //                         )}
    //                         {!check && !checkmate && (
    //                             <div className="text-center text-[#888] italic">
    //                                 It is {currentTurn.toLowerCase()}'s move...
    //                             </div>
    //                         )}
    //                     </div>
    //                 </div>
    //             </div>

    //             {/* ♟️ CENTER COLUMN: The Board */}
    //             <div className="relative order-1 lg:order-2">
    //                 <div className="royal-board-wrapper">
    //                     <BoardGrid
    //                         board={board}
    //                         size={size}
    //                         theme={CHESS_COM_GREEN} // You could create a ROYAL_GOLD theme later!
    //                         lastMove={lastMove}
    //                         selectedSquare={selectedSquare}
    //                         hoveredSquare={hoveredSquare}
    //                         setHoveredSquare={setHoveredSquare}
    //                         legalMoves={legalMoves}
    //                         orientation={orientation}
    //                         onDrop={onDrop}
    //                         onDragStart={onDragStart}
    //                         checkmate={checkmate}
    //                     />
    //                 </div>

    //                 {/* Promotion Modal Overlay */}
    //                 {promotion && (
    //                     <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm rounded-lg">
    //                         <div className="bg-[#2c2c2c] p-6 border-2 border-[#c5a059] rounded-xl shadow-2xl">
    //                             <h3 className="royal-text-gold text-center mb-4">Choose Your Rank</h3>
    //                             <PromotionModal
    //                                 color={promotion.color === "WHITE" ? "w" : "b" }
    //                                 onSelect={(piece) => {
    //                                     // ... (Your exact onSelect logic here)
    //                                 }}
    //                             />
    //                         </div>
    //                     </div>
    //                 )}
    //             </div>

    //             {/* 📖 RIGHT COLUMN: Move History */}
    //             <div className="w-full lg:w-80 order-3">
    //                 <div className="royal-panel h-[600px] flex flex-col">
    //                     <h2 className="royal-text-gold text-sm mb-4 border-b border-[#c5a05933] pb-2 text-center">The Chronicles</h2>
    //                     <div className="flex-1 overflow-hidden opacity-80 hover:opacity-100 transition-opacity">
    //                         <MoveHistory moves={moveHistory} />
    //                     </div>
    //                 </div>
    //             </div>
    //         </div>
    //     </div>
    // );
  }
