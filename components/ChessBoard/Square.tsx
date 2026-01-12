"use client";
import React from "react";
import Piece from "./Piece";
import {motion } from "framer-motion"
import { LegalMove } from "./types";


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
  const rankLabel = orientation === "white" ? 8 - row : row + 1;
  const fileLabel = orientation === "white" ? FILES[col] : FILES[7 - col];
  const showRank = orientation === "white" ? col === 0 : col === 7;
  const showFile = orientation === "white" ? row === 7 : row === 0;
  

  let animation;

  if (isMoveTarget && lastMove) {
    const dx = (lastMove.from.col - lastMove.to.col) * size;
    const dy = (lastMove.from.row - lastMove.to.row) * size;

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
            setHoveredSquare((prev: any) =>
                prev?.row === row && prev?.col === col
                ? prev
                : { row, col }
            );
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
        {showRank && (
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
        {showFile && (
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
