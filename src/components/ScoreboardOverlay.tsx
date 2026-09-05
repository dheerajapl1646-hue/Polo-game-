import React from 'react';
import { Volume2, VolumeX, Pause, Play, RotateCcw, HelpCircle, Trophy, Award, Shield } from 'lucide-react';
import { MatchState, TeamConfig } from '../types/polo';
import { poloAudio } from '../utils/audio';

interface ScoreboardOverlayProps {
  matchState: MatchState;
  homeTeam: TeamConfig;
  awayTeam: TeamConfig;
  isPaused: boolean;
  isMuted: boolean;
  onTogglePause: () => void;
  onToggleMute: () => void;
  onRestartMatch: () => void;
  onOpenRules: () => void;
  onOpenStats: () => void;
  onOpenTackRoom: () => void;
}

export const ScoreboardOverlay: React.FC<ScoreboardOverlayProps> = ({
  matchState,
  homeTeam,
  awayTeam,
  isPaused,
  isMuted,
  onTogglePause,
  onToggleMute,
  onRestartMatch,
  onOpenRules,
  onOpenStats,
  onOpenTackRoom
}) => {
  // Format chukker clock mm:ss
  const minutes = Math.floor(Math.max(0, matchState.chukkerTimeRemaining) / 60);
  const seconds = Math.floor(Math.max(0, matchState.chukkerTimeRemaining) % 60);
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  return (
    <div className="absolute top-0 left-0 right-0 z-20 pointer-events-none p-3 sm:p-4 flex flex-col items-center">
      {/* Top Bar with Scoreboard & Action Controls */}
      <div className="w-full max-w-5xl flex items-center justify-between gap-3">
        {/* Left Team Info (Pro Card style from Artistic Flair) */}
        <div className="pointer-events-auto hidden md:flex items-center gap-3 bg-[#162A1F] border-l-4 border-[#D4AF37] border-y border-r border-[#D4AF37]/20 px-3.5 py-2 shadow-xl">
          <div
            className="w-3.5 h-9 border border-[#D4AF37]/30 shadow-inner"
            style={{ backgroundColor: homeTeam.primaryColor }}
          />
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#D4AF37] font-serif flex items-center gap-1.5">
              <span>{homeTeam.name}</span>
              <span className="text-[10px] px-1.5 py-0.5 border border-[#D4AF37]/40 text-[#D4AF37] font-sans">
                {homeTeam.handicap}H
              </span>
            </div>
            <div className="text-[10px] text-[#F4F1EA]/60 font-sans uppercase tracking-widest mt-0.5">{homeTeam.clubCity}</div>
          </div>
        </div>

        {/* Center Vintage Club Digital Scoreboard */}
        <div className="pointer-events-auto flex items-center bg-[#0A1A12]/95 border-2 border-[#D4AF37]/50 shadow-2xl px-4 py-2 sm:px-6 sm:py-2.5 backdrop-blur-xl">
          {/* Home Score */}
          <div className="flex items-center gap-3">
            <span className="text-xs sm:text-sm font-bold tracking-[0.2em] text-[#F4F1EA] uppercase font-serif">
              {homeTeam.shortName}
            </span>
            <span
              id="home-score-display"
              className="font-serif text-2xl sm:text-4xl font-black text-[#D4AF37] w-8 text-center"
            >
              {matchState.homeScore}
            </span>
          </div>

          {/* Chukker Timer Center Block */}
          <div className="mx-4 sm:mx-6 px-3 sm:px-5 py-1 flex flex-col items-center border-x border-[#D4AF37]/20">
            <div className="text-[9px] sm:text-[10px] font-bold tracking-[0.3em] text-[#D4AF37] uppercase font-sans">
              CHUKKER {matchState.currentChukker}/{matchState.totalChukkers}
            </div>
            <div
              id="chukker-time-display"
              className="font-mono text-lg sm:text-2xl font-bold tracking-wider text-[#F4F1EA]"
            >
              {formattedTime}
            </div>
            {matchState.fieldSideSwapped && (
              <span className="text-[8px] uppercase tracking-[0.2em] text-[#D4AF37] font-sans font-semibold flex items-center gap-1 border border-[#D4AF37]/30 bg-[#0E2319] px-1.5 py-0.5 mt-0.5">
                <RotateCcw className="w-2.5 h-2.5" /> Ends Swapped
              </span>
            )}
          </div>

          {/* Away Score */}
          <div className="flex items-center gap-3">
            <span
              id="away-score-display"
              className="font-serif text-2xl sm:text-4xl font-black text-[#D4AF37] w-8 text-center"
            >
              {matchState.awayScore}
            </span>
            <span className="text-xs sm:text-sm font-bold tracking-[0.2em] text-[#F4F1EA] uppercase font-serif">
              {awayTeam.shortName}
            </span>
          </div>
        </div>

        {/* Right Action Buttons */}
        <div className="pointer-events-auto flex items-center gap-1.5 sm:gap-2 bg-[#0E2319] border border-[#D4AF37]/30 p-1.5 shadow-xl">
          <button
            id="toggle-pause-btn"
            onClick={onTogglePause}
            className="p-2 bg-[#162A1F] hover:bg-[#0A1A12] border border-[#D4AF37]/20 hover:border-[#D4AF37] text-[#F4F1EA] transition-colors"
            title={isPaused ? 'Resume Match' : 'Pause Match'}
          >
            {isPaused ? <Play className="w-4 h-4 text-[#D4AF37]" /> : <Pause className="w-4 h-4" />}
          </button>

          <button
            id="toggle-mute-btn"
            onClick={onToggleMute}
            className="p-2 bg-[#162A1F] hover:bg-[#0A1A12] border border-[#D4AF37]/20 hover:border-[#D4AF37] text-[#F4F1EA] transition-colors"
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-[#D4AF37]" />}
          </button>

          <button
            id="open-rules-btn"
            onClick={onOpenRules}
            className="p-2 bg-[#162A1F] hover:bg-[#0A1A12] border border-[#D4AF37]/20 hover:border-[#D4AF37] text-[#F4F1EA] transition-colors"
            title="Polo Rules & Controls"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          <button
            id="restart-match-btn"
            onClick={onRestartMatch}
            className="p-2 bg-[#162A1F] hover:bg-[#0A1A12] border border-[#D4AF37]/20 hover:border-[#D4AF37] text-[#F4F1EA] transition-colors"
            title="Restart Match"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            id="open-tack-room-btn"
            onClick={onOpenTackRoom}
            className="hidden sm:flex items-center gap-1 px-3 py-1.5 border border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#0A1A12] text-[10px] font-sans font-bold uppercase tracking-[0.2em] transition-all"
            title="Stable & Tack Room"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Stables</span>
          </button>
        </div>
      </div>

      {/* Goal Celebration Banner Overlay */}
      {matchState.goalCelebrationTime > 0 && (
        <div className="pointer-events-auto mt-4 px-8 py-3.5 bg-[#0A1A12] text-[#F4F1EA] border-2 border-[#D4AF37] shadow-2xl backdrop-blur-md animate-bounce flex items-center gap-3">
          <Trophy className="w-7 h-7 text-[#D4AF37]" />
          <div>
            <div className="font-serif font-black text-xl tracking-[0.2em] uppercase text-[#D4AF37]">GOAL SCORED!</div>
            <div className="text-xs font-sans tracking-widest uppercase text-[#F4F1EA]/80">
              {matchState.lastGoalScorer ? `${matchState.lastGoalScorer}` : 'Spectacular Polo Drive!'}
            </div>
          </div>
        </div>
      )}

      {/* Foul Alert Notice */}
      {matchState.foulNotice && (
        <div className="pointer-events-auto mt-3 px-5 py-2.5 bg-[#162A1F] text-[#F4F1EA] border-l-4 border-red-500 border-y border-r border-[#D4AF37]/20 shadow-xl backdrop-blur-md flex items-center gap-2.5 animate-pulse">
          <Award className="w-4 h-4 text-red-400" />
          <span className="text-xs font-sans tracking-wide uppercase">{matchState.foulNotice}</span>
        </div>
      )}
    </div>
  );
};
