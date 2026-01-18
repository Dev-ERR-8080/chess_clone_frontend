import { PseudoMove } from "../engine/types";
import { getColor, isInsideBoard } from "./board";
import { slideMoves } from "./slideMoves";

// Rook
export function rookMoves(
  board: (string | null)[][],
  row: number,
  col: number
) {
  const directions = [
    [1, 0],  // down
    [-1, 0], // up
    [0, 1],  // right
    [0, -1], // left
  ];

  return slideMoves(board, row, col, directions);
}

// Bishop
export function bishopMoves(
  board: (string | null)[][],
  row: number,
  col: number
) {
  const directions = [
    [1, 1],
    [1, -1],
    [-1, 1],
    [-1, -1],
  ];

  return slideMoves(board, row, col, directions);
}

// Queen = rook + bishop
export function queenMoves(
  board: (string | null)[][],
  row: number,
  col: number
) {
  return [
    ...rookMoves(board, row, col),
    ...bishopMoves(board, row, col),
  ];
}

export function pawnMoves(
  board: (string | null)[][],
  row: number,
  col: number
): PseudoMove[] {
  const piece = board[row][col];
  if (!piece) return [];

  const color = getColor(piece);
  const dir = color === "WHITE" ? -1 : 1;
  const startRow = color === "WHITE" ? 6 : 1;

  const moves: PseudoMove[] = [];

  // 1-step forward
  const oneStep = row + dir;
  if (isInsideBoard(oneStep, col) && !board[oneStep][col]) {
    moves.push({ row: oneStep, col });

    // 2-step forward (first move only)
    const twoStep = row + dir * 2;
    if (
      row === startRow &&
      isInsideBoard(twoStep, col) &&
      !board[twoStep][col]
    ) {
      moves.push({ row: twoStep, col });
    }
  }

  for (const dc of [-1, 1]) {
    const r = row + dir;
    const c = col + dc;

    if (
      isInsideBoard(r, c) &&
      board[r][c] &&
      getColor(board[r][c]!) !== color
    ) {
      moves.push({
        row: r,
        col: c,
        capture: true, 
      });
    }
    
  }
  
  // console.log(moves);
  return moves;
}


export function knightMoves(
  board: (string | null)[][],
  row: number,
  col: number
) {
  const piece = board[row][col];
  if (!piece) return [];

  const color = getColor(piece);
  const jumps = [
    [2, 1], [2, -1], [-2, 1], [-2, -1],
    [1, 2], [1, -2], [-1, 2], [-1, -2],
  ];

  const moves: any[] = [];

  for (const [dr, dc] of jumps) {
    const r = row + dr;
    const c = col + dc;
    if (!isInsideBoard(r, c)) continue;

    if (!board[r][c] || getColor(board[r][c]!) !== color) {
      moves.push({
        row: r,
        col: c,
        capture: !!board[r][c],
      });
    }
  }

  return moves;
}

export function kingMoves(
  board: (string | null)[][],
  row: number,
  col: number
): PseudoMove[] {
  const piece = board[row][col];
  if (!piece) return [];

  const color = getColor(piece);
  const moves: PseudoMove[] = [];

  const directions = [
    [1, 0], [-1, 0], [0, 1], [0, -1],
    [1, 1], [1, -1], [-1, 1], [-1, -1],
  ];

  for (const [dr, dc] of directions) {
    const r = row + dr;
    const c = col + dc;

    if (!isInsideBoard(r, c)) continue;
    

    if (!board[r][c]) {
      moves.push({ row: r, col: c });
    } else if (getColor(board[r][c]!) !== color) {
      moves.push({ row: r, col: c, capture: true });
    }
  }
  return moves

}

