"use client";
import React from "react";
import {motion} from "framer-motion"

export default function Piece({
  piece,
  size,
  onDragStart,
  animation,
}: {
  piece: string;
  size: number;
  onDragStart: () => void;
  animation?: {
    fromX: number;
    fromY: number;
  };
}) {
  const src = `https://assets-themes.chess.com/image/ejgfv/150/${piece.toLowerCase()}.png`;

  return (
    <motion.img
      draggable
      onDragStart={onDragStart}
      src={src}
      alt={piece}
      initial={animation ? { x: animation.fromX, y: animation.fromY } : false}
      animate={{ x: 0, y: 0 }}
      transition={{
        duration:0.18,
        ease:[0.4, 0, 0.2, 1],
      }}
      style={{
        width: size * 0.9,
        height: size * 0.9,
        cursor: "grab",
        userSelect: "none",
        // pointerEvents:"none",    
        
      }}
      onMouseDown={() => onDragStart()}
    />
  );
}
