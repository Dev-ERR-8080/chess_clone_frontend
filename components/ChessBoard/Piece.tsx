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
  const isWhite = piece.startsWith('w');
  return (
    <div style={{ position: 'relative' }}>
      {/* Subtle "Glow" under the piece */}
      <div style={{
        position: 'absolute',
        bottom: -5,
        left: '10%',
        width: '80%',
        height: '20%',
        background: 'rgba(0,0,0,0.4)',
        filter: 'blur(8px)',
        borderRadius: '50%'
      }} />
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
    </div>
  );
}
