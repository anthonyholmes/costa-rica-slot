"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Coins } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import costaRicaSign from "@/public/costa-rica-sign.png";

// Define symbols with their values
const SYMBOLS = [
  { name: "Monkey", image: "/symbols/monkey.png", value: 5 },
  { name: "Volcano", image: "/symbols/volcano.png", value: 6 },
  { name: "Beach", image: "/symbols/beach.png", value: 4 },
  { name: "Toucan", image: "/symbols/toucan.png", value: 7 },
  { name: "Sloth", image: "/symbols/sloth.png", value: 3 },
  { name: "Pineapple", image: "/symbols/pineapple.png", value: 2 },
  { name: "Coffee", image: "/symbols/coffee.png", value: 8 },
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
    // setCredits((prev) => prev - 10);
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
    setCredits((prev) => prev + 10);
    toast({
      title: "Credits Added",
      description: "10 credits have been added to your balance",
    });
  };

  return (
    // Add max-width and center the main container
    <div className="flex flex-col items-center max-w-lg mx-auto w-full relative px-3">
      <div className="flex justify-center">
        <Image src={costaRicaSign} alt="Costa Rica Sign" className="-mt-3" />
      </div>
      <Card className="w-full bg-zinc-800 border-zinc-700 relative overflow-hidden -mt-24 md:-mt-32 gap-0">
        <div className="absolute inset-0 bg-[url('/wood.png')] bg-cover bg-center opacity-80 pointer-events-none z-0"></div>
        {/* Reels container - Adjust margin if needed */}
        <div className="flex justify-center gap-1 my-4 relative">
          {" "}
          {/* Adjusted margin from my-8 to my-4 */}
          {/* Map over NUM_REELS */}
          {reels.map((reel, reelIndex) => (
            <div
              key={reelIndex}
              className={cn(
                // Keep fixed dimensions for the main reel container for now
                // Percentage heights require a defined parent height, which the Card provides,
                // but managing aspect ratio and symbol visibility gets complex.
                "w-24 h-73 md:w-32 md:h-109", // Base, md sizes
                "bg-black rounded-md flex flex-col items-center relative overflow-hidden border-2",
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
                  "absolute top-0 left-0 right-0 flex flex-col items-center",
                  "transition-transform duration-500 ease-out",
                  reel.spinning ? "animate-slot-spin" : "translate-y-0"
                )}
              >
                {/* Render all symbols in the reel */}
                {reel.symbols.map((symbolIndex, index) => {
                  const symbol = SYMBOLS[symbolIndex];
                  return (
                    // This container defines the height for one symbol slot (1/3rd of the reel height)
                    <div key={index} className="flex items-center justify-center h-24 md:h-36 w-full flex-shrink-0">
                      {/* Make the image container size relative (e.g., 90%) to the symbol slot */}
                      <div
                        className={cn(
                          "relative w-[90%] h-[90%]", // Increased height percentage
                          reel.spinning && "animate-pulse"
                        )}
                      >
                        <Image
                          src={symbol.image || "/placeholder.svg"}
                          alt={symbol.name}
                          fill
                          className="object-cover"
                          // Adjust sizes based on the new percentage width/height relative to the reel width/height
                          // Example: w: 80% of w-24/md:w-32 => ~76px/102px
                          // Example: h: 90% of h-24/md:h-32 => ~86px/115px
                          // Use the larger dimension for sizes for better quality potential
                          sizes="(max-width: 768px) 86px, 115px" // Adjusted sizes
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
                  {/* <span className="text-yellow-400 font-bold text-2xl md:text-3xl">+{winAmount}</span> */}
                  <span className="text-yellow-400 font-bold text-2xl md:text-3xl">You Win!</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* <div className="justify-between items-center w-full relative px-3 md:px-16 hidden">
          <Badge variant="outline" className="text-lg px-4 py-2 bg-black/40 text-white border-none">
            <Coins className="mr-2 size-5 text-yellow-400" />
            <span>{credits} Credits</span>
          </Badge>

          <Button variant="outline" onClick={addCredits} className="bg-black/40 text-lg border-none text-white">
            <span className="px-4 py-6 ">Add Credits</span>
          </Button>
        </div> */}

        <div className="flex justify-center relative">
          <Button
            onClick={spin}
            disabled={isSpinning}
            className={cn(
              "text-white font-bold py-6 px-10 rounded-full text-xl shadow-lg transition-all duration-300 ease-in-out",
              "bg-black/50",
              "focus:outline-none focus:ring-4 focus:ring-green-300 dark:focus:ring-green-800", // Focus ring
              "disabled:opacity-60 disabled:cursor-not-allowed",
              !isSpinning && "animate-pulse-slow" // Add a slow pulse when active
            )}
          >
            {isSpinning ? "Spinning..." : "SPIN TO WIN"}
          </Button>
        </div>
      </Card>

      {/* Add this animation definition to your globals.css or tailwind.config.js */}
      {/* In tailwind.config.js extend theme -> animation */}
      {/* animation: {
      //   'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      // } */}

      <div className="text-white text-sm text-center mt-4 bg-black/50 p-4 rounded-lg shadow-lg space-y-3 text-balance">
        <p>Match 3 symbols on the center line to win!</p>
        <p>
          Made with ❤️ by{" "}
          <a href="https://antlur.co" className="underline">
            Anthony Holmes
          </a>{" "}
          for Lissette and Giancarlo's Multicultural Night
        </p>
        <p>¡PURA VIDA!</p>
      </div>
    </div>
  );
}
