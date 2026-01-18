"use client";
import React from "react";
import Square from "./Square";
import { LayoutGroup } from "framer-motion";
import { preconnect } from "react-dom";

// export default function BoardGrid({
//   board,
//   size,
//   theme,
//   onDrop,
//   onDragStart,
//   lastMove,
//   selectedSquare,
//   hoveredSquare,
//   setHoveredSquare,
//   legalMoves,
//   orientation,
//   checkmate
// }: any) {
//   const squareSize = size / 8;
//   const rows = [...Array(8).keys()];
//   const cols = [...Array(8).keys()];

//   return (
//     <LayoutGroup>
//         <div
//         style={{
//             display: "grid",
//             gridTemplateColumns: "repeat(8, 1fr)",
//             width: size,
//             height: size,
//         }}
//         >
//             {/* {board.map((row: any[], r: number) =>
//             row.map((piece, c) => (
//             <Square
//                 key={`${r}-${c}`}
//                 row={r}
//                 col={c}
//                 piece={piece}
//                 size={squareSize}
//                 theme={theme}
//                 lastMove={lastMove}
//                 selectedSquare={selectedSquare}
//                 hoveredSquare={hoveredSquare}
//                 setHoveredSquare={setHoveredSquare}
//                 legalMoves={legalMoves}
//                 onDrop={onDrop}
//                 onDragStart={onDragStart}
//             /> 
//              ))
//         )}   */}
//             {rows.map((r) =>
//                 cols.map((c) => (
//                     <Square
//                     key={`${r}-${c}`}
//                     row={r}
//                     col={c}
//                     piece={board[r][c]}
//                     size={squareSize}
//                     theme={theme}
//                     lastMove={lastMove}
//                     selectedSquare={selectedSquare}
//                     hoveredSquare={hoveredSquare}
//                     setHoveredSquare={setHoveredSquare}
//                     legalMoves={legalMoves}
//                     orientation={orientation}
//                     checkmate={checkmate}
//                     onDrop={onDrop}
//                     onDragStart={onDragStart}
//                     />
//                 ))
//                 )}
//         </div>
//     </LayoutGroup>
//   );
// }

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
  orientation, // "WHITE" or "BLACK"
  checkmate
}: any) {
  const squareSize = size / 8;
  
  // Create arrays 0-7
  const baseRange = [...Array(8).keys()];
  // console.log("orientation recived at boardgrid level: "+orientation);
  
  // Flip the arrays if orientation is black
  const rows = orientation === "WHITE" ? baseRange : [...baseRange].reverse();
  const cols = orientation === "WHITE" ? baseRange : [...baseRange].reverse();

  return (
    <LayoutGroup>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(8, 1fr)",
          width: size,
          height: size,
          // If using CSS Grid, we don't need to manually calculate visualRow
          // because the order of elements in the DOM determines position
        }}
      >
        {rows.map((r) =>
          cols.map((c) => (
            <Square
              key={`${r}-${c}`}
              row={r}      // Actual data index
              col={c}      // Actual data index
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