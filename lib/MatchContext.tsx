"use client";

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
  useEffect,
} from "react";

// ================= TYPES =================

export type MatchType = "BLITZ" | "CLASSIC" | "RAPID" | "BULLET";

export interface MatchData {
  matchId: string;
  color: "WHITE" | "BLACK";
  mode: MatchType;
  opponentName: string;
  initialFen: string;
}

export interface MatchContextType {
  match: MatchData | null;
  setMatch: (data: MatchData) => void;
  clearMatch: () => void;
}

// ================= CONTEXT =================

const MatchContext = createContext<MatchContextType | undefined>(undefined);

// ================= PROVIDER =================

export function MatchProvider({ children }: { children: ReactNode }) {
  const [match, setMatchState] = useState<MatchData | null>(null);

  const setMatch = useCallback((data: MatchData) => {
    setMatchState(data);
  }, []);

  const clearMatch = useCallback(() => {
    setMatchState(null);
  }, []);

  return (
    <MatchContext.Provider value={{ match, setMatch, clearMatch }}>
      {children}
    </MatchContext.Provider>
  );
}



// ================= HOOK =================

export function useMatch() {
  const context = useContext(MatchContext);
  if (!context) {
    throw new Error("useMatch must be used inside MatchProvider");
  }
  return context;
}
