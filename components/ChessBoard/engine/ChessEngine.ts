import { LegalMove,Square } from "./types";

export interface ChessEngine {
  /** Called once on game start */
  init(board: (string | null)[][]): void;

  /** Legal moves for a piece */
  getLegalMoves(from: Square): LegalMove[];

  /** Validate + apply move */
  makeMove(from: Square, to: Square): boolean;

  /** Whose turn is it */
  getTurn(): "w" | "b";

  isCheckmate( color: "w"|"b"):boolean;

  promotePawn(at:Square, piece:string): void;
  
  getBoard(): (string | null)[][];

  getHistory():string[];

}
