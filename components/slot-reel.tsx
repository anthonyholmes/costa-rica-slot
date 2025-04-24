"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

interface Symbol {
  name: string;
  image: string;
}

interface SlotReelProps {
  symbols: Symbol[];
  finalSymbols: Symbol[]; // 4 symbols per column
  spinning: boolean;
  stopDelay: number;
  onStop: () => void;
}

export const SlotReel = ({ symbols, finalSymbols, spinning, stopDelay, onStop }: SlotReelProps) => {
  const reelRef = useRef<HTMLDivElement>(null);
  const [spinningClass, setSpinningClass] = useState("");

  useEffect(() => {
    if (spinning) {
      setSpinningClass("reel-spin-animation");
      const stopTimeout = setTimeout(() => {
        setSpinningClass("");
        onStop();
      }, 2000 + stopDelay);
      return () => clearTimeout(stopTimeout);
    }
  }, [spinning, stopDelay, onStop]);

  return (
    <div className="w-24 h-[384px] overflow-hidden border border-white rounded-md bg-gray-900">
      <div
        ref={reelRef}
        className={`flex flex-col items-center ${spinningClass}`}
        style={{
          animationDuration: "2s",
          "--spin-distance": "1000px" as any,
        }}
      >
        {spinning
          ? Array.from({ length: 12 }).map((_, idx) => {
              const symbol = symbols[Math.floor(Math.random() * symbols.length)];
              return <Image key={idx} src={symbol.image} alt={symbol.name} width={64} height={64} className="my-1" />;
            })
          : finalSymbols.map((symbol, idx) => (
              <Image key={idx} src={symbol.image} alt={symbol.name} width={64} height={64} className="my-1" />
            ))}
      </div>
    </div>
  );
};
