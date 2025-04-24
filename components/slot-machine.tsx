"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Coins } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";

// Define symbols with their values
const SYMBOLS = [
  { name: "Pitcher", image: "/symbols/pitcher.png", value: 5 },
  { name: "KoolAid", image: "/symbols/glass.png", value: 3 },
  { name: "Eyeball", image: "/symbols/eyeball.png", value: 7 },
  { name: "Candle", image: "/symbols/candle.png", value: 4 },
  { name: "Book", image: "/symbols/book.png", value: 6 },
  { name: "Mushroom", image: "/symbols/mushroom.png", value: 8 },
  { name: "Triangle", image: "/symbols/triangle.png", value: 10 },
];

// Number of visible symbols per reel
const SYMBOLS_PER_REEL = 3;
const NUM_REELS = 3;

export default function SlotMachine() {
  const [credits, setCredits] = useState(100);
  // Initialize 3 reels, each with 3 visible symbols
  const [reels, setReels] = useState(
    Array(NUM_REELS)
      .fill(0)
      .map(() => ({
        spinning: false,
        // Each reel has SYMBOLS_PER_REEL + extra symbols for animation
        symbols: Array(SYMBOLS_PER_REEL + 2) // Keep extra for animation smoothness
          .fill(0)
          .map(() => Math.floor(Math.random() * SYMBOLS.length)),
      }))
  );
  const [isSpinning, setIsSpinning] = useState(false);
  const [winAmount, setWinAmount] = useState(0);
  const [showWin, setShowWin] = useState(false);
  const spinSound = useRef<HTMLAudioElement | null>(null);
  const winSound = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Create audio elements
    spinSound.current = new Audio("/spin-sound.mp3");
    winSound.current = new Audio("/win-sound.mp3");

    // Cleanup
    return () => {
      if (spinSound.current) {
        spinSound.current.pause();
        spinSound.current = null;
      }
      if (winSound.current) {
        winSound.current.pause();
        winSound.current = null;
      }
    };
  }, []);

  const spin = () => {
    if (isSpinning) return;
    if (credits < 10) {
      toast({
        title: "Not enough credits",
        description: "You need at least 10 credits to spin",
        variant: "destructive",
      });
      return;
    }

    // Deduct credits
    setCredits((prev) => prev - 10);
    setIsSpinning(true);
    setShowWin(false);

    // Play spin sound
    if (spinSound.current) {
      spinSound.current.currentTime = 0;
      spinSound.current.play().catch((e) => console.error("Error playing sound:", e));
    }

    // Set all reels to spinning
    setReels(reels.map((reel) => ({ ...reel, spinning: true })));

    // Stop each reel after a random delay
    reels.forEach((_, index) => {
      const stopTime = 1000 + index * 300 + Math.random() * 300;

      setTimeout(() => {
        let finalReelsState: typeof reels | null = null; // Variable to hold the final state

        setReels((currentReels) => {
          const newReels = [...currentReels];
          // Generate new symbols for this reel
          const newSymbols = Array(SYMBOLS_PER_REEL + 2)
            .fill(0)
            .map(() => Math.floor(Math.random() * SYMBOLS.length));

          newReels[index] = {
            spinning: false,
            symbols: newSymbols,
          };

          // If this is the last reel, store the final state
          if (index === reels.length - 1) {
            finalReelsState = newReels;
          }
          return newReels;
        });

        // If this is the last reel, check for wins using the final state
        if (index === reels.length - 1) {
          setTimeout(() => {
            // Pass the captured final state to checkWin
            if (finalReelsState) {
              checkWin(finalReelsState);
            }
            setIsSpinning(false);
          }, 300); // Short delay to allow visual settling
        }
      }, stopTime);
    });
  };

  // Update checkWin to accept the final reels state
  const checkWin = (finalReelsState: typeof reels) => {
    let win = 0;
    const centerRowIndex = 1; // Center row for a 3-symbol reel

    // Get symbols in the center row from the passed state
    const centerRowSymbols = finalReelsState.map((reel) => reel.symbols[centerRowIndex]);

    // Check if all three symbols in the center row are the same
    const firstSymbol = centerRowSymbols[0];
    const isWin = centerRowSymbols.every((symbol) => symbol === firstSymbol);

    if (isWin) {
      const winningSymbolIndex = firstSymbol;
      const symbolValue = SYMBOLS[winningSymbolIndex].value;
      // Define a multiplier for the 3-of-a-kind win on the center line
      const multiplier = 10; // Example multiplier, adjust as needed
      win = symbolValue * multiplier;
    }

    if (win > 0) {
      setWinAmount(win);
      setShowWin(true);
      setCredits((prev) => prev + win);

      // Play win sound
      if (winSound.current) {
        winSound.current.currentTime = 0;
        winSound.current.play().catch((e) => console.error("Error playing sound:", e));
      }

      toast({
        title: "Winner!",
        description: `You won ${win} credits!`,
        variant: "default",
      });
    }
  };

  const addCredits = () => {
    setCredits((prev) => prev + 100);
    toast({
      title: "Credits Added",
      description: "100 credits have been added to your balance",
    });
  };

  return (
    // Add max-width and center the main container
    <div className="flex flex-col items-center gap-6 max-w-3xl mx-auto w-full">
      <div className="flex justify-between w-full mb-2">
        <Badge variant="outline" className="text-lg px-4 py-2 bg-zinc-800 border-zinc-700">
          <Coins className="mr-2 size-5 text-yellow-400" />
          <span className="text-white">{credits} Credits</span>
        </Badge>

        <Button
          variant="outline"
          onClick={addCredits}
          className="bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-white"
        >
          Add Credits
        </Button>
      </div>

      <Card className="w-full bg-zinc-800 border-zinc-700 p-6 relative overflow-hidden">
        {/* Machine top */}
        <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-r from-zinc-700 via-zinc-600 to-zinc-700"></div>

        {/* Reels container - Increase gap */}
        <div className="flex justify-center gap-1 my-8 relative">
          {/* Map over NUM_REELS */}
          {reels.map((reel, reelIndex) => (
            <div
              key={reelIndex}
              className={cn(
                // Increase base size and add responsive sizes
                "w-24 h-72 md:w-32 md:h-96", // Base, sm, md sizes
                "bg-black rounded-md flex flex-col items-center relative overflow-hidden border-4",
                reel.spinning ? "border-blue-500 shadow-[0_0_15px_theme(colors.blue.500/70)]" : "border-zinc-600"
              )}
            >
              {/* Reel background lines */}
              <div className="absolute inset-0 flex flex-col justify-between opacity-20">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="h-px bg-white"></div>
                ))}
              </div>

              {/* Symbols container */}
              <div
                className={cn(
                  "absolute top-0 left-0 right-0 flex flex-col items-center transition-transform",
                  reel.spinning ? "animate-slot-spin" : ""
                )}
              >
                {/* Render all symbols in the reel */}
                {reel.symbols.map((symbolIndex, index) => {
                  const symbol = SYMBOLS[symbolIndex];
                  return (
                    // Increase symbol container height responsively
                    <div key={index} className="flex items-center justify-center h-24 md:h-32 w-full">
                      {/* Increase symbol image container size responsively */}
                      <div
                        className={cn(
                          "relative w-20 h-20 md:w-28 md:h-28", // Base, sm, md sizes
                          reel.spinning && "animate-pulse"
                        )}
                      >
                        <Image
                          src={symbol.image || "/placeholder.svg"}
                          alt={symbol.name}
                          fill
                          className="object-contain"
                          // Update sizes attribute for better optimization
                          sizes="(max-width: 640px) 4rem, (max-width: 768px) 5rem, 7rem"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Win overlay - Highlight the center line on win */}
          {showWin && (
            <>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                {/* Center line highlight - Adjust height responsively */}
                <div className="absolute top-1/2 left-0 right-0 h-24 md:h-32 -translate-y-1/2 bg-yellow-400/30 border-y-2 border-yellow-500 animate-pulse"></div>
                {/* Win amount display - Maybe increase text size */}
                <div className="bg-black/60 backdrop-blur-sm rounded-lg p-4 animate-bounce z-10">
                  <span className="text-yellow-400 font-bold text-2xl md:text-3xl">+{winAmount}</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Spin button */}
        <div className="flex justify-center mt-6">
          <Button
            onClick={spin}
            disabled={isSpinning}
            className="bg-rose-600 hover:bg-rose-700 text-white font-bold py-6 px-8 rounded-full text-xl shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSpinning ? "Spinning..." : "SPIN (10 Credits)"}
          </Button>
        </div>

        {/* Machine bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-r from-zinc-700 via-zinc-600 to-zinc-700"></div>
      </Card>

      <div className="text-zinc-400 text-sm text-center mt-4">
        {/* Update win description */}
        <p>Match 3 symbols on the center line to win!</p>
        <p className="mt-1">The Triangle is the highest paying symbol!</p>
      </div>
    </div>
  );
}
