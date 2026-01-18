export type Square = {
  row: number;
  col: number;
};

export function isInsideBoard(row: number, col: number) {
  return row >= 0 && row < 8 && col >= 0 && col < 8;
}

export function getColor(piece: string) {
  return piece[0] ==="w" ? "WHITE" : "BLACK";
}

export function getType(piece: string) {
  return piece[1] as "P" | "N" | "B" | "R" | "Q" | "K";
}
