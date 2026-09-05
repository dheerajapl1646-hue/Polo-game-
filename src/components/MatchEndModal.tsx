import React from 'react';
import { Trophy, Award, RotateCcw, ArrowRight, ShieldCheck, Zap, Crosshair } from 'lucide-react';
import { PlayerStats, TeamConfig } from '../types/polo';

interface MatchEndModalProps {
  homeScore: number;
  awayScore: number;
  homeTeam: TeamConfig;
  awayTeam: TeamConfig;
  userStats: PlayerStats;
  onRestart: () => void;
  onReturnToLobby: () => void;
}

export const MatchEndModal: React.FC<MatchEndModalProps> = ({
  homeScore,
  awayScore,
  homeTeam,
  awayTeam,
  userStats,
  onRestart,
  onReturnToLobby
}) => {
  const isVictory = homeScore > awayScore;
  const isDraw = homeScore === awayScore;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#0A1A12]/90 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-2xl bg-[#0A1A12] border-2 border-[#D4AF37]/50 p-6 sm:p-8 shadow-2xl flex flex-col my-auto text-[#F4F1EA] text-center font-serif">
        {/* Banner Trophy */}
        <div className="mx-auto w-16 h-16 border border-[#D4AF37] bg-[#0E2319] text-[#D4AF37] flex items-center justify-center mb-3 shadow-xl">
          <Trophy className="w-8 h-8" />
        </div>

        <div className="text-[10px] uppercase font-bold tracking-[0.3em] text-[#D4AF37] font-sans">
          Final Chukker Bell
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-[0.2em] uppercase text-[#F4F1EA] mt-1">
          {isVictory ? 'Victory for the Royal Club!' : isDraw ? 'Stalemate in Extra Chukkers!' : 'Hard Fought Polo Defeat'}
        </h2>

        {/* Final Score Board */}
        <div className="mt-5 p-6 bg-[#0E2319] border border-[#D4AF37]/20 flex items-center justify-around">
          <div className="text-center">
            <div className="text-xs font-bold text-[#F4F1EA]/70 uppercase tracking-widest font-serif">{homeTeam.name}</div>
            <div className="font-serif text-4xl sm:text-5xl font-black text-[#D4AF37] mt-1">{homeScore}</div>
          </div>
          <div className="font-serif text-lg font-bold text-[#D4AF37]/40 tracking-widest">FINAL</div>
          <div className="text-center">
            <div className="text-xs font-bold text-[#F4F1EA]/70 uppercase tracking-widest font-serif">{awayTeam.name}</div>
            <div className="font-serif text-4xl sm:text-5xl font-black text-[#D4AF37] mt-1">{awayScore}</div>
          </div>
        </div>

        {/* Player Performance Breakdown */}
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3 text-left text-xs">
          <div className="p-3.5 bg-[#162A1F] border border-[#D4AF37]/20 border-l-2 border-l-[#D4AF37]">
            <div className="text-[#F4F1EA]/60 font-sans uppercase tracking-wider flex items-center gap-1 mb-1 text-[10px]">
              <Award className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Goals</span>
            </div>
            <div className="font-serif text-xl font-bold text-[#D4AF37]">{userStats.goals}</div>
          </div>

          <div className="p-3.5 bg-[#162A1F] border border-[#D4AF37]/20 border-l-2 border-l-[#D4AF37]">
            <div className="text-[#F4F1EA]/60 font-sans uppercase tracking-wider flex items-center gap-1 mb-1 text-[10px]">
              <Crosshair className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Shots Hit</span>
            </div>
            <div className="font-serif text-xl font-bold text-[#D4AF37]">{userStats.shots}</div>
          </div>

          <div className="p-3.5 bg-[#162A1F] border border-[#D4AF37]/20 border-l-2 border-l-[#D4AF37]">
            <div className="text-[#F4F1EA]/60 font-sans uppercase tracking-wider flex items-center gap-1 mb-1 text-[10px]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Ride-Offs</span>
            </div>
            <div className="font-serif text-xl font-bold text-[#D4AF37]">{userStats.rideOffsWon}</div>
          </div>

          <div className="p-3.5 bg-[#162A1F] border border-[#D4AF37]/20 border-l-2 border-l-[#D4AF37]">
            <div className="text-[#F4F1EA]/60 font-sans uppercase tracking-wider flex items-center gap-1 mb-1 text-[10px]">
              <Zap className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Hooks</span>
            </div>
            <div className="font-serif text-xl font-bold text-[#D4AF37]">{userStats.hooks}</div>
          </div>
        </div>

        {/* ELO Rating Adjust */}
        <div className="mt-4 p-3 bg-[#0E2319] border border-[#D4AF37]/30 text-xs font-semibold text-[#D4AF37] flex items-center justify-between font-sans">
          <span>Handicap Performance Adjustment:</span>
          <span className="font-serif font-bold text-sm">{isVictory ? '+35 Rating ELO' : isDraw ? '+10 ELO' : '-15 ELO'}</span>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col sm:flex-row justify-center gap-3">
          <button
            onClick={onRestart}
            className="px-6 py-2.5 border border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#0A1A12] font-sans font-bold text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-1.5 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Rematch</span>
          </button>

          <button
            onClick={onReturnToLobby}
            className="px-8 py-3 bg-[#D4AF37] hover:bg-[#F4F1EA] text-[#0A1A12] font-sans font-bold text-xs uppercase tracking-[0.3em] shadow-2xl flex items-center justify-center gap-1.5 transition-all"
          >
            <span>Clubhouse & Tourney</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
