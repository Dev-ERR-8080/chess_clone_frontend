"use client";
import ChessBoard from "@/components/ChessBoard/ChessBoard";
import { useMatch } from "@/context/MatchContext";
import { useParams, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useUser } from "@/context/UserContext";

export default function Play(){
    const  {match,setMatch} = useMatch();
    const [loading,setLoading] = useState(true);
    const params = useParams();
    const {user} = useUser();
    let currentColor: "WHITE" | "BLACK";
    const matchId = params.id;
    useEffect(() => {
        async function fetchMatch() {
            try {
                const res = await fetch(`http://localhost:8080/game/match/${matchId}/metadata`, { credentials: "include" });
                const data = await res.json();
                // console.log("data from the api:"+data.matchId+data.color+data.mode);
                currentColor = data.whitePlayerId?.toString() === user?.userId?.toString() ? "WHITE" : "BLACK";
                setMatch({
                    ...data,
                    matchId: matchId,
                    gameType: data.mode,
                    color: currentColor
                });
            } catch (err) {
                console.error("Error fetching match data:", err);
            } finally {
                setLoading(false);
            }
        }
        if (user?.userId) fetchMatch();
    }, [params.id, user?.userId]);

    if(loading || !match){
        return(
            <div className="flex items-center justify-center h-screen">
                <p>Loading Match...</p>
            </div>
        )
    }
    console.log("match at match.tsx layer"+match?.matchId+match?.color+match?.gameType);

    return(
        <div>
            { loading && <p>Loading Match...</p> }

        {!loading && <ChessBoard matchId={match?.matchId} color= {match?.color} matchType = {match?.gameType}/>}
            
        </div>
    )
}

