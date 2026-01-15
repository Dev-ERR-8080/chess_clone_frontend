// context/MatchContext.tsx
"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';


// types/match.ts
export interface MatchData {
  matchId: string;
  color: 'white' | 'black';
  matchType : 'BLITZ' | 'CLASSIC' | 'RAPID' | 'BULLET'; 
  opponentName?: string;
  initialFen?: string;
}

export interface MatchContextType {
  match: MatchData | null;
  setMatch: (data: MatchData | null) => void;
  clearMatch: () => void;
}

const MatchContext = createContext<MatchContextType | undefined>(undefined);

export function MatchProvider({ children }: { children: ReactNode }) {
  const [match, setMatch] = useState<MatchData | null>(null);

  const clearMatch = () => setMatch(null);

  return (
    <MatchContext.Provider value={{ match, setMatch, clearMatch }}>
      {children}
    </MatchContext.Provider>
  );
}

// Custom hook for easy access
export function useMatch() {
  const context = useContext(MatchContext);
  if (context === undefined) {
    throw new Error('useMatch must be used within a MatchProvider');
  }
  return context;
}