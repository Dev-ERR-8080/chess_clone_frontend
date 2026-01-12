"use client"
import React, { useState, useEffect } from "react";
import {
  Home, Sword, Brain, Trophy, BarChart3, Users, ChevronDown, 
  ChevronsRight, Moon, Sun, TrendingUp, History, Target, 
  Bell, Settings, HelpCircle, User, LucideIcon, Medal,
  PlayCircle, Flame, Zap, Clock
} from "lucide-react";
import ChessGame from "@/app/play/page";

// --- Types ---
interface OptionProps {
  Icon: LucideIcon;
  title: string;
  selected: string;
  setSelected: (title: string) => void;
  open: boolean;
  notifs?: number;
}
interface TitleSectionProps { open: boolean; }
interface ToggleCloseProps { open: boolean; setOpen: (open: boolean) => void; }
interface ExampleContentProps { isDark: boolean; setIsDark: (isDark: boolean) => void; }

export const ChessUserHome = () => {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    if (isDark) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDark]);

  return (
    <div className={`flex min-h-screen w-full ${isDark ? 'dark' : ''}`}>
      <div className="flex w-full bg-[#f1f1f1] dark:bg-[#161512] text-gray-900 dark:text-gray-100">
        <Sidebar />
        <HomeContent isDark={isDark} setIsDark={setIsDark} />
      </div>
    </div>
  );
};

const Sidebar = () => {
  const [open, setOpen] = useState(true);
  const [selected, setSelected] = useState("Home");

  return (
    <nav className={`sticky top-0 h-screen shrink-0 border-r transition-all duration-300 ease-in-out ${open ? 'w-60' : 'w-20'} border-gray-200 dark:border-[#262421] bg-white dark:bg-[#262421] p-2 shadow-sm`}>
      <TitleSection open={open} />

      <div className="space-y-1 mb-8">
        <Option Icon={Home} title="Home" selected={selected} setSelected={setSelected} open={open} />
        <Option Icon={Sword} title="Play" selected={selected} setSelected={setSelected} open={open} notifs={1} />
        <Option Icon={Brain} title="Puzzles" selected={selected} setSelected={setSelected} open={open} />
        <Option Icon={History} title="Learn" selected={selected} setSelected={setSelected} open={open} />
        <Option Icon={Users} title="Social" selected={selected} setSelected={setSelected} open={open} notifs={12} />
      </div>

      {open && (
        <div className="border-t border-gray-200 dark:border-white/5 pt-4">
          <Option Icon={Settings} title="Settings" selected={selected} setSelected={setSelected} open={open} />
        </div>
      )}
      <ToggleClose open={open} setOpen={setOpen} />
    </nav>
  );
};

const HomeContent = ({ isDark, setIsDark }: ExampleContentProps) => {
  return (
    <div className="flex-1 p-6 overflow-auto max-w-7xl mx-auto w-full">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <img 
         src="https://assets-configurator.chess.com/image/configurator/chessboard_1763048156100.gif" 
         alt="" 
         data-key="configurator/chessboard_1763048156100.gif" 
         data-content-type="image/gif" width="50%" height="50%"></img>
      </div>
    </div>
  );
};

// --- Sub-Components ---

const ActiveGameRow = ({ opponent, time, status, rating, highlight = false }: any) => (
  <div className={`flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer ${highlight ? 'border-l-4 border-[#81b64c]' : ''}`}>
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded bg-gray-300 dark:bg-white/10" />
      <div>
        <p className="text-sm font-bold">{opponent} ({rating})</p>
        <p className={`text-xs ${highlight ? 'text-[#81b64c] font-bold' : 'text-gray-500'}`}>{status}</p>
      </div>
    </div>
    <span className="text-xs text-gray-400">{time} left</span>
  </div>
);

const FriendRow = ({ name, status, online = false }: any) => (
  <div className="flex items-center justify-between p-2 rounded hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer">
    <div className="flex items-center gap-2">
      <div className={`w-2 h-2 rounded-full ${online ? 'bg-[#81b64c]' : 'bg-gray-500'}`} />
      <span className="text-sm">{name}</span>
    </div>
    <span className="text-[10px] text-gray-500 uppercase">{status}</span>
  </div>
);

// Reuse your Option, TitleSection, and ToggleClose components here...
// [Make sure the Option component uses the dark-mode compatible gray #262421]

const Option = ({ Icon, title, selected, setSelected, open, notifs }: OptionProps) => {
  const isSelected = selected === title;
  return (
    <button
      onClick={() => setSelected(title)}
      className={`relative flex h-12 w-full items-center rounded-md transition-all ${
        isSelected 
          ? "bg-[#3c3a38] text-white font-bold" 
          : "text-gray-500 hover:bg-[#312e2b] hover:text-gray-100"
      }`}
    >
      <div className="grid h-full w-14 place-content-center">
        <Icon size={22} />
      </div>
      {open && <span className="text-[15px] font-bold">{title}</span>}
      {notifs && open && (
        <span className="absolute right-3 px-1.5 rounded-sm bg-red-600 text-[10px] text-white font-bold">
          {notifs}
        </span>
      )}
    </button>
  );
};

const TitleSection = ({ open }: TitleSectionProps) => (
  <div className="mb-6 p-2">
    <div className="flex items-center gap-3">
       <div className="size-10 bg-[#81b64c] rounded flex items-center justify-center text-white font-black italic">C</div>
       {open && <span className="font-black text-xl tracking-tighter">GrandMasters</span>}
    </div>
  </div>
);

const ToggleClose = ({ open, setOpen }: ToggleCloseProps) => (
  <button
    onClick={() => setOpen(!open)}
    className="absolute bottom-4 left-0 right-0 p-3 text-gray-500 hover:text-white flex justify-center"
  >
    <ChevronsRight className={`transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
  </button>
);

export default ChessUserHome;