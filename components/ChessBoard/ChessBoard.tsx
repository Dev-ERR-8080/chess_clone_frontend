// "use client";
// import React, { useEffect, useRef, useState } from "react";
// import BoardGrid from "./BoardGrid";
// import { CHESS_COM_GREEN } from "@/components/ChessBoard/Theme";
// import { HoveredSquare, LastMove, LegalMove, SelectedSquare, UILegalMove } from "./types";
// import { getPseudoLegalMoves } from "./moveGenerator";
// import { createEngine } from "./engine/engineFactory";
// import { isKingInCheck } from "./logic/checkDetection";
// import PromotionModal from "./logic/promotion";
// import MoveHistory from "../ui/history";
// import { createChessSocket } from "@/hooks/chessSocket";
// import SockJS from "sockjs-client";
// import { Client } from "@stomp/stompjs";
// import { BLACK, WHITE } from "chess.js";

// const initialBoard = [
//   ["bR","bN","bB","bQ","bK","bB","bN","bR"],
//   ["bP","bP","bP","bP","bP","bP","bP","bP"],
//   ...Array.from({ length: 4 }, () => Array(8).fill(null)),
//   ["wP","wP","wP","wP","wP","wP","wP","wP"],
//   ["wR","wN","wB","wQ","wK","wB","wN","wR"],
// ];

// export default function ChessBoard({ size = 560, matchId,color}) {
//   const [board, setBoard] = useState(initialBoard);
//   const [dragged, setDragged] = useState<any>(null);
//   const [lastMove, setLastMove] = useState<LastMove>(null);
//   const [selectedSquare, setSelectedSquare] = useState<SelectedSquare>(null);
//   const [hoveredSquare, setHoveredSquare] = useState<HoveredSquare>(null);
//   const [legalMoves, setLegalMoves] = useState<UILegalMove[]>([]);
//   const [orientation, setOrientation] = useState<"white" | "black">(color==="w"?"white":"black");
//   const [check, setCheck] = useState<"w" | "b" | null>(null);
//   const [checkmate, setCheckmate] = useState<"w" | "b" | null>(null);
//   const [promotion, setPromotion] = useState<{ row: number; col: number; color: "w" | "b" } | null>(null);
//   const [gameOver, setGameOver] = useState(false);
//   const [moveHistory, setMoveHistory] = useState<string[]>([]);
//   const engineRef = useRef(
//     createEngine("custom") // ← switch here only
//     );

//     useEffect(() => {
//     engineRef.current.init(board);
//   }, []);
//   const socketRef = useRef< Client | null >(null);
  
//   useEffect(() => {
//     const socket = new SockJS("http://localhost:8080/ws");
//     const client = new Client({
//       webSocketFactory: () => socket,
//       reconnectDelay: 5000,
//     });

//     client.onConnect = () => {
//       client.subscribe(`/topic/match/${matchId}`, (msg) => {
//         const move = JSON.parse(msg.body);
//         applyMove(move);
//       });
//     };

//     client.activate();

//     return () => client.deactivate();
//   }, [matchId]);

 
//   function handleRemoteMove(move:any){
//     engineRef.current.makeMove(
//       { row: move.fromRow, col: move.fromCol },
//       { row: move.toRow, col: move.toCol }
//     );

//     setBoard(engineRef.current.getBoard());
//   }



//   function onDragStart(r: number, c: number, piece: string) {
//     if(gameOver) return;
    
//     if (piece[0] !== engineRef.current.getTurn()) {
//         return; 
//     }
    
//     setDragged({ r, c, piece });
//     setSelectedSquare({ row: r, col: c });
//     // check logic from or custom engine.
//     const engineMoves = engineRef.current.getLegalMoves({row: r, col: c, });

//     const normalizedMoves = engineMoves.map((m) => ({ to: m.to, capture: m.capture ?? false, }));

//     // console.log("[UI] legal moves:", normalizedMoves);
    
//     setLegalMoves(normalizedMoves);
//   }
  
//   function onDrop(r: number, c: number) {
//     if (!dragged) return;

//     const from = { row: dragged.r, col: dragged.c };
//     const to = { row: r, col: c };

//     const success = engineRef.current.makeMove(from, to);
//     const nextTurn = engineRef.current.getTurn();

//     if(success){
//       if (engineRef.current.isCheckmate(nextTurn)) {
//         // console.log("CHECKMATE", nextTurn);
//         setCheckmate(nextTurn);
//         setGameOver(true)
        
//       }else if (isKingInCheck(board,orientation=="white" ? "w" : "b")) {
//         console.log("CHECK");
//         setCheck(nextTurn)
//       }else{
//         setCheck(null)
//       }
//     }

//     // Always clear UI state
//     setHoveredSquare(null);
//     setSelectedSquare(null);
//     setLegalMoves([]);

//     if (!success) {
//         setDragged(null);
//         return;
//     }
//     // Pawn promotion trigger
//     if (
//       dragged.piece[1] === "P" &&
//       (to.row === 0 || to.row === 7)
//     ) {
//       // Let engine move pawn first
//       engineRef.current.makeMove(from, to);

//       // Now trigger promotion UI
//       setPromotion({
//         row: to.row,
//         col: to.col,
//         color: dragged.piece[0],
//       });

//       // 🔥 UI MUST refresh from engine
//       setBoard(engineRef.current.getBoard());

//       return; // ⛔ STOP normal UI update
//     }


//     const newBoard = board.map(r => [...r]);

//       // Move king normally
//       newBoard[from.row][from.col] = null;
//       newBoard[to.row][to.col] = dragged.piece;

//       // CASTLING: move rook in UI
//       if (dragged.piece[1] === "K" && Math.abs(to.col - from.col) === 2) {

//         // king side
//         if (to.col === 6) {
//           newBoard[from.row][5] = board[from.row][7];
//           newBoard[from.row][7] = null;
//         }

//         // queen side
//         if (to.col === 2) {
//           newBoard[from.row][3] = board[from.row][0];
//           newBoard[from.row][0] = null;
//         }
//       }
    
//       socketRef.current?.publish({
//         destination:"/app/move",
//         body:JSON.stringify({
//           matchId,
//           fromRow: from.row,
//           fromCol: from.col,
//           toRow: to.row,
//           toCol: to.col,
//           san,
//           uci: san, // or real uci
//           fenBefore:"",
//           fenAfter:""
//         })
//       });
    
//     setMoveHistory(engineRef.current.getHistory());
//     setBoard(newBoard);
//     setLastMove({ from, to });
//     setDragged(null);
//     }


//   return (
//     <div className="justify-center">
//     <div>
//         {/* <button
//             onClick={() =>
//                 setOrientation(o => (o === "white" ? "black" : "white"))
//             }
//             style={{
//                 marginBottom: 12,
//                 padding: "6px 12px",
//                 borderRadius: 6,
//                 background: "#333",
//                 color: "#fff",
//                 cursor: "pointer",
//             }}
//             >
//             Flip Board
//         </button> */}
//         {promotion &&<PromotionModal
//           color={promotion.color}
//           onSelect={(piece) => {
//             // 1. Update the Engine first
//             // You'll need a method in your engine like 'promotePawn'
//             engineRef.current.promotePawn({row:promotion.row, col: promotion.col}, piece[1]);

//             // 2. Update the UI Board
//             const newBoard = board.map(r => [...r]);
//             newBoard[promotion.row][promotion.col] = piece;
            
//             setBoard(newBoard);
//             setPromotion(null);
//           }}
//         />}

//       </div>
//       <div id="chess board" className="m-4 justify-around gap-5 align-middle flex flex-row">
          
//           <BoardGrid
//               board={board}
//               size={size}
//               theme={CHESS_COM_GREEN}
//               lastMove={lastMove}
//               selectedSquare={selectedSquare}
//               hoveredSquare={hoveredSquare}
//               setHoveredSquare={setHoveredSquare}
//               legalMoves={legalMoves}
//               orientation={orientation}
//               onDrop={onDrop}
//               onDragStart={onDragStart}
//               checkmate={checkmate}
//           />
//           <MoveHistory moves={moveHistory} />
          
//       </div>
//       <div>



//           {check && (
//             <div className="check-indicator">
//               {check === "w" ? "White" : "Black"} is in Check
//             </div>
//           )}
//           {checkmate && (
//             <div className="text-red-600" >
//               CHECKMATE — {checkmate === "w" ? "White" : "Black"} lost
//             </div>
//           )}


//           <button 
//               onClick={()=>
//                       window.location.reload()
//               }
//               style={{
//                   marginBottom: 12,
//                   padding: "6px 12px",
//                   borderRadius: 6,
//                   background: "#333",
//                   color: "#fff",
//                   cursor: "pointer",
//                   margin:"5px"
//               }}>
//                   Reset the game
//           </button>

//       </div>
//     </div>
//   );
// }


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
  const [board, setBoard] = useState(initialBoard);
  const [dragged, setDragged] = useState<any>(null);
  const [lastMove, setLastMove] = useState<LastMove>(null);
  const [selectedSquare, setSelectedSquare] = useState<SelectedSquare>(null);
  const [hoveredSquare, setHoveredSquare] = useState<HoveredSquare>(null);
  const [legalMoves, setLegalMoves] = useState<UILegalMove[]>([]);
  const [orientation, setOrientation] = useState<"white" | "black">(color==="w"?"white":"black");
  const [check, setCheck] = useState<"w" | "b" | null>(null);
  const [checkmate, setCheckmate] = useState<"w" | "b" | null>(null);
  const [promotion, setPromotion] = useState<{ row: number; col: number; color: "w" | "b" } | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const engineRef = useRef(
    createEngine("custom") // ← switch here only
    );

    useEffect(() => {
    engineRef.current.init(board);
  }, []);
  const socketRef = useRef< Client | null >(null);
  
  useEffect(() => {
    const socket = new SockJS("http://localhost:8080/ws");
    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
    });

    client.onConnect = () => {
      console.log("GAME WS CONNECTED");

      client.subscribe(`/topic/match/${matchId}`, (msg) => {
        const move = JSON.parse(msg.body);
        handleRemoteMove(move);
      });
    };

    client.activate();
    socketRef.current = client;

    return () => {
      if (socketRef.current) {
      socketRef.current.deactivate(); // NOT awaited
      }
    };
  }, [matchId]);


 
  function handleRemoteMove(move: any) {
    
    engineRef.current.makeMove(
      { row: move.fromRow, col: move.fromCol },
      { row: move.toRow, col: move.toCol }
    );

    setBoard(engineRef.current.getBoard());
    setLastMove({
      from: { row: move.fromRow, col: move.fromCol },
      to: { row: move.toRow, col: move.toCol }
    });

    console.log(move);
    setMoveHistory(engineRef.current.getHistory());
  }




  function onDragStart(r: number, c: number, piece: string) {
    if (gameOver) return;

    const playerColor = color; // "w" | "b"
    const pieceColor = piece[0];
    const engineTurn = engineRef.current.getTurn(); // "w" | "b"

    // ❌ Not your piece
    if (pieceColor !== playerColor) return;

    // ❌ Not your turn
    if (engineTurn !== playerColor) return;

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
    
    // const nextTurn = engineRef.current.getTurn();

    // if (engineRef.current.isCheckmate(nextTurn)) {
    //   setCheckmate(nextTurn);
    //   setGameOver(true);
    // } else if (isKingInCheck(engineRef.current.getBoard(), nextTurn)) {
    //   setCheck(nextTurn);
    // } else {
    //   setCheck(null);
    // }
    if (!success) {
      setDragged(null);
      return;
    }


    setHoveredSquare(null);
    setSelectedSquare(null);
    setLegalMoves([]);


    const san = engineRef.current.getHistory().slice(-1)[0];

    // Promotion trigger
    if (dragged.piece[1] === "P" && (to.row === 0 || to.row === 7)) {
      setPromotion({
        row: to.row,
        col: to.col,
        color: dragged.piece[0],
      });
      setDragged(null);
      return;
    }

    console.log("Match id: "+matchId+" fromRow: "+ from.row+" fromCol: "+ from.col+ " toRow: "+ to.row+" toCol: "+ to.col+" san: "+san+
        " uci: "+ `${from.col}${from.row}${to.col}${to.row}`);

    socketRef.current?.publish({
      destination: "/app/match/move",
      body: JSON.stringify({
        matchId,
        fromRow: from.row,
        fromCol: from.col,
        toRow: to.row,
        toCol: to.col,
        san,
        uci: `${from.col}${from.row}${to.col}${to.row}`
      })
      

    });

    // setBoard(engineRef.current.getBoard());
    // setMoveHistory(engineRef.current.getHistory());
    // setLastMove({ from, to });
    // setDragged(null);
  }


  return (
    <div className="justify-center">
    <div>
        {/* <button
            onClick={() =>
                setOrientation(o => (o === "white" ? "black" : "white"))
            }
            style={{
                marginBottom: 12,
                padding: "6px 12px",
                borderRadius: 6,
                background: "#333",
                color: "#fff",
                cursor: "pointer",
            }}
            >
            Flip Board
        </button> */}
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
              {check === "w" ? "White" : "Black"} is in Check
            </div>
          )}
          {checkmate && (
            <div className="text-red-600" >
              CHECKMATE — {checkmate === "w" ? "White" : "Black"} lost
            </div>
          )}


          {/* <button 
              onClick={()=>
                      window.location.reload()
              }
              style={{
                  marginBottom: 12,
                  padding: "6px 12px",
                  borderRadius: 6,
                  background: "#333",
                  color: "#fff",
                  cursor: "pointer",
                  margin:"5px"
              }}>
                  Reset the game
          </button> */}

      </div>
    </div>
  );
}
