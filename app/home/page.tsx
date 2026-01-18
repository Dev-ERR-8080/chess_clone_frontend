
'use client';
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button-lovable";
import {
  Crown,
  Zap,
  Trophy,
  Users,
  Clock,
  Target,
  Swords,
  ChevronRight,
  Star,
  TrendingUp,
  Gamepad2,
  BookOpen,
  Bot,
  Flame,
  Crosshair,
  ChevronDown
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import { useMatch } from "@/lib/MatchContext";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ok } from "assert";
import { cookies } from "next/headers";


interface User {
  userId?: number;
  username?: string;
  email?: string;
  role?: string;
  pfpUrl?: string;
  name?: string;
  country?: string | null;
  profilePicture?: string;
}

type MatchMode= "BLITZ" | "CLASSIC" | "RAPID" | "BULLET"; 

const Index = () => {
  const [isSearching, setIsSearching] = useState(false);
  const [timer, setTimer] = useState<number | null>(null);
  const [matchId, setMatchId] = useState<string | null>(null);
  const [color, setColor] = useState<string | null>(null);
  const [selectedMode, setSelectedMode] = useState<MatchMode>("CLASSIC");
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string>("");
  const [isLoggedIn,setIsLoggedIn] = useState<boolean>(false);

  const {setMatch} = useMatch();
  const router = useRouter();

  const startTimer = (seconds: number) => {
    setTimer(seconds);
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev && prev > 0) return prev - 1;
        clearInterval(interval);
        return null;
      });
    }, 1000);
  };

  const showBoard = (id:string, playerColor:string) => {
    console.log("Showing board...", { id,playerColor });
  };

 useEffect(() => {
    const init = async () => {
      try {
        const response = await fetch("http://localhost:8080/user/me", {
          credentials: "include",
        });

        if (!response.ok) {
          setIsLoggedIn(false)
          throw new Error("Unauthorized");
        }

        const userData = await response.json();
        setUser(userData);
        setIsLoggedIn(true)

        const socket = new SockJS("http://localhost:8080/ws");
        const client = new Client({
          webSocketFactory: () => socket,
          reconnectDelay: 5000,
        });

        client.onConnect = () => {
          console.log("WS connected");

          client.subscribe(`/topic/match/${userData.userId}`, (msg) => {
            const resData = JSON.parse(msg.body);
            console.log("MATCH FOUND:", resData);
            setMatch(resData);
            router.push(`/match/${resData.matchId}`);
            // showBoard(resData.matchId,data.color);  
          });
        };

        client.activate();
      } catch (err) {
        console.error("Init error", err);
      }
    };

    init();
  }, []);

  const checkLogin = async () => {
    try {
      const res = await fetch("http://localhost:8080/user/me", {
        method: "GET",
        credentials: "include",
        headers: { "Accept": "application/json" }
      });
      const data = await res.json();
      console.log("User Data:", data);
      return data;
    } catch (err) {
      console.error("Failed to check login", err);
    }
  };



  const startGame = async () => {
    setIsSearching(true);
    const res = await fetch("http://localhost:8080/matchmaking/start", { 
      method: "POST",
      credentials:"include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mode: selectedMode
      }) 
    });
    const data = await res.json();

    if (data.status === "WAITING") {
      startTimer(90) 
    } 
  };

  const recentGames = [
    { opponent: "Magnus_Fan", result: "win", elo: "+12", time: "5 min ago" },
    { opponent: "ChessWizard", result: "loss", elo: "-8", time: "1 hour ago" },
    { opponent: "Rookie2024", result: "draw", elo: "+2", time: "2 hours ago" },
  ];

  const leaderboard = [
    { rank: 1, name: "DrNykterstein", elo: 3245, country: "🇳🇴" },
    { rank: 2, name: "Hikaru", elo: 3198, country: "🇺🇸" },
    { rank: 3, name: "FabianoCaruana", elo: 3156, country: "🇺🇸" },
    { rank: 4, name: "Firouzja2003", elo: 3142, country: "🇫🇷" },
    { rank: 5, name: "LiemLe", elo: 3089, country: "🇻🇳" },
  ];

  const friendsOnline = [
    { name: "Bobby_Fischer_Fan", status: "In Game", elo: 1856 },
    { name: "QueenGambit", status: "Online", elo: 2104 },
    { name: "PawnStorm", status: "Online", elo: 1654 },
  ];

  const timeModes = [
    { label: "classic", mode:"CLASSIC" ,time: "∞", icon: Crown, color: "text-yellow" },
    { label: "Bullet", mode: "BULLET" , time: "1 min", icon: Zap, color: "text-chess-fire" },
    { label: "Blitz", mode:"BLITZ" ,time: "3 min", icon: Flame, color: "text-chess-ember" },
    { label: "Rapid", mode:"RAPID" ,time: "10 min", icon: Target, color: "text-chess-gold" },
  ];

  

  const handleLogout = async (): Promise<any> => {
    const res = await fetch("http://localhost:8080/auth/logout", { 
      method: "POST",
      credentials:"include",
      headers: { "Content-Type": "application/json" },
    });
    if(res.status === 200){
        setIsLoggedIn(false);
    }
    
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}

      <header className="border-b border-border/50 bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg gamer-gradient flex items-center justify-center shadow-neon">
              <Crown className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-xl tracking-tight text-glow">GRAND<span className="text-[#F9551D]">MASTERS</span></span>
          </div>
          
          <nav className="hidden md:flex items-center gap-8">
            <a href="#" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
              <Crosshair className="w-4 h-4 text-primary" /> Play
            </a>
            <a href="#" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Puzzles</a>
            <a href="#" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Learn</a>
            <a href="#" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Watch</a>
          </nav>

          { !isLoggedIn &&  <a className="font-bold text-sm" href="/login">Login</a>}            
          { isLoggedIn &&<div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary border-glow">
              <Trophy className="w-4 h-4 text-chess-gold" />
              <span className="font-bold text-sm">1847</span>
            </div>
              <DropdownMenu>
                {/* 1. The button that opens the menu */}
                <DropdownMenuTrigger className="flex gap-2">
                  <Button variant="ghost" className="h-auto p-0 hover:bg-transparent">
                      <img
                        className="rounded-full"
                        src={user?.pfpUrl}
                        alt="Profile image"
                        width={40}
                        height={40}
                        aria-hidden="true"
                      />
                  </Button>
                  <ChevronDown size={16} strokeWidth={2} className="ms-2 opacity-60" aria-hidden="true" />
                </DropdownMenuTrigger>

                {/* 2. The floating container */}
                <DropdownMenuContent className="bg-black">
                  {/* 3. Non-clickable heading */}
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  
                  {/* 4. Horizontal line */}
                  <DropdownMenuSeparator />

                  {/* 5. Clickable items */}
                  <DropdownMenuItem >Profile</DropdownMenuItem>
                  <DropdownMenuItem>Billing</DropdownMenuItem>
                  <DropdownMenuItem>Clan</DropdownMenuItem>
                  
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem className="text-destructive text-red-500" onClick ={handleLogout} >
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>         
          </div>}
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Play Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Play Card */}
            <div className="bg-card rounded-xl p-8 shadow-soft border-glow relative overflow-hidden">
              {/* Subtle gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-chess-ember/5 pointer-events-none" />
              
              <div className="relative flex flex-col items-center text-center mb-8">
                <div className="w-20 h-20 rounded-xl gamer-gradient flex items-center justify-center mb-4 shadow-glow animate-float">
                  <Swords className="w-10 h-10 text-white" />
                </div>
                <h1 className="font-display font-bold text-3xl mb-2 text-glow">READY TO BATTLE?</h1>
                <p className="text-muted-foreground max-w-md">
                  Challenge players worldwide. Choose your arena and dominate.
                </p>
              </div>

              {/* Time Controls */}
              <div className="grid grid-cols-4 gap-2 mb-6">
                {timeModes.map((mode) => (
                  <button
                    key={mode.mode}
                    onClick={() => {
                      setSelectedMode(mode.mode as MatchMode)
                      
                    }}
                    className={`group flex flex-col items-center gap-2 p-4 rounded-lg transition-all duration-300 ${
                      selectedMode === mode.mode 
                        ? 'bg-primary/20 border-glow shadow-neon' 
                        : 'bg-secondary hover:bg-secondary/80 border border-transparent hover:border-primary/30'
                    }`}
                  >
                    <mode.icon className={`w-6 h-6 ${selectedMode === mode.mode ? mode.color : 'text-muted-foreground'} transition-colors`} />
                    <span className={`font-display font-semibold text-sm ${selectedMode === mode.mode ? 'text-primary' : ''}`}>{mode.label}</span>
                    <span className="text-xs text-muted-foreground">{mode.time}</span>
                  </button>
                ))}
              </div>

              {/* Play Button */}
              <Button
                variant="play"
                size="xl"
                className="w-full"
                onClick={startGame}
                disabled={isSearching}
              >
                {isSearching ? (
                  <div className="flex items-center gap-3">
                    <Flame className="w-5 h-5 animate-pulse" />
                    <span className="text-[#F9551D]">FINDING OPPONENT{timer !== null ? ` (${timer}s)` : '...'}</span>
                  </div>
                ) : (
                  <>
                    <Gamepad2 className="w-5 h-5 " />
                    <span className="text-pretty">PLAY NOW</span>
                  </>
                )}
              </Button>

              {/* Quick Actions */}
              <div className="flex items-center justify-center gap-6 mt-6 pt-6 border-t border-border/50">
                <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                  <Bot className="w-4 h-4" />
                  vs Computer
                </button>
                <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                  <Users className="w-4 h-4" />
                  Challenge Friend
                </button>
              </div>
            </div>

            {/* Recent Games */}
            <div className="bg-card rounded-xl p-6 shadow-soft border-glow">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display font-semibold text-lg flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" /> Recent Battles
                </h2>
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
                  View All <ChevronRight className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-3">
                {recentGames.map((game, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors border border-transparent hover:border-primary/20"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${
                        game.result === 'win' ? 'bg-chess-win shadow-[0_0_8px_hsl(120_60%_45%/0.5)]' : 
                        game.result === 'loss' ? 'bg-chess-loss shadow-[0_0_8px_hsl(0_70%_50%/0.5)]' : 'bg-chess-silver'
                      }`} />
                      <span className="font-medium">{game.opponent}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`text-sm font-bold ${
                        game.result === 'win' ? 'text-chess-win' : 
                        game.result === 'loss' ? 'text-chess-loss' : 'text-muted-foreground'
                      }`}>
                        {game.elo}
                      </span>
                      <span className="text-xs text-muted-foreground">{game.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Daily Puzzle */}
            <div className="bg-card rounded-xl p-6 shadow-soft border-glow">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-chess-gold/20 to-chess-ember/20 flex items-center justify-center border border-chess-gold/30">
                  <BookOpen className="w-8 h-8 text-chess-gold" />
                </div>
                <div className="flex-1">
                  <h2 className="font-display font-semibold text-lg mb-1">Daily Challenge</h2>
                  <p className="text-sm text-muted-foreground">White to move. Find the killer move.</p>
                </div>
                <Button variant="soft" size="sm" className="border border-primary/30">
                  Solve <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Leaderboard */}
            <div className="bg-card rounded-xl p-6 shadow-soft border-glow">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display font-semibold text-lg flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" /> Leaderboard
                </h2>
              </div>

              <div className="space-y-2">
                {leaderboard.map((player) => (
                  <div
                    key={player.rank}
                    className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                      player.rank <= 3 ? 'bg-secondary/50' : ''
                    } hover:bg-secondary`}
                  >
                    <span className={`w-7 h-7 flex items-center justify-center rounded-md text-xs font-bold ${
                      player.rank === 1 ? 'gamer-gradient text-white shadow-neon' :
                      player.rank === 2 ? 'bg-chess-silver/20 text-chess-silver' :
                      player.rank === 3 ? 'bg-chess-bronze/20 text-chess-bronze' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {player.rank}
                    </span>
                    <span className="text-lg">{player.country}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{player.name}</p>
                    </div>
                    <span className="text-sm font-bold text-muted-foreground">{player.elo}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Friends Online */}
            <div className="bg-card rounded-xl p-6 shadow-soft border-glow">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display font-semibold text-lg">Squad Online</h2>
                <span className="text-xs font-bold bg-primary/20 text-primary px-2 py-1 rounded-md border border-primary/30">
                  {friendsOnline.length} LIVE
                </span>
              </div>

              <div className="space-y-3">
                {friendsOnline.map((friend, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary transition-colors cursor-pointer"
                  >
                    <div className="relative">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-secondary to-muted" />
                      <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-card ${
                        friend.status === 'In Game' ? 'gamer-gradient shadow-neon' : 'bg-chess-win'
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{friend.name}</p>
                      <p className={`text-xs ${friend.status === 'In Game' ? 'text-primary' : 'text-muted-foreground'}`}>{friend.status}</p>
                    </div>
                    <span className="text-xs font-medium text-muted-foreground">{friend.elo}</span>
                  </div>
                ))}
              </div>

              <Button variant="ghost" size="sm" className="w-full mt-3 text-muted-foreground hover:text-primary">
                <Users className="w-4 h-4 mr-2" />
                Find Players
              </Button>
            </div>

            {/* Stats Card */}
            <div className="gamer-gradient rounded-xl p-6 shadow-glow text-white relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
              <div className="relative">
                <div className="flex items-center gap-3 mb-4">
                  <Star className="w-5 h-5" />
                  <span className="font-display font-bold">YOUR STATS</span>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold font-display">156</p>
                    <p className="text-xs opacity-80">Games</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold font-display">62%</p>
                    <p className="text-xs opacity-80">Win Rate</p>
                  </div>
                  <div className="relative">
                    <p className="text-2xl font-bold font-display">12</p>
                    <p className="text-xs opacity-80">🔥 Streak</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;

