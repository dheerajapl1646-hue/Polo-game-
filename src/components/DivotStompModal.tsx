import React, { useState, useEffect } from 'react';
import { Sparkles, Trophy, Footprints } from 'lucide-react';
import { poloAudio } from '../utils/audio';

interface DivotStompModalProps {
  onComplete: (stompedCount: number) => void;
}

interface MiniDivot {
  id: number;
  x: number;
  y: number;
  stomped: boolean;
  size: number;
}

export const DivotStompModal: React.FC<DivotStompModalProps> = ({ onComplete }) => {
  const [divots, setDivots] = useState<MiniDivot[]>([]);
  const [timeLeft, setTimeLeft] = useState(15);
  const [stompedCount, setStompedCount] = useState(0);

  // Generate random raised divots across the mini turf
  useEffect(() => {
    const list: MiniDivot[] = [];
    for (let i = 0; i < 24; i++) {
      list.push({
        id: i,
        x: 10 + Math.random() * 80,
        y: 15 + Math.random() * 70,
        stomped: false,
        size: 28 + Math.random() * 16
      });
    }
    setDivots(list);
  }, []);

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) {
      onComplete(stompedCount);
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, stompedCount, onComplete]);

  const handleStomp = (id: number) => {
    setDivots((prev) =>
      prev.map((d) => {
        if (d.id === id && !d.stomped) {
          poloAudio.playDivotStomp();
          setStompedCount((c) => c + 1);
          return { ...d, stomped: true };
        }
        return d;
      })
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/85 backdrop-blur-md">
      <div className="w-full max-w-xl bg-stone-900 border-2 border-amber-600/70 rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center">
        <div className="flex items-center gap-2 text-amber-400 mb-1">
          <Footprints className="w-6 h-6" />
          <h2 className="font-display font-bold text-2xl uppercase tracking-wider">
            Halftime: Stomp the Divots!
          </h2>
        </div>
        <p className="text-stone-300 text-xs sm:text-sm max-w-md mb-4">
          The historic polo tradition! Walk the field and tap every raised grass divot to press it flat.
          Repairing the pitch awards bonus stamina to your polo ponies for the next chukker.
        </p>

        {/* Stats Row */}
        <div className="w-full flex justify-between items-center bg-stone-950 px-4 py-2.5 rounded-xl border border-stone-800 mb-4 text-xs font-semibold">
          <div className="flex items-center gap-1.5 text-stone-300">
            <span>Repaired:</span>
            <span className="text-amber-400 font-bold text-base">{stompedCount} / {divots.length}</span>
          </div>
          <div className="flex items-center gap-1.5 text-stone-300">
            <span>Time Left:</span>
            <span className={`font-mono font-bold text-base ${timeLeft <= 5 ? 'text-red-400 animate-pulse' : 'text-emerald-400'}`}>
              {timeLeft}s
            </span>
          </div>
        </div>

        {/* Interactive Mini Field Canvas Box */}
        <div
          id="divot-stomp-field"
          className="relative w-full h-72 sm:h-80 rounded-2xl overflow-hidden border-2 border-emerald-800 shadow-inner cursor-pointer"
          style={{
            background: 'linear-gradient(135deg, #166534 0%, #14532d 100%)'
          }}
        >
          {/* Mower turf stripes */}
          <div className="absolute inset-0 opacity-15 pointer-events-none flex">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className={`flex-1 ${i % 2 === 0 ? 'bg-white' : 'bg-transparent'}`} />
            ))}
          </div>

          {/* Divots scattered */}
          {divots.map((d) => (
            <button
              key={d.id}
              onClick={() => handleStomp(d.id)}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-200 flex items-center justify-center ${
                d.stomped
                  ? 'opacity-40 scale-90 pointer-events-none'
                  : 'hover:scale-110 active:scale-95 animate-bounce'
              }`}
              style={{
                left: `${d.x}%`,
                top: `${d.y}%`,
                width: `${d.size}px`,
                height: `${d.size}px`
              }}
            >
              {d.stomped ? (
                <div className="w-full h-full rounded-full bg-emerald-950 border border-emerald-700/50 flex items-center justify-center text-[10px] text-emerald-400 font-bold">
                  ✓
                </div>
              ) : (
                <div className="w-full h-full rounded-full bg-amber-950 border-2 border-amber-600 shadow-lg flex items-center justify-center text-[10px] text-amber-300 font-extrabold shadow-amber-900/60">
                  🌱
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Skip / Finish Early button */}
        <button
          onClick={() => onComplete(stompedCount)}
          className="mt-5 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-display font-bold text-sm tracking-wider uppercase shadow-lg transition-colors flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          <span>Resume Chukkers (+{stompedCount * 2}% Stamina Bonus)</span>
        </button>
      </div>
    </div>
  );
};
