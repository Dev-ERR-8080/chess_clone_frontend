// components/ui/PlayerProfile.tsx
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface PlayerProfileProps {
  name: string;
  rating: number;
  avatarUrl?: string;
  isTurn: boolean;
  timeLeft: string;
  isBottom?: boolean;
}

export default function PlayerProfile({ name, rating, avatarUrl, isTurn, timeLeft, isBottom }: PlayerProfileProps) {
  return (
    <div className={`flex items-center justify-between p-3 rounded-xl border transition-all duration-300 ${
      isTurn 
        ? "bg-primary/10 border-primary shadow-[0_0_15px_-5px_var(--primary)]" 
        : "bg-card/50 border-border"
    }`}>
      <div className="flex items-center gap-3">
        <div className="relative">
          <Avatar className="w-12 h-12 rounded-lg border-2 border-border">
            <AvatarImage src={avatarUrl} />
            <AvatarFallback className="bg-secondary">{name[0]}</AvatarFallback>
          </Avatar>
          {isTurn && <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full animate-pulse" />}
        </div>
        <div>
          <h3 className="font-bold text-sm tracking-wide">{name.toUpperCase()}</h3>
          <p className="text-xs text-muted-foreground font-mono">Rating: {rating}</p>
        </div>
      </div>
      
      <div className={`px-4 py-1.5 rounded-lg font-mono text-xl font-bold ${
        isTurn ? "bg-primary text-white" : "bg-secondary text-foreground"
      }`}>
        {timeLeft}
      </div>
    </div>
  );
}