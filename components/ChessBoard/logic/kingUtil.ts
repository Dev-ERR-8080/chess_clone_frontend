export function findKing(
  board: (string | null)[][],
  color: "w" | "b"
) {
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (p && p[0] === color && p[1] === "K") {
        return { row: r, col: c };
      }
    }
  }
  return null;
}
