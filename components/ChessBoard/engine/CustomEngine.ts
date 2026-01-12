import { ChessEngine } from "./ChessEngine";
import { Square, LegalMove, PseudoMove } from "./types";
import { getPseudoLegalMoves } from "../logic/moveGenerator";
import { simulateMove } from "../logic/simulateMove";
import { isKingInCheck,isSquareAttacked } from "../logic/checkDetection";



export class CustomEngine implements ChessEngine {
  private board!: (string | null)[][];
  private turn: "w" | "b" = "w";
  private castling = {
    w: { king: true, queen: true },
    b: { king: true, queen: true },
  };
  private enPassant: { row: number; col: number } | null =  null;
  private history: string[] = [];

  init(board: (string | null)[][]) {
    this.board = board.map(r => [...r]);
    this.turn = "w";
  }

  getTurn() {
    return this.turn;
  }

  getLegalMoves(from: Square): LegalMove[] {
    const piece = this.board[from.row][from.col];
    if (!piece || piece[0] !== this.turn) return [];

    const color = piece[0] as "w" | "b";

    // 1. Pseudo moves
    const pseudo = getPseudoLegalMoves(
      this.board,
      from.row,
      from.col
    );

    // 2. Convert to UI/legal format
    let moves: LegalMove[] = pseudo.map((m) => ({
      from,
      to: { row: m.row, col: m.col },
      capture: m.capture ?? false,
    }));

    // 3. Castling
    if (piece[1] === "K") {
      const row = from.row;
      const enemy = color === "w" ? "b" : "w";

      // king side
      if (
        this.castling[color].king &&
        !this.board[row][5] &&
        !this.board[row][6] &&
        !isSquareAttacked(this.board, row, 4, enemy) &&
        !isSquareAttacked(this.board, row, 5, enemy) &&
        !isSquareAttacked(this.board, row, 6, enemy)
      ) {
        moves.push({
          from,
          to: { row, col: 6 },
          capture: false,
        });

      }

      // queen side
      if (
        this.castling[color].queen &&
        !this.board[row][1] &&
        !this.board[row][2] &&
        !this.board[row][3] &&
        !isSquareAttacked(this.board, row, 4, enemy) &&
        !isSquareAttacked(this.board, row, 3, enemy) &&
        !isSquareAttacked(this.board, row, 2, enemy)
      ) {
        moves.push({
          from,
          to: { row, col: 2 },
          capture: false,
        });
      }
      
    }

    // 4. En passant
    if (piece[1] === "P" && this.enPassant) {
      const dir = color === "w" ? -1 : 1;

      if (
        from.row + dir === this.enPassant.row &&
        Math.abs(from.col - this.enPassant.col) === 1
      ) {
        moves.push({
          from,
          to: {
            row: this.enPassant.row,
            col: this.enPassant.col,
          },
          capture: true,
        });
      }
    }

    // 5. King safety filter
    // console.log("LEGAL", moves);

    return moves.filter((move) => {
      const nextBoard = simulateMove(this.board, from, move.to);
      return !isKingInCheck(nextBoard, this.turn);
    });
  }




  makeMove(from: Square, to: Square): boolean {
    const legalMoves = this.getLegalMoves(from);

    const isLegal = legalMoves.some(
      (m) => m.to.row === to.row && m.to.col === to.col
    );
    if (!isLegal) return false;

    const piece = this.board[from.row][from.col];
    if (!piece) return false;

    const color = piece[0] as "w" | "b";
    const enemyColor = color === "w" ? "b" : "w";

    const targetPiece = this.board[to.row][to.col];
    const isCapture = targetPiece !== null || (piece[1] === "P" && this.enPassant && this.enPassant.row === to.row && this.enPassant.col === to.col);

    // --- Castling side detection ---
    let castlingSide: "K" | "Q" | undefined;

    // --- Update castling rights ---
    if (piece[1] === "K") {
      this.castling[color].king = false;
      this.castling[color].queen = false;
    }

    if (piece[1] === "R") {
      if (from.col === 0) this.castling[color].queen = false;
      if (from.col === 7) this.castling[color].king = false;
    }

    // --- Execute castling rook move ---
    if (piece[1] === "K" && Math.abs(to.col - from.col) === 2) {
      if (to.col === 6) {
        this.board[from.row][5] = this.board[from.row][7];
        this.board[from.row][7] = null;
        castlingSide = "K";
      }
      if (to.col === 2) {
        this.board[from.row][3] = this.board[from.row][0];
        this.board[from.row][0] = null;
        castlingSide = "Q";
      }
    }

    // --- En passant capture ---
    if (
      piece[1] === "P" &&
      this.enPassant &&
      to.row === this.enPassant.row &&
      to.col === this.enPassant.col
    ) {
      const dir = color === "w" ? 1 : -1;
      this.board[to.row + dir][to.col] = null;
    }

    // --- En passant target update ---
    if (piece[1] === "P" && Math.abs(to.row - from.row) === 2) {
      this.enPassant = {
        row: (to.row + from.row) / 2,
        col: from.col,
      };
    } else {
      this.enPassant = null;
    }

    // --- Normal move ---
    this.board[to.row][to.col] = piece;
    this.board[from.row][from.col] = null;

    // --- Promotion flag ---
    let promotion: string | undefined;
    if (piece[1] === "P" && (to.row === 0 || to.row === 7)) {
      promotion = "Q"; // UI can override later
    }

    // --- Switch turn ---
    this.turn = enemyColor;

    // --- Check & Mate after move ---
    const isCheck = isKingInCheck(this.board, enemyColor);
    const isMate = this.isCheckmate(enemyColor);

    // --- SAN ---
    const san = this.toSAN(
      from,
      to,
      piece,
      !!isCapture,
      promotion,
      castlingSide,
      isCheck,
      isMate
    );

    this.history.push(san);

    return true;
  }

  
  isCheckmate(color: "w" | "b"):boolean {
    if (!isKingInCheck(this.board, color)) return false;

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = this.board[r][c];
        if (!p || p[0] !== color) continue;

        const moves = this.getLegalMoves({ row: r, col: c });
        if (moves.length > 0) return false;
      }
    }

    return true;
  }
  promotePawn(at: Square, piece: string): void {
    const current = this.board[at.row][at.col];

    if (!current || current[1] !== "P") return;

    const color = current[0];
    this.board[at.row][at.col] = color + piece;
  }


  getBoard() {
    return this.board.map(r => [...r]);
  }

  private toSAN(from: Square, to: Square, piece: string, capture?: boolean, promotion?: string, castling?: "K"|"Q", check?: boolean, mate?: boolean) {
    if (castling === "K") return "O-O";
    if (castling === "Q") return "O-O-O";

    const pieceChar = piece[1] === "P" ? "" : piece[1];
    let san = pieceChar;

    if (piece[1] === "P" && capture) san = String.fromCharCode(97 + from.col);

    if (capture) san += "x";

    san += String.fromCharCode(97 + to.col) + (8 - to.row);

    if (promotion) san += "=" + promotion;

    if (mate) san += "#";
    else if (check) san += "+";

    return san;
  }
  

  getHistory(){
    return [...this.history];
  }

}
