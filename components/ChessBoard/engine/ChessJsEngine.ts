import { Chess } from "chess.js";
import { ChessEngine} from "./ChessEngine";
import { Square, LegalMove }from "./types"
import type { Square as ChessSquare } from "chess.js";
import { Fence } from "lucide-react";

export class ChessJsEngine implements ChessEngine {
  private chess = new Chess();

  init(board: (string | null)[][]) {
    // Note: chess.js is usually initialized via FEN. 
    // If you need to load a specific board state, use this.chess.load(fen)
  }

  getTurn(): "WHITE" | "BLACK" {
    const turn = this.chess.turn();
    return turn === "w" ? "WHITE" : "BLACK";
  }

  getLegalMoves(from: Square): LegalMove[] {
    const square =
      String.fromCharCode(97 + from.col) + (8 - from.row) as ChessSquare;

    return this.chess.moves({ square, verbose: true }).map(m => ({
      from,
      to: {
        row: 8 - parseInt(m.to[1]),
        col: m.to.charCodeAt(0) - 97,
      },
      capture: !!m.captured,
    }));
  }

  makeMove(from: Square, to: Square): boolean {
    try {
        const move = this.chess.move({
          from: String.fromCharCode(97 + from.col) + (8 - from.row),
          to: String.fromCharCode(97 + to.col) + (8 - to.row),
          promotion: "q", // default to queen for simplicity
        });
        return !!move;
    } catch (e) {
        return false;
    }
  }

  isCheckmate(color: "WHITE" | "BLACK"): boolean {
    const chessJsColor = color === "WHITE" ? "w" : "b";
    if (this.chess.turn() !== chessJsColor) return false;
    return this.chess.isCheckmate();
  }
  
  promotePawn(at: Square, piece: string): void {
      // In chess.js, promotion is handled during the move call.
      // If you implement a separate promotion modal, you'd need to undo() 
      // the previous move and re-apply it with the correct promotion piece.
  }

  getBoard(): (string | null)[][] {
    const board = this.chess.board(); 

    return board.map(row =>
      row.map(cell => {
        if (!cell) return null;
        // Converts {color: 'w', type: 'p'} to 'wP'
        return cell.color + cell.type.toUpperCase();
      })
    );
  }

  // --- FIXED METHODS ---

  getHistory(): string[] {
    // Returns the history of moves in SAN format (e.g., ["e4", "d5", "exd5"])
    return this.chess.history();
  }

  getFen(): string {
    // Returns the full FEN string representing the current board state and turn
    return this.chess.fen();
  }

  loadFen(Fen:string): void {
      this.chess.load(Fen);
  }
  setTurn(t: "WHITE" | "BLACK"): void {
      this.chess.load(t)
  }
}