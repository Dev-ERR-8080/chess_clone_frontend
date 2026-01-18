"use client";
import ChessBoard from "@/components/ChessBoard/ChessBoard";
import { useMatch } from "@/lib/MatchContext";
import { useParams, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";

export default function Play(){
    const  {match,setMatch} = useMatch();
    const params = useParams();
    const matchId = params.id;
    useEffect(()=>{
        if(!match){
            fetch(`http://localhost:8080/matches/${matchId}`,{credentials:"include"})
            .then(r=>r.json())
            .then(data=>{
                // console.log("data from the api:"+data.matchId+data.color+data.mode);
                setMatch(data)
        });
        }
    },[]);
    console.log("match at match.tsx layer"+match?.matchId+match?.color+match?.mode);

    return(
        <div>
            <ChessBoard matchId={match?.matchId} color= {match?.color} matchType = {match?.mode}/>
            {/* <ChessBoard /> */}
        </div>
    )
}

