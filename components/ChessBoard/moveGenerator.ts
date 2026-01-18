import { BoardState } from "./types";

export function getPseudoLegalMoves(
  board: BoardState,
  row: number,
  col: number
) {
  const piece = board[row][col];
  if (!piece) return [];

  const moves: any[] = [];
  const isWhite = piece[0] === "w";
  const type = piece[1];

  // Pawn (simple demo logic)
  if (type === "P") {
    const dir = isWhite ? -1 : 1;
    const nextRow = row + dir;

    // forward
    if (board[nextRow]?.[col] === null) {
      moves.push({ row: nextRow, col });
    }

    // captures
    for (const dc of [-1, 1]) {
      const target = board[nextRow]?.[col + dc];
      const pieceColor = piece[0] === "w" ? "WHITE" : "BLACK";
      const targetColor = target ? (target[0] === "w" ? "WHITE" : "BLACK") : null;

      if (target && targetColor !== pieceColor) {
        moves.push({
          row: nextRow,
          col: col + dc,
          capture: true,
        });
      }
    }
  }

  // Knight (full UI-safe)
  if (type === "N") {
    const jumps = [
      [2, 1], [2, -1], [-2, 1], [-2, -1],
      [1, 2], [1, -2], [-1, 2], [-1, -2],
    ];

    for (const [dr, dc] of jumps) {
      const r = row + dr;
      const c = col + dc;
      const pieceColor = piece[0] === "w" ? "WHITE" : "BLACK";
      const targetPiece = board[r]?.[c];
      const targetColor = targetPiece ? (targetPiece[0] === "w" ? "WHITE" : "BLACK") : null;
      if (!targetPiece) {
        moves.push({ row: r, col: c });
      } 
      else if (targetColor !== pieceColor) {
        moves.push({ row: r, col: c, capture: true });
      }
    }
  }

  return moves;
}
