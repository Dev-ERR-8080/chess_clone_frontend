import { isInsideBoard, getColor } from "./board";
import { PseudoMove } from "../engine/types";

export function slideMoves(
  board: (string | null)[][],
  row: number,
  col: number,
  directions: number[][]
): PseudoMove[] {
  const piece = board[row][col];
  if (!piece) return [];

  const color = getColor(piece);
  const moves: PseudoMove[] = [];

  for (const [dr, dc] of directions) {
    let r = row + dr;
    let c = col + dc;

    while (isInsideBoard(r, c)) {
      const target = board[r][c];

      if (!target) {
        // empty square
        moves.push({ row: r, col: c });
      } else {
        // occupied
        if (getColor(target) !== color) {
          moves.push({ row: r, col: c, capture: true });
        }
        break; // blocked after first piece
      }

      r += dr;
      c += dc;
    }
  }

  return moves;
}
