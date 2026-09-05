import React from 'react';
import { Trophy, ChevronRight, CheckCircle2, Award, Play } from 'lucide-react';
import { TeamConfig, TournamentMatch } from '../types/polo';
import { POLO_TEAMS } from '../data/poloData';

interface TournamentBracketProps {
  userTeam: TeamConfig;
  currentMatchIndex: number;
  tournamentMatches: TournamentMatch[];
  onStartTournamentMatch: (match: TournamentMatch) => void;
  onClose: () => void;
}

export const TournamentBracket: React.FC<TournamentBracketProps> = ({
  userTeam,
  currentMatchIndex,
  tournamentMatches,
  onStartTournamentMatch,
  onClose
}) => {
  const currentMatch = tournamentMatches[currentMatchIndex];
  const isCupWon = tournamentMatches.every((m) => m.completed && m.winner === 'home');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-950/85 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-4xl bg-stone-900 border-2 border-amber-600/70 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col my-auto text-stone-100">
        {/* Cup Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400">
              <Trophy className="w-7 h-7" />
            </div>
            <div>
              <div className="text-xs uppercase font-bold tracking-widest text-amber-500 font-display">
                World Polo Tour Championship
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-wide font-display text-stone-100">
                The Gold Cup Invitational
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-xs text-stone-400 hover:text-stone-200 uppercase font-semibold"
          >
            Close
          </button>
        </div>

        {/* Cup Progression Bracket */}
        <div className="mt-6 space-y-4">
          {tournamentMatches.map((m, idx) => {
            const isCurrent = idx === currentMatchIndex && !m.completed;
            const isCompleted = m.completed;
            const isLocked = idx > currentMatchIndex;

            return (
              <div
                key={m.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row items-center justify-between gap-4 ${
                  isCurrent
                    ? 'bg-gradient-to-r from-amber-950/50 via-stone-900 to-amber-950/50 border-amber-500 shadow-xl ring-1 ring-amber-500/40'
                    : isCompleted
                    ? 'bg-stone-950/60 border-stone-800/80 opacity-90'
                    : 'bg-stone-950/30 border-stone-800/40 opacity-60'
                }`}
              >
                {/* Round Badge */}
                <div className="flex items-center gap-3 min-w-[160px]">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                      isCompleted
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : isCurrent
                        ? 'bg-amber-500 text-stone-950 font-black'
                        : 'bg-stone-800 text-stone-500'
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                  </div>
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-amber-400 font-display">
                      {m.roundName}
                    </div>
                    <div className="text-[11px] text-stone-400">
                      {isCompleted ? 'Match Completed' : isCurrent ? 'Ready for Play' : 'Upcoming Round'}
                    </div>
                  </div>
                </div>

                {/* Matchup Banner */}
                <div className="flex items-center gap-3 flex-1 justify-center">
                  {/* Home Team */}
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs sm:text-sm text-stone-100">{m.homeTeam.name}</span>
                    <div
                      className="w-3.5 h-3.5 rounded-full border border-stone-500"
                      style={{ backgroundColor: m.homeTeam.primaryColor }}
                    />
                  </div>

                  {/* Score or VS */}
                  <div className="px-3 py-1 rounded-lg bg-stone-950 border border-stone-800 font-mono text-xs font-black text-amber-400">
                    {isCompleted ? `${m.homeScore} - ${m.awayScore}` : 'VS'}
                  </div>

                  {/* Away Team */}
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3.5 h-3.5 rounded-full border border-stone-500"
                      style={{ backgroundColor: m.awayTeam.primaryColor }}
                    />
                    <span className="font-bold text-xs sm:text-sm text-stone-100">{m.awayTeam.name}</span>
                  </div>
                </div>

                {/* Action button */}
                <div>
                  {isCurrent && (
                    <button
                      onClick={() => onStartTournamentMatch(m)}
                      className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-display font-black text-xs uppercase tracking-wider shadow-lg flex items-center gap-1.5 transition-all animate-pulse"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Play Match</span>
                    </button>
                  )}
                  {isCompleted && (
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                      <Award className="w-4 h-4" />
                      <span>{m.winner === 'home' ? 'Victory!' : 'Defeated'}</span>
                    </span>
                  )}
                  {isLocked && (
                    <span className="text-xs text-stone-500 italic">Locked</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Cup Champion Banner */}
        {isCupWon && (
          <div className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 flex items-center justify-between shadow-2xl">
            <div className="flex items-center gap-3">
              <Trophy className="w-8 h-8 text-stone-950" />
              <div>
                <h3 className="font-display font-black text-lg uppercase tracking-wider">
                  Grand Cup Champion!
                </h3>
                <p className="text-xs font-semibold">
                  Congratulations! Your polo club has hoisted the prestigious Gold Cup trophy!
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
