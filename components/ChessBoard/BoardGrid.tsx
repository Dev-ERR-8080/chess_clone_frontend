"use client";
import React from "react";
import Square from "./Square";
import { LayoutGroup } from "framer-motion";

export default function BoardGrid({
  board,
  size,
  theme,
  onDrop,
  onDragStart,
  lastMove,
  selectedSquare,
  hoveredSquare,
  setHoveredSquare,
  legalMoves,
  orientation,
  checkmate
}: any) {
  const squareSize = size / 8;
  const rows = orientation === "white"
  ? [...Array(8).keys()]          // 0 → 7
  : [...Array(8).keys()].reverse(); // 7 → 0

  const cols = orientation === "white"
    ? [...Array(8).keys()]
    : [...Array(8).keys()].reverse();

  return (
    <LayoutGroup>
        <div
        style={{
            display: "grid",
            gridTemplateColumns: "repeat(8, 1fr)",
            width: size,
            height: size,
        }}
        >
            {/* {board.map((row: any[], r: number) =>
            row.map((piece, c) => (
            <Square
                key={`${r}-${c}`}
                row={r}
                col={c}
                piece={piece}
                size={squareSize}
                theme={theme}
                lastMove={lastMove}
                selectedSquare={selectedSquare}
                hoveredSquare={hoveredSquare}
                setHoveredSquare={setHoveredSquare}
                legalMoves={legalMoves}
                onDrop={onDrop}
                onDragStart={onDragStart}
            /> 
             ))
        )}   */}
            {rows.map((r) =>
                cols.map((c) => (
                    <Square
                    key={`${r}-${c}`}
                    row={r}
                    col={c}
                    piece={board[r][c]}
                    size={squareSize}
                    theme={theme}
                    lastMove={lastMove}
                    selectedSquare={selectedSquare}
                    hoveredSquare={hoveredSquare}
                    setHoveredSquare={setHoveredSquare}
                    legalMoves={legalMoves}
                    orientation={orientation}
                    checkmate={checkmate}
                    onDrop={onDrop}
                    onDragStart={onDragStart}
                    />
                ))
                )}
        </div>
    </LayoutGroup>
  );
}
