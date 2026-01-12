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

const initialBoard = [
  ["bR","bN","bB","bQ","bK","bB","bN","bR"],
  ["bP","bP","bP","bP","bP","bP","bP","bP"],
  ...Array.from({ length: 4 }, () => Array(8).fill(null)),
  ["wP","wP","wP","wP","wP","wP","wP","wP"],
  ["wR","wN","wB","wQ","wK","wB","wN","wR"],
];

export default function ChessBoard({ size = 560 }) {
  const [board, setBoard] = useState(initialBoard);
  const [dragged, setDragged] = useState<any>(null);
  const [lastMove, setLastMove] = useState<LastMove>(null);
  const [selectedSquare, setSelectedSquare] = useState<SelectedSquare>(null);
  const [hoveredSquare, setHoveredSquare] = useState<HoveredSquare>(null);
  const [legalMoves, setLegalMoves] = useState<UILegalMove[]>([]);
  const [orientation, setOrientation] = useState<"white" | "black">("white");
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


  function onDragStart(r: number, c: number, piece: string) {
    if(gameOver) return;
    
    if (piece[0] !== engineRef.current.getTurn()) {
        return; // do nothing
    }
    
    setDragged({ r, c, piece });
    setSelectedSquare({ row: r, col: c });
    // check logic from or custom engine.
    const engineMoves = engineRef.current.getLegalMoves({row: r, col: c, });

    const normalizedMoves = engineMoves.map((m) => ({ to: m.to, capture: m.capture ?? false, }));

    // console.log("[UI] legal moves:", normalizedMoves);
    
    setLegalMoves(normalizedMoves);
  }
  


//   function onDrop(r: number, c: number) {
//     if (!dragged) return;

//     const from = { row: dragged.r, col: dragged.c, };
//     const to = { row: r, col: c };
    
//     const success = engineRef.current.makeMove( from, to );

//     const copy = board.map(row => [...row]);
//     copy[dragged.r][dragged.c] = null;
//     copy[r][c] = dragged.piece;


//     if (!success) {
//         setDragged(null);
//         setSelectedSquare(null);
//         setLegalMoves([]);
//         return;
//     }

//     // Update UI board
//     const newBoard = board.map(row => [...row]);
//     newBoard[from.row][from.col] = null;
//     newBoard[to.row][to.col] = dragged.piece;

//     setBoard(newBoard);
//     setLastMove({ from, to });
//     setDragged(null);
//     setSelectedSquare(null);
//     setLegalMoves([]);
//   }
  function onDrop(r: number, c: number) {
    if (!dragged) return;

    const from = { row: dragged.r, col: dragged.c };
    const to = { row: r, col: c };

    const success = engineRef.current.makeMove(from, to);
    const nextTurn = engineRef.current.getTurn();

    if(success){
      if (engineRef.current.isCheckmate(nextTurn)) {
        // console.log("CHECKMATE", nextTurn);
        setCheckmate(nextTurn);
        setGameOver(true)
        
      }else if (isKingInCheck(board,orientation=="white" ? "w" : "b")) {
        console.log("CHECK");
        setCheck(nextTurn)
      }else{
        setCheck(null)
      }
    }

    // Always clear UI state
    setHoveredSquare(null);
    setSelectedSquare(null);
    setLegalMoves([]);

    if (!success) {
        setDragged(null);
        return;
    }
    // Pawn promotion trigger
    if (
      dragged.piece[1] === "P" &&
      (to.row === 0 || to.row === 7)
    ) {
      // Let engine move pawn first
      engineRef.current.makeMove(from, to);

      // Now trigger promotion UI
      setPromotion({
        row: to.row,
        col: to.col,
        color: dragged.piece[0],
      });

      // 🔥 UI MUST refresh from engine
      setBoard(engineRef.current.getBoard());

      return; // ⛔ STOP normal UI update
    }


    const newBoard = board.map(r => [...r]);

      // Move king normally
      newBoard[from.row][from.col] = null;
      newBoard[to.row][to.col] = dragged.piece;

      // CASTLING: move rook in UI
      if (dragged.piece[1] === "K" && Math.abs(to.col - from.col) === 2) {

        // king side
        if (to.col === 6) {
          newBoard[from.row][5] = board[from.row][7];
          newBoard[from.row][7] = null;
        }

        // queen side
        if (to.col === 2) {
          newBoard[from.row][3] = board[from.row][0];
          newBoard[from.row][0] = null;
        }
      }
    

    
    setMoveHistory(engineRef.current.getHistory());
    setBoard(newBoard);
    setLastMove({ from, to });
    setDragged(null);
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
            // 1. Update the Engine first
            // You'll need a method in your engine like 'promotePawn'
            engineRef.current.promotePawn({row:promotion.row, col: promotion.col}, piece[1]);

            // 2. Update the UI Board
            const newBoard = board.map(r => [...r]);
            newBoard[promotion.row][promotion.col] = piece;
            
            setBoard(newBoard);
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


          <button 
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
          </button>

      </div>
    </div>
  );
}
