import { Chess } from "chess.js";
import { ChessEngine} from "./ChessEngine";
import { Square, LegalMove }from "./types"
import type { Square as ChessSquare } from "chess.js";

export class ChessJsEngine implements ChessEngine {
  private chess = new Chess();

  init(board: (string | null)[][]) {
    // optional: load from FEN later
  }

  getTurn() {
    return this.chess.turn();
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
    const move = this.chess.move({
      from:
        String.fromCharCode(97 + from.col) + (8 - from.row),
      to:
        String.fromCharCode(97 + to.col) + (8 - to.row),
      promotion: "q",
    });

    return !!move;
  }

  isCheckmate(color: "w" | "b"): boolean {
    if (this.chess.turn() !== color) return false;
    return this.chess.isCheckmate();
  }
  
  promotePawn(at: Square, piece: string): void {
      //no-op hanled during the move
  }

  getBoard(): (string | null)[][] {
    const board = this.chess.board(); 

    return board.map(row =>
      row.map(cell => {
        if (!cell) return null;
        return cell.color + cell.type.toUpperCase();
      })
    );
  }
  getHistory(): string[] {
      return [];
  }

}
