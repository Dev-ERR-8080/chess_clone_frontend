"use client";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface TimerResult  {
  draw: boolean;
  winner: string;
  reason: string
 };

interface TimerProps {
  whiteTimeMs: number;
  blackTimeMs: number;
  turn: "WHITE" | "BLACK";
  result?: TimerResult | null;
}

export default function GameTimer({ whiteTimeMs, blackTimeMs, turn, result }: TimerProps) {
  const [white, setWhite] = useState(whiteTimeMs);
  const [black, setBlack] = useState(blackTimeMs);

  // 🔄 SYNC: Whenever the server sends a fresh TICK, overwrite local state
  useEffect(() => { setWhite(whiteTimeMs); }, [whiteTimeMs]);
  useEffect(() => { setBlack(blackTimeMs); }, [blackTimeMs]);

  // 🚀 SMOOTHNESS: Local sub-tick every 100ms to prevent "choppy" UI
  // Add a check to ensure we don't tick if it's not our turn to be smooth
  useEffect(() => {
    if (result || !turn) return;

    const subTick = setInterval(() => {
      if (turn === "WHITE") {
        setWhite((prev) => (prev > 0 ? prev - 100 : 0));
      } else {
        setBlack((prev) => (prev > 0 ? prev - 100 : 0));
      }
    }, 100);

    return () => clearInterval(subTick);
  }, [turn, result]); // Re-syncs only when turn changes

  const format = (ms: number) => {
    const s = Math.ceil(ms / 1000); // Use ceil for standard chess clock feel
    const m = Math.floor(s / 60);
    const r = s % 60;
    return `${m}:${r.toString().padStart(2, "0")}`;
  };

  if (result) {
    return (
      <motion.div 
        initial={{ y: -20, opacity: 0 }} 
        animate={{ y: 0, opacity: 1 }}
        className="text-center p-4 bg-[#1a1a1a] border-2 border-[#c5a059] rounded-xl shadow-2xl"
      >
        <h2 className={`text-xl font-bold ${result.draw ? 'text-yellow-500' : 'text-[#c5a059]'}`}>
          {result.draw ? "STALEMATE" : `${result.winner} VICTORIOUS`}
        </h2>
        <p className="text-xs uppercase tracking-widest text-gray-500 mt-1">{result.reason}</p>
      </motion.div>
    );
  }

  return (
    <div className="flex justify-center gap-10 font-mono">
      {/* White Clock */}
      <div className={`transition-all duration-300 p-3 rounded-lg border-b-4 ${turn === "WHITE" ? "bg-[#2c2c2c] border-green-600 scale-110" : "bg-black/40 border-transparent opacity-60"}`}>
         <span className="text-xs block text-gray-500 mb-1">WHITE</span>
         <span className="text-2xl font-bold text-white">♔ {format(white)}</span>
      </div>

      {/* Black Clock */}
      <div className={`transition-all duration-300 p-3 rounded-lg border-b-4 ${turn === "BLACK" ? "bg-[#2c2c2c] border-green-600 scale-110" : "bg-black/40 border-transparent opacity-60"}`}>
         <span className="text-xs block text-gray-500 mb-1">BLACK</span>
         <span className="text-2xl font-bold text-white">♚ {format(black)}</span>
      </div>
    </div>
  );
}