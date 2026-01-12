import { ChessEngine } from "./ChessEngine";
import { CustomEngine } from "./CustomEngine";
import { ChessJsEngine } from "./ChessJsEngine";

export function createEngine(type: "custom" | "chessjs"): ChessEngine {
  return type === "custom"
    ? new CustomEngine()
    : new ChessJsEngine();
}
