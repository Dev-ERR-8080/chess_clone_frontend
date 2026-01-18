import { ChessEngine } from "./ChessEngine";
import { Square, LegalMove } from "./types";
import { getPseudoLegalMoves } from "../logic/moveGenerator";
import { simulateMove } from "../logic/simulateMove";
import { isKingInCheck, isSquareAttacked } from "../logic/checkDetection";

export class CustomEngine implements ChessEngine {

  private board!: (string | null)[][];
  private turn: "WHITE" | "BLACK" = "WHITE";

  private castling = {
    wK: true,
    wQ: true,
    bK: true,
    bQ: true,
  };

  private enPassantSquare: string | null = null;

  private halfMoveClock = 0;
  private fullMoveNumber = 1;

  private history: string[] = [];

  init(board: (string | null)[][]) {
    this.board = board.map(r => [...r]);
    this.turn = "WHITE";
    this.enPassantSquare = null;
    this.halfMoveClock = 0;
    this.fullMoveNumber = 1;
    this.castling = { wK: true, wQ: true, bK: true, bQ: true };
  }

  getTurn() {
    return this.turn;
  }

  getBoard() {
    return this.board.map(r => [...r]);
  }

  getHistory() {
    return [...this.history];
  }

  getLegalMoves(from: Square): LegalMove[] {
    const piece = this.board[from.row][from.col];
    if (!piece) return [];
    const pieceColor = piece[0] === "w" ? "WHITE" : "BLACK";
    if (pieceColor !== this.turn) return [];


    const color = piece[0] ==="w" ? "WHITE" : "BLACK";
    const enemy = color === "WHITE" ? "BLACK" : "WHITE";

    const pseudo = getPseudoLegalMoves(this.board, from.row, from.col);

    let moves: LegalMove[] = pseudo.map(m => ({
      from,
      to: { row: m.row, col: m.col },
      capture: m.capture ?? false,
    }));

    // CASTLING
    if (piece[1] === "K") {
      const row = from.row;

      if (
        (color === "WHITE" ? this.castling.wK : this.castling.bK) &&
        !this.board[row][5] &&
        !this.board[row][6] &&
        !isSquareAttacked(this.board, row, 4, enemy) &&
        !isSquareAttacked(this.board, row, 5, enemy) &&
        !isSquareAttacked(this.board, row, 6, enemy)
      ) {
        moves.push({ from, to: { row, col: 6 }, capture: false });
      }

      if (
        (color === "WHITE" ? this.castling.wQ : this.castling.bQ) &&
        !this.board[row][1] &&
        !this.board[row][2] &&
        !this.board[row][3] &&
        !isSquareAttacked(this.board, row, 4, enemy) &&
        !isSquareAttacked(this.board, row, 3, enemy) &&
        !isSquareAttacked(this.board, row, 2, enemy)
      ) {
        moves.push({ from, to: { row, col: 2 }, capture: false });
      }
    }

    return moves.filter(m => {
      const next = simulateMove(this.board, from, m.to);
      return !isKingInCheck(next, this.turn);
    });
  }

  makeMove(from: Square, to: Square): boolean {
    const legal = this.getLegalMoves(from).some(
      m => m.to.row === to.row && m.to.col === to.col
    );
    if (!legal) return false;

    const piece = this.board[from.row][from.col];
    if (!piece) return false;

    const color = piece[0] ==="w" ? "WHITE" : "BLACK";
    const enemy = color === "WHITE" ? "BLACK" : "WHITE";

    const target = this.board[to.row][to.col];
    const isCapture = !!target;

    // halfmove clock
    if (piece[1] === "P" || isCapture) this.halfMoveClock = 0;
    else this.halfMoveClock++;

    // fullmove
    if (this.turn === "BLACK") this.fullMoveNumber++;

    // CASTLING RIGHTS
    if (piece[1] === "K") {
      if (color === "WHITE") {
        this.castling.wK = false;
        this.castling.wQ = false;
      } else {
        this.castling.bK = false;
        this.castling.bQ = false;
      }
    }

    if (piece[1] === "R") {
      if (color === "WHITE" && from.row === 7) {
        if (from.col === 0) this.castling.wQ = false;
        if (from.col === 7) this.castling.wK = false;
      }
      if (color === "BLACK" && from.row === 0) {
        if (from.col === 0) this.castling.bQ = false;
        if (from.col === 7) this.castling.bK = false;
      }
    }

    // CASTLING MOVE
    if (piece[1] === "K" && Math.abs(to.col - from.col) === 2) {
      if (to.col === 6) {
        this.board[from.row][5] = this.board[from.row][7];
        this.board[from.row][7] = null;
      }
      if (to.col === 2) {
        this.board[from.row][3] = this.board[from.row][0];
        this.board[from.row][0] = null;
      }
    }

    // EN PASSANT target
    if (piece[1] === "P" && Math.abs(to.row - from.row) === 2) {
      this.enPassantSquare =
        String.fromCharCode(97 + from.col) + (8 - (from.row + to.row) / 2);
    } else {
      this.enPassantSquare = null;
    }

    // MOVE PIECE
    this.board[to.row][to.col] = piece;
    this.board[from.row][from.col] = null;

    // PROMOTION
    let promotion: string | undefined;
    if (piece[1] === "P" && (to.row === 0 || to.row === 7)) {
      promotion = "Q";
    }

    // SWITCH TURN
    this.turn = enemy;

    const check = isKingInCheck(this.board, enemy);
    const mate = this.isCheckmate(enemy);

    const san = this.toSAN(from, to, piece, isCapture, promotion, undefined, check, mate);
    this.history.push(san);

    return true;
  }

  promotePawn(at: Square, piece: string) {
    const cur = this.board[at.row][at.col];
    if (!cur) return;
    this.board[at.row][at.col] = cur[0] + piece;
  }

  isCheckmate(color: "WHITE" | "BLACK") {
    if (!isKingInCheck(this.board, color)) return false;

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = this.board[r][c];
        if (!p) continue;
        const pc = p[0] === "w" ? "WHITE" : "BLACK";
        if (pc !== color) continue;
        if (this.getLegalMoves({ row: r, col: c }).length > 0) return false;
      }
    }
    return true;
  }

  getCastlingFen() {
    let s = "";
    if (this.castling.wK) s += "K";
    if (this.castling.wQ) s += "Q";
    if (this.castling.bK) s += "k";
    if (this.castling.bQ) s += "q";
    return s === "" ? "-" : s;
  }

  getFen() {
    let fen = "";

    for (let r = 0; r < 8; r++) {
      let empty = 0;
      for (let c = 0; c < 8; c++) {
        const p = this.board[r][c];
        if (!p) empty++;
        else {
          if (empty) { fen += empty; empty = 0; }
          let ch = p[1].toLowerCase();
          if (p[0] === "w") ch = ch.toUpperCase();
          fen += ch;
        }
      }
      if (empty) fen += empty;
      if (r !== 7) fen += "/";
    }

    fen += " " + (this.turn === "WHITE" ? "w" : "b");
    fen += " " + this.getCastlingFen();
    fen += " " + (this.enPassantSquare ?? "-");
    fen += " " + this.halfMoveClock;
    fen += " " + this.fullMoveNumber;

    return fen;
  }

  private toSAN(from: Square, to: Square, piece: string, capture?: boolean, promotion?: string, castling?: "K"|"Q", check?: boolean, mate?: boolean) {
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

  loadFen(Fen: string): void {
      
  }

  setTurn(t: "WHITE" | "BLACK"): void {
      this.turn= t
  }
}
