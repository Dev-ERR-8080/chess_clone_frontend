export type PieceCode = string | null;

export type BoardState = PieceCode[][];

export type BoardTheme = {
  lightSquare: string;
  darkSquare: string;
  lastMoveSquare?: string;
  highlightSquare?: string;
  hoverSquare?: string;
  checkMate?: string;
};

export type SquareCoord = {
  row: number;
  col: number;
};

export type UILegalMove = {
  to: SquareCoord;
  capture: boolean;
};

export type LastMove = {
  from: SquareCoord;
  to: SquareCoord;
} | null;

export type SelectedSquare = {
    row:number;
    col:number;
} | null;

export type HoveredSquare = {
    row:number;
    col:number;
} | null;

export type LegalMove = {
  row: number;
  col: number;
  capture?: boolean;
};

