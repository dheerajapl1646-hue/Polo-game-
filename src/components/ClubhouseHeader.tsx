import React from 'react';
import { Trophy, Target, Users, Play, Globe, Shield, HelpCircle, Compass } from 'lucide-react';
import { FieldType, GameMode } from '../types/polo';

interface ClubhouseHeaderProps {
  currentMode: GameMode;
  fieldType: FieldType;
  onSelectMode: (mode: GameMode) => void;
  onSelectField: (field: FieldType) => void;
  onOpenRules: () => void;
  onOpenStable: () => void;
  onOpenOnlineLobby: () => void;
}

export const ClubhouseHeader: React.FC<ClubhouseHeaderProps> = ({
  currentMode,
  fieldType,
  onSelectMode,
  onSelectField,
  onOpenRules,
  onOpenStable,
  onOpenOnlineLobby
}) => {
  const modes: { id: GameMode; label: string; icon: React.ReactNode }[] = [
    { id: 'exhibition', label: 'Match Play', icon: <Play className="w-3.5 h-3.5" /> },
    { id: 'tournament', label: 'Gold Cup', icon: <Trophy className="w-3.5 h-3.5" /> },
    { id: 'penalties', label: 'Penalties', icon: <Target className="w-3.5 h-3.5" /> },
    { id: 'practice', label: 'Stick & Ball', icon: <Compass className="w-3.5 h-3.5" /> },
    { id: 'twoplayer', label: '2-Player', icon: <Users className="w-3.5 h-3.5" /> }
  ];

  const fieldTypes: { id: FieldType; label: string; icon: string }[] = [
    { id: 'turf', label: 'Royal Turf', icon: '🌿' },
    { id: 'snow', label: 'Snow Polo', icon: '❄️' },
    { id: 'arena', label: 'Arena Sands', icon: '🏜️' }
  ];

  return (
    <header className="w-full bg-[#0A1A12] border-b border-[#D4AF37]/20 px-4 py-2.5 sm:px-8 sm:py-3.5 flex flex-wrap items-center justify-between gap-3 text-[#F4F1EA] z-30 select-none shadow-xl">
      {/* Brand Title & Club Crest */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 border border-[#D4AF37] bg-[#0E2319] text-[#D4AF37] flex items-center justify-center font-serif text-lg font-bold shadow-md">
          ♔
        </div>
        <div>
          <h1 className="font-serif font-bold text-base sm:text-xl tracking-[0.2em] uppercase text-[#D4AF37] leading-none">
            Online Polo Games
          </h1>
          <div className="text-[9px] sm:text-[10px] text-[#F4F1EA]/60 font-medium tracking-[0.3em] uppercase font-sans mt-1">
            The King's Sport Online • Est. 1875
          </div>
        </div>
      </div>

      {/* Game Mode Navigation Tabs */}
      <div className="flex items-center gap-1 bg-[#0E2319] p-1 border border-[#D4AF37]/20 overflow-x-auto max-w-full">
        {modes.map((m) => {
          const isActive = currentMode === m.id;
          return (
            <button
              key={m.id}
              onClick={() => onSelectMode(m.id)}
              className={`px-3 py-1.5 text-[10px] sm:text-[11px] font-bold font-sans uppercase tracking-[0.2em] transition-all flex items-center gap-1.5 whitespace-nowrap ${
                isActive
                  ? 'bg-[#D4AF37] text-[#0A1A12] shadow-md font-bold'
                  : 'text-[#F4F1EA]/70 hover:text-[#D4AF37] hover:bg-[#162A1F]'
              }`}
            >
              {m.icon}
              <span>{m.label}</span>
            </button>
          );
        })}
      </div>

      {/* Field Pitch & Clubhouse Action Buttons */}
      <div className="flex items-center gap-2">
        {/* Pitch selector dropdown / pills */}
        <div className="hidden sm:flex items-center gap-1 bg-[#0E2319] p-1 border border-[#D4AF37]/20 text-[10px] font-sans uppercase tracking-widest">
          {fieldTypes.map((f) => (
            <button
              key={f.id}
              onClick={() => onSelectField(f.id)}
              className={`px-2 py-1 transition-colors flex items-center gap-1 ${
                fieldType === f.id
                  ? 'bg-[#162A1F] text-[#D4AF37] font-bold border-b-2 border-[#D4AF37]'
                  : 'text-[#F4F1EA]/50 hover:text-[#F4F1EA]'
              }`}
              title={`${f.label} Pitch`}
            >
              <span>{f.icon}</span>
              <span>{f.label}</span>
            </button>
          ))}
        </div>

        {/* Stable Tack Room */}
        <button
          onClick={onOpenStable}
          className="px-3 py-1.5 bg-[#0E2319] hover:bg-[#162A1F] border border-[#D4AF37]/30 hover:border-[#D4AF37] text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-[#F4F1EA] transition-colors flex items-center gap-1.5"
          title="Select Mount & Tack"
        >
          <Shield className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span className="hidden md:inline">Stables</span>
        </button>

        {/* Online Matchmaking Lobby */}
        <button
          onClick={onOpenOnlineLobby}
          className="px-3 py-1.5 border border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#0A1A12] text-[10px] font-sans font-bold uppercase tracking-[0.2em] transition-all flex items-center gap-1.5 shadow-sm"
          title="Find Online Match"
        >
          <Globe className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Live Arenas</span>
        </button>

        {/* How to Play Guide */}
        <button
          onClick={onOpenRules}
          className="p-2 bg-[#0E2319] hover:bg-[#162A1F] border border-[#D4AF37]/30 hover:border-[#D4AF37] text-[#D4AF37] transition-colors"
          title="How to Play & Rules"
        >
          <HelpCircle className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
