import React from 'react';
import { X, Check, Award, Gauge, Wind, Zap, Shield, Sparkles } from 'lucide-react';
import { HorseProfile, PositionId } from '../types/polo';
import { POLO_PONIES } from '../data/poloData';

interface StableTackRoomProps {
  currentHorse: HorseProfile;
  currentPosition: PositionId;
  onSelectHorse: (horse: HorseProfile) => void;
  onSelectPosition: (pos: PositionId) => void;
  onClose: () => void;
}

export const StableTackRoom: React.FC<StableTackRoomProps> = ({
  currentHorse,
  currentPosition,
  onSelectHorse,
  onSelectPosition,
  onClose
}) => {
  const positions: { num: PositionId; title: string; role: string }[] = [
    { num: 1, title: 'No. 1 - Attacker / Forward', role: 'Fastest attacker, scores goals and runs deep into the opponent zone.' },
    { num: 2, title: 'No. 2 - Aggressive Engine', role: 'Midfield workhorse, battles in ride-offs and controls midfield possession.' },
    { num: 3, title: 'No. 3 - Tactician / Playmaker', role: 'Team captain and pivot, hits long lofted passes and coordinates attacks.' },
    { num: 4, title: 'No. 4 - Back / Goal Defender', role: 'Defensive powerhouse, clears backhands and protects the goal posts.' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-950/85 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-4xl bg-stone-900 border-2 border-amber-600/70 rounded-3xl p-5 sm:p-7 shadow-2xl flex flex-col my-auto text-stone-100">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-800">
          <div>
            <div className="text-xs uppercase font-bold tracking-widest text-amber-500 font-display">
              Royal Equine Pavilion
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-wide font-display text-stone-100">
              The Stable & Tack Room
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Position Selection */}
        <div className="mt-5">
          <label className="text-xs font-bold uppercase tracking-wider text-stone-400 font-display block mb-2">
            Select Your Field Position & Role
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {positions.map((p) => {
              const isSelected = currentPosition === p.num;
              return (
                <button
                  key={p.num}
                  onClick={() => onSelectPosition(p.num)}
                  className={`p-3 rounded-2xl border text-left transition-all relative ${
                    isSelected
                      ? 'bg-amber-500/20 border-amber-500 shadow-md shadow-amber-500/10'
                      : 'bg-stone-950/60 border-stone-800 hover:border-stone-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono font-black text-lg text-amber-400">#{p.num}</span>
                    {isSelected && <Check className="w-4 h-4 text-amber-400" />}
                  </div>
                  <div className="font-bold text-xs text-stone-200">{p.title}</div>
                  <p className="text-[10px] text-stone-400 mt-1 leading-snug">{p.role}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Horse Selection Carousel / Grid */}
        <div className="mt-6">
          <label className="text-xs font-bold uppercase tracking-wider text-stone-400 font-display block mb-2">
            Select Your Polo Pony Mount
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 max-h-[380px] overflow-y-auto pr-1">
            {POLO_PONIES.map((horse) => {
              const isSelected = currentHorse.id === horse.id;
              return (
                <div
                  key={horse.id}
                  onClick={() => onSelectHorse(horse)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'bg-gradient-to-b from-stone-800 to-stone-900 border-amber-500 ring-2 ring-amber-500/40'
                      : 'bg-stone-950/70 border-stone-800 hover:border-stone-700'
                  }`}
                >
                  <div>
                    {/* Header with Coat badge */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded-full border border-stone-400 shadow"
                          style={{ backgroundColor: horse.color }}
                        />
                        <h3 className="font-display font-bold text-sm text-stone-100">{horse.name}</h3>
                      </div>
                      {isSelected && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-500 text-stone-950 text-[10px] font-black uppercase">
                          Equipped
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-amber-400/90 font-medium mb-2">{horse.breed}</div>
                    <p className="text-[11px] text-stone-400 mb-3 line-clamp-2">{horse.description}</p>
                  </div>

                  {/* Stat Bars */}
                  <div className="space-y-1.5 pt-2 border-t border-stone-800/80 text-[10px]">
                    <div className="flex justify-between items-center text-stone-300">
                      <span className="flex items-center gap-1"><Wind className="w-3 h-3 text-sky-400" /> Speed</span>
                      <span className="font-mono font-bold text-amber-400">{horse.speed}</span>
                    </div>
                    <div className="w-full h-1.5 bg-stone-800 rounded-full overflow-hidden">
                      <div className="h-full bg-sky-400 rounded-full" style={{ width: `${horse.speed * 10}%` }} />
                    </div>

                    <div className="flex justify-between items-center text-stone-300">
                      <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-amber-400" /> Agility</span>
                      <span className="font-mono font-bold text-amber-400">{horse.agility}</span>
                    </div>
                    <div className="w-full h-1.5 bg-stone-800 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-400 rounded-full" style={{ width: `${horse.agility * 10}%` }} />
                    </div>

                    <div className="flex justify-between items-center text-stone-300">
                      <span className="flex items-center gap-1"><Shield className="w-3 h-3 text-rose-400" /> Ride-Off Power</span>
                      <span className="font-mono font-bold text-amber-400">{horse.bumpWeight}</span>
                    </div>
                    <div className="w-full h-1.5 bg-stone-800 rounded-full overflow-hidden">
                      <div className="h-full bg-rose-400 rounded-full" style={{ width: `${horse.bumpWeight * 10}%` }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Button */}
        <div className="mt-6 pt-4 border-t border-stone-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-display font-bold text-sm tracking-wider uppercase shadow-lg transition-all"
          >
            Mount & Ride Onto Field
          </button>
        </div>
      </div>
    </div>
  );
};
