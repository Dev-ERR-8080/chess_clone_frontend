import { useEffect, useRef } from "react";

export default function MoveHistory({ moves }: { moves: string[] }) {
  // Group moves into pairs: [[whiteMove, blackMove], [whiteMove, blackMove], ...]
  const pairs = [];
  for (let i = 0; i < moves.length; i += 2) {
    pairs.push(moves.slice(i, i + 2));
  }
  const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [moves]);

  return (
    <div className="w-72 bg-[#262421] text-[#bababa] rounded-md p-4 overflow-y-auto max-h-[500px] shadow-lg" >
      <h3 className="text-xs font-bold uppercase tracking-wider mb-4 text-gray-300 border-b border-gray-700 pb-2">
        Move History
      </h3>

      <div className="space-y-1" ref={scrollRef}>
        {pairs.map((pair, index) => (
          <div 
            key={index} 
            className={`flex items-center py-1 px-2 rounded ${index % 2 === 0 ? 'bg-[#312f2b]' : ''}`}
          >
            {/* Move Number */}
            <span className="w-8 text-gray-300 font-mono text-xs">
              {index + 1}.
            </span>

            {/* White Move */}
            <span className="flex-1 font-medium text-gray-100">
              {pair[0]}
            </span>

            {/* Black Move */}
            <span className="flex-1 font-medium text-gray-100">
              {pair[1] || ""}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}