"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface TimerProps {
  whiteTimeMs: number;
  blackTimeMs: number;
  turn: "WHITE" | "BLACK";
  result?: {
    draw: boolean;
    winner?: "WHITE" | "BLACK";
    reason?: string;
  } | null;
}


export default function GameTimer({
  whiteTimeMs,
  blackTimeMs,
  turn,
  result
}: TimerProps) {

  const [white, setWhite] = useState(whiteTimeMs);
  const [black, setBlack] = useState(blackTimeMs);

  useEffect(() => {
    setWhite(whiteTimeMs);
  }, [whiteTimeMs]);

  useEffect(() => {
    setBlack(blackTimeMs);
  }, [blackTimeMs]);

  const format = (ms:number)=>{
    const s = Math.max(0, Math.floor(ms/1000));
    const m = Math.floor(s/60);
    const r = s%60;
    return `${m}:${r.toString().padStart(2,"0")}`;
  };

  // 🏁 GAME FINISHED UI
  if(result){
    return (
      <motion.div
        initial={{scale:0.6,opacity:0}}
        animate={{scale:1,opacity:1}}
        className="text-center p-6 bg-black text-white rounded-xl"
      >
        {result.draw ? (
          <h2 className="text-2xl font-bold text-yellow-400">DRAW</h2>
        ):(
          <h2 className="text-2xl font-bold text-green-400">
            {result.winner} WON
          </h2>
        )}
        <p className="text-sm mt-2">Reason: {result.reason}</p>
      </motion.div>
    );
  }

  return (
    <div className="flex justify-between gap-6 text-white">

      {/* White Timer */}
      <motion.div
        animate={{
          scale: turn==="WHITE" ? 1.1 : 1,
          color: turn==="WHITE" ? "#22c55e" : "#fff"
        }}
        className="bg-gray-900 px-4 py-2 rounded-lg"
      >
        ♔ {format(white)}
      </motion.div>

      {/* Black Timer */}
      <motion.div
        animate={{
          scale: turn==="BLACK" ? 1.1 : 1,
          color: turn==="BLACK" ? "#22c55e" : "#fff"
        }}
        className="bg-gray-900 px-4 py-2 rounded-lg"
      >
        ♚ {format(black)}
      </motion.div>

    </div>
  );
}
