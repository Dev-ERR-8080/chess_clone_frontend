import { findKing } from "./kingUtil";
import { getPseudoLegalMoves } from "./moveGenerator";

function isKingInCheck(
  board: (string | null)[][],
  color: "WHITE" | "BLACK"
): boolean {
  const kingPos = findKing(board, color);
  if (!kingPos) return false;

  const enemy = color === "WHITE" ? "BLACK" : "WHITE";

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (!piece) continue;
      const pieceColor = piece[0] === "w" ? "WHITE" : "BLACK";
      if (pieceColor !== enemy) continue;

      const moves = getPseudoLegalMoves(board, r, c);
      if (
        moves.some(
          (m) => m.row === kingPos.row && m.col === kingPos.col
        )
      ) {
        return true;
      }
    }
  }
  return false;
}

function isSquareAttacked(
  board:(string|null)[][],
  row:number,
  col:number,
  byColor:"WHITE"|"BLACK") {
  console.log("The Squre is under check you cant move")
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (!p) continue;
      const pieceColor = p[0] === "w" ? "WHITE" : "BLACK";
      if (pieceColor !== byColor) continue;

      const moves = getPseudoLegalMoves(board, r, c);
      if (moves.some(m => m.row === row && m.col === col)) {
        return true;
      }
    }
  }
  return false;
}

export{isKingInCheck,isSquareAttacked};