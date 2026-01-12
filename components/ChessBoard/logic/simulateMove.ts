export function simulateMove(
  board: (string | null)[][],
  from: { row: number; col: number },
  to: { row: number; col: number }
) {
  const copy = board.map((r) => [...r]);
  copy[to.row][to.col] = copy[from.row][from.col];
  copy[from.row][from.col] = null;
  return copy;
}
