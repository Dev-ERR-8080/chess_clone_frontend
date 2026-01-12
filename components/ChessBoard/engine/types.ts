export type Square = {
  row: number;
  col: number;
};

export type PseudoMove = {
  row: number;
  col: number;
  capture?: boolean;
};

export type LegalMove = {
  from: Square;
  to: Square;
  capture?: boolean;
};

export interface MoveContext {
  from: Square;
  to: Square;
  piece: string;
  capture: boolean;
  promotion?: string;
  castling?: "K" | "Q";
  check: boolean;
  checkmate: boolean;
}
