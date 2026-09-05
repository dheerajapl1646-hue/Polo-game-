import React from 'react';
import { X, Play, RefreshCw } from 'lucide-react';
import { FieldType, TeamConfig } from '../types/polo';
import { POLO_TEAMS } from '../data/poloData';

interface ExhibitionSettingsModalProps {
  homeTeam: TeamConfig;
  awayTeam: TeamConfig;
  fieldType: FieldType;
  totalChukkers: number;
  onSelectHomeTeam: (team: TeamConfig) => void;
  onSelectAwayTeam: (team: TeamConfig) => void;
  onSelectFieldType: (type: FieldType) => void;
  onSelectTotalChukkers: (count: number) => void;
  onStartMatch: () => void;
  onClose: () => void;
}

export const ExhibitionSettingsModal: React.FC<ExhibitionSettingsModalProps> = ({
  homeTeam,
  awayTeam,
  fieldType,
  totalChukkers,
  onSelectHomeTeam,
  onSelectAwayTeam,
  onSelectFieldType,
  onSelectTotalChukkers,
  onStartMatch,
  onClose
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#0A1A12]/90 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-3xl bg-[#0A1A12] border-2 border-[#D4AF37]/50 p-6 sm:p-8 shadow-2xl flex flex-col my-auto text-[#F4F1EA] font-serif">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#D4AF37]/20">
          <div>
            <div className="text-[10px] uppercase font-bold tracking-[0.3em] text-[#D4AF37] font-sans">
              Match Setup & Fixture
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-[0.2em] uppercase text-[#F4F1EA] mt-0.5">
              Custom Match Settings
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-[#0E2319] hover:bg-[#162A1F] border border-[#D4AF37]/30 text-[#D4AF37] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Team Selection Row */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Home Team */}
          <div className="bg-[#0E2319] p-5 border border-[#D4AF37]/20 border-l-4 border-l-[#D4AF37]">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#D4AF37] font-sans block mb-2">
              Your Polo Club (Home)
            </label>
            <select
              value={homeTeam.id}
              onChange={(e) => {
                const team = POLO_TEAMS.find((t) => t.id === e.target.value);
                if (team) onSelectHomeTeam(team);
              }}
              className="w-full bg-[#0A1A12] border border-[#D4AF37]/30 px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-[#F4F1EA] focus:outline-none focus:border-[#D4AF37] font-serif"
            >
              {POLO_TEAMS.map((t) => (
                <option key={t.id} value={t.id} className="bg-[#0A1A12] text-[#F4F1EA]">
                  {t.name} ({t.clubCity}) • {t.handicap}H
                </option>
              ))}
            </select>
            <div className="mt-3 flex items-center gap-2 text-xs text-[#F4F1EA]/60 font-sans">
              <div
                className="w-3.5 h-3.5 border border-[#D4AF37]/30"
                style={{ backgroundColor: homeTeam.primaryColor }}
              />
              <span>Colors: {homeTeam.shortName} Silk & Crest</span>
            </div>
          </div>

          {/* Away Rival Team */}
          <div className="bg-[#0E2319] p-5 border border-[#D4AF37]/20 border-l-4 border-l-[#D4AF37]">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#D4AF37] font-sans block mb-2">
              Opponent Club (Away)
            </label>
            <select
              value={awayTeam.id}
              onChange={(e) => {
                const team = POLO_TEAMS.find((t) => t.id === e.target.value);
                if (team) onSelectAwayTeam(team);
              }}
              className="w-full bg-[#0A1A12] border border-[#D4AF37]/30 px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-[#F4F1EA] focus:outline-none focus:border-[#D4AF37] font-serif"
            >
              {POLO_TEAMS.map((t) => (
                <option key={t.id} value={t.id} className="bg-[#0A1A12] text-[#F4F1EA]">
                  {t.name} ({t.clubCity}) • {t.handicap}H
                </option>
              ))}
            </select>
            <div className="mt-3 flex items-center gap-2 text-xs text-[#F4F1EA]/60 font-sans">
              <div
                className="w-3.5 h-3.5 border border-[#D4AF37]/30"
                style={{ backgroundColor: awayTeam.primaryColor }}
              />
              <span>Colors: {awayTeam.shortName} Silk & Crest</span>
            </div>
          </div>
        </div>

        {/* Pitch Field Condition & Chukkers */}
        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Field Condition */}
          <div className="bg-[#0E2319] p-5 border border-[#D4AF37]/20">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#D4AF37] font-sans block mb-2">
              Pitch & Turf Conditions
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'turf' as const, label: 'Royal Turf', icon: '🌿', desc: 'Fast lawn roll' },
                { id: 'snow' as const, label: 'Snow Polo', icon: '❄️', desc: 'Ice glide' },
                { id: 'arena' as const, label: 'Arena Sands', icon: '🏜️', desc: 'Heavy drag' }
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => onSelectFieldType(f.id)}
                  className={`p-2.5 border text-center transition-all ${
                    fieldType === f.id
                      ? 'bg-[#162A1F] border-[#D4AF37] text-[#D4AF37] font-bold'
                      : 'bg-[#0A1A12] border-[#D4AF37]/20 text-[#F4F1EA]/60 hover:text-[#F4F1EA]'
                  }`}
                >
                  <div className="text-lg">{f.icon}</div>
                  <div className="text-xs font-bold mt-1 font-serif">{f.label}</div>
                  <div className="text-[9px] text-[#F4F1EA]/40 font-sans mt-0.5">{f.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Chukkers Count */}
          <div className="bg-[#0E2319] p-5 border border-[#D4AF37]/20">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#D4AF37] font-sans block mb-2">
              Match Length (Chukkers)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { count: 1, label: '1 Chukker', desc: 'Blitz Duel (2 min)' },
                { count: 2, label: '2 Chukkers', desc: 'Standard Half (4 min)' },
                { count: 4, label: '4 Chukkers', desc: 'Full Match' }
              ].map((c) => (
                <button
                  key={c.count}
                  onClick={() => onSelectTotalChukkers(c.count)}
                  className={`p-2.5 border text-center transition-all ${
                    totalChukkers === c.count
                      ? 'bg-[#162A1F] border-[#D4AF37] text-[#D4AF37] font-bold'
                      : 'bg-[#0A1A12] border-[#D4AF37]/20 text-[#F4F1EA]/60 hover:text-[#F4F1EA]'
                  }`}
                >
                  <div className="text-sm font-serif font-bold text-[#D4AF37]">{c.count}</div>
                  <div className="text-xs font-bold mt-0.5 font-serif">{c.label}</div>
                  <div className="text-[9px] text-[#F4F1EA]/40 font-sans mt-0.5">{c.desc}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Start Button */}
        <div className="mt-6 pt-4 border-t border-[#D4AF37]/20 flex justify-end gap-3">
          <button
            onClick={onStartMatch}
            className="w-full sm:w-auto px-10 py-3.5 bg-[#D4AF37] hover:bg-[#F4F1EA] text-[#0A1A12] font-sans font-bold text-xs uppercase tracking-[0.3em] shadow-2xl transition-all flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Blow Whistle & Start Match</span>
          </button>
        </div>
      </div>
    </div>
  );
};
