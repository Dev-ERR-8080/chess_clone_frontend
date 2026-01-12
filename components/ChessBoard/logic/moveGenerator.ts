import { getType } from "./board";
import {
  pawnMoves,
  knightMoves,
  rookMoves,
  bishopMoves,
  queenMoves,
  kingMoves
} from "./pieceRules";
import { PseudoMove } from "../engine/types";

export function getPseudoLegalMoves(
  board: (string | null)[][],
  row: number,
  col: number
): PseudoMove[] {
  const piece = board[row][col];
  if (!piece) return [];

  switch (getType(piece)) {
    case "P":
      return pawnMoves(board, row, col);
    case "N":
      return knightMoves(board, row, col);
    case "R":
      return rookMoves(board, row, col);
    case "B":
      return bishopMoves(board, row, col);
    case "Q":
      return queenMoves(board, row, col);
    case "K":
        return kingMoves(board,row,col);
    default:
      return [];
  }
}
