"use client";
import React from "react";
import Piece from "./Piece";
import {motion } from "framer-motion"


// export default function Square({
//   row,
//   col,
//   piece,
//   size,
//   theme,
//   onDrop,
//   onDragStart,
//   lastMove,
//   selectedSquare:isSelected,
//   hoveredSquare:isHovered,
//   setHoveredSquare,
//   orientation,
//   legalMoves,
//   checkmate
// }: any) {
//   const isDark = (row + col) % 2 === 1;

//   const isLastMove = lastMove && ((lastMove.from.row === row && lastMove.from.col === col) || (lastMove.to.row === row && lastMove.to.col === col));
//   const isSelectedSquare = isSelected && isSelected.row === row && isSelected.col === col;
//   const isHoveredSquare = isHovered && isHovered.row === row && isHovered.col === col; 
//   const isMoveTarget = lastMove && lastMove.to.row === row && lastMove.to.col === col;

//   const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"];

//   const rankLabel = 8 - row;
//   const fileLabel = FILES[col];
       
//   const showRank = col === 0;
//   const showFile = row === 7;

//   const isVisuallyFirstCol = orientation === "WHITE" ? col === 0 : col === 7;
//   const isVisuallyLastRow = orientation === "WHITE" ? row === 7 : row === 0;

//   let animation;

//   if (isMoveTarget && lastMove) {
//     // If orientation is black, the visual axis is inverted
//     const orientationFactor = orientation === "BLACK" ? -1 : 1;
    
//     const dx = (lastMove.from.col - lastMove.to.col) * size * orientationFactor;
//     const dy = (lastMove.from.row - lastMove.to.row) * size * orientationFactor;

//     animation = { fromX: dx, fromY: dy };
//   }
  
//   const legalMove = legalMoves.find(
//     (m: { to: { row: any; col: any; }; }) => m.to.row === row && m.to.col === col
//     );



//   if (legalMove?.capture) {
//   // console.log(
//   //   `[CAPTURE SQUARE ${row},${col}]`,
//   //   legalMove
//   // );
//   }

//   const squareStyle = {
//     width: size,
//     height: size,
//     position: "relative",
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "center",
//     // Material simulation
//     background: isDark 
//       ? "linear-gradient(145deg, #111 0%, #000 100%)" // Deep Obsidian
//       : "linear-gradient(145deg, #fff 0%, #e0e0e0 100%)", // Polished Porcelain
//     boxShadow: isDark 
//       ? "inset 0 0 15px rgba(255,255,255,0.05)" 
//       : "inset 0 0 15px rgba(0,0,0,0.1)",
//   };


//   return (
//     <div
//       onDragOver={(e) => {
//             e.preventDefault();
//             setHoveredSquare({ row, col });
//         }}

//       onDrop={() => onDrop(row, col)}
//       style={{
//         width: size,
//         height: size,
//         position: "relative",
//         display: "flex",
//         alignItems: "center",
//         justifyContent: "center",
//         // Material simulation
//         background: isDark 
//           ? "linear-gradient(145deg, #111 0%, #000 100%)" // Deep Obsidian
//           : "linear-gradient(145deg, #fff 0%, #e0e0e0 100%)", // Polished Porcelain
//         boxShadow: isDark 
//           ? "inset 0 0 15px rgba(255,255,255,0.05)" 
//           : "inset 0 0 15px rgba(0,0,0,0.1)",
//       }}
//     >

//         {/* Last Move Highlight */}
//         {isLastMove &&(
//             <div
//             style={{
//                 position: "absolute",
//                 inset: 0,
//                 backgroundColor: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 50%)',
//                 zIndex: 1,
//                 pointerEvents: "none",
//             }}
//             />
//         )}

//         {/* Drag-over highlight */}
//         {isHoveredSquare && (
//             <div
//             style={{
//                 position: "absolute",
//                 inset: 0,
//                 backgroundColor: theme.hoverSquare,
//                 zIndex: 2,
//                 pointerEvents: "none",
//             }}
//             />
//           )}
          
//         {/* Legal move dot */}
//         {legalMove && !legalMove.capture && (
//         <div
//             style={{
//             position: "absolute",
//             width: size * 0.25,
//             height: size * 0.25,
//             borderRadius: "50%",
//             backgroundColor: "rgba(0,0,0,0.25)",
//             zIndex: 2,
//             pointerEvents: "none",
//             }}
//         />
//         )}

//         {/* Capture ring */}
//         {legalMove && legalMove.capture && (
//         <div
//             style={{
//             position: "absolute",
//             inset: 10,
//             borderRadius: "50%",
//             border: "4px solid rgba(0,0,0,0.35)",
//             zIndex: 2,//temp change from 2
//             pointerEvents: "none",
//             }}
//         />
//         )}

//         {/* Selected Square Highlight */}
//         {isSelectedSquare && (
//             <div
//                 style={{
//                     position: "absolute",
//                     inset: 2,
//                     border: `3px solid ${theme.highlightSquare}`,
//                     borderRadius: 6,
//                     zIndex: 3,
//                     pointerEvents: "none",
//                 }}
//             />
//         )}
        
//         {/* Rank (1–8) */}
//         {isVisuallyFirstCol && (
//         <div
//             style={{
//             position: "absolute",
//             top: 4,
//             left: 4,
//             fontSize: 12,
//             fontWeight: 600,
//             color: isDark ? "#eeeed2" : "#769656",
//             zIndex: 5,
//             pointerEvents: "none",
//             }}
//         >
//             {rankLabel}
//         </div>
//         )}

//         {/* File (a–h) */}
//         {isVisuallyLastRow && (
//         <div
//             style={{
//             position: "absolute",
//             bottom: 4,
//             right: 4,
//             fontSize: 12,
//             fontWeight: 600,
//             color: isDark ? "#eeeed2" : "#769656",
//             zIndex: 5,
//             pointerEvents: "none",
//             }}
//         >
//             {fileLabel}
//         </div>
//         )}
        

     
        
//       {piece && (
//         <motion.div 
//         layout
//         style={{
//             position: "relative",
//             zIndex: 4,
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "center",
//             filter: "drop-shadow(0 10px 10px rgba(0,0,0,0.5))"
//         }}
        
//         >
//         <Piece
//           piece={piece}
//           size={size}
//           animation={animation}
//           onDragStart={() => onDragStart(row, col, piece)}
//         />
//         </motion.div>
//       )}
//     </div>
//   );
// }
export default function Square({
  row,
  col,
  piece,
  size,
  theme,
  onDrop,
  onDragStart,
  lastMove,
  selectedSquare:isSelected,
  hoveredSquare:isHovered,
  setHoveredSquare,
  orientation,
  legalMoves,
  checkmate
}: any) {
  const isDark = (row + col) % 2 === 1;

  const isLastMove = lastMove && ((lastMove.from.row === row && lastMove.from.col === col) || (lastMove.to.row === row && lastMove.to.col === col));
  const isSelectedSquare = isSelected && isSelected.row === row && isSelected.col === col;
  const isHoveredSquare = isHovered && isHovered.row === row && isHovered.col === col; 
  const isMoveTarget = lastMove && lastMove.to.row === row && lastMove.to.col === col;

  const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"];

  const rankLabel = 8 - row;
  const fileLabel = FILES[col];
       
  const showRank = col === 0;
  const showFile = row === 7;

  const isVisuallyFirstCol = orientation === "WHITE" ? col === 0 : col === 7;
  const isVisuallyLastRow = orientation === "WHITE" ? row === 7 : row === 0;

  let animation;

  if (isMoveTarget && lastMove) {
    // If orientation is black, the visual axis is inverted
    const orientationFactor = orientation === "BLACK" ? -1 : 1;
    
    const dx = (lastMove.from.col - lastMove.to.col) * size * orientationFactor;
    const dy = (lastMove.from.row - lastMove.to.row) * size * orientationFactor;

    animation = { fromX: dx, fromY: dy };
  }
  
  const legalMove = legalMoves.find(
    (m: { to: { row: any; col: any; }; }) => m.to.row === row && m.to.col === col
    );



  if (legalMove?.capture) {
  // console.log(
  //   `[CAPTURE SQUARE ${row},${col}]`,
  //   legalMove
  // );
}



  return (
    <div
      onDragOver={(e) => {
            e.preventDefault();
            setHoveredSquare({ row, col });
        }}

      onDrop={() => onDrop(row, col)}
      style={{
        width: size,
        height: size,
        backgroundColor: isDark
          ? theme.darkSquare
          : theme.lightSquare,
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >

        {/* Last Move Highlight */}
        {isLastMove &&(
            <div
            style={{
                position: "absolute",
                inset: 0,
                backgroundColor: theme.lastMoveSquare,
                zIndex: 1,
                pointerEvents: "none",
            }}
            />
        )}

        {/* Drag-over highlight */}
        {isHoveredSquare && (
            <div
            style={{
                position: "absolute",
                inset: 0,
                backgroundColor: theme.hoverSquare,
                zIndex: 2,
                pointerEvents: "none",
            }}
            />
          )}
          
        {/* Legal move dot */}
        {legalMove && !legalMove.capture && (
        <div
            style={{
            position: "absolute",
            width: size * 0.25,
            height: size * 0.25,
            borderRadius: "50%",
            backgroundColor: "rgba(0,0,0,0.25)",
            zIndex: 2,
            pointerEvents: "none",
            }}
        />
        )}

        {/* Capture ring */}
        {legalMove && legalMove.capture && (
        <div
            style={{
            position: "absolute",
            inset: 10,
            borderRadius: "50%",
            border: "4px solid rgba(0,0,0,0.35)",
            zIndex: 2,//temp change from 2
            pointerEvents: "none",
            }}
        />
        )}

        {/* Selected Square Highlight */}
        {isSelectedSquare && (
            <div
                style={{
                    position: "absolute",
                    inset: 2,
                    border: `3px solid ${theme.highlightSquare}`,
                    borderRadius: 6,
                    zIndex: 3,
                    pointerEvents: "none",
                }}
            />
        )}
        
        {/* Rank (1–8) */}
        {isVisuallyFirstCol && (
        <div
            style={{
            position: "absolute",
            top: 4,
            left: 4,
            fontSize: 12,
            fontWeight: 600,
            color: isDark ? "#eeeed2" : "#769656",
            zIndex: 5,
            pointerEvents: "none",
            }}
        >
            {rankLabel}
        </div>
        )}

        {/* File (a–h) */}
        {isVisuallyLastRow && (
        <div
            style={{
            position: "absolute",
            bottom: 4,
            right: 4,
            fontSize: 12,
            fontWeight: 600,
            color: isDark ? "#eeeed2" : "#769656",
            zIndex: 5,
            pointerEvents: "none",
            }}
        >
            {fileLabel}
        </div>
        )}

     
        
      {piece && (
        <motion.div 
        layout
        style={{
            position: "relative",
            zIndex: 4,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
        }}
        
        >
        <Piece
          piece={piece}
          size={size}
          animation={animation}
          onDragStart={() => onDragStart(row, col, piece)}
        />
        </motion.div>
      )}
    </div>
  );
}
