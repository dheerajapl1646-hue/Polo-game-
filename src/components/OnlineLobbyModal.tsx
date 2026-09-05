import React, { useState } from 'react';
import { Globe, Users, Trophy, Shield, Wifi, Play, Plus, Sparkles, Check, ArrowRight } from 'lucide-react';
import { TeamConfig } from '../types/polo';
import { POLO_TEAMS } from '../data/poloData';

interface OnlineLobbyModalProps {
  onJoinMatch: (rivalTeam: TeamConfig, pitch: 'turf' | 'snow' | 'arena') => void;
  onClose: () => void;
}

export const OnlineLobbyModal: React.FC<OnlineLobbyModalProps> = ({ onJoinMatch, onClose }) => {
  const [activeTab, setActiveTab] = useState<'rooms' | 'ranked' | 'leaderboard'>('rooms');
  const [searchingMatch, setSearchingMatch] = useState(false);
  const [matchedOpponent, setMatchedOpponent] = useState<string | null>(null);

  // Simulated live rooms in world polo network
  const [rooms] = useState([
    {
      id: 'room-1',
      name: 'Hurlingham Royal Derby',
      host: 'Lord Albright (UK)',
      pitch: 'turf' as const,
      players: '3/4',
      ping: '28ms',
      chukkers: 4,
      team: POLO_TEAMS[0]
    },
    {
      id: 'room-2',
      name: 'Palermo Palermo Clasico',
      host: 'Gonzalo_Arg (ARG)',
      pitch: 'turf' as const,
      players: '2/4',
      ping: '84ms',
      chukkers: 4,
      team: POLO_TEAMS[1]
    },
    {
      id: 'room-3',
      name: 'St. Moritz Snow Invitational',
      host: 'Sven_Glacier (SUI)',
      pitch: 'snow' as const,
      players: '1/4',
      ping: '42ms',
      chukkers: 2,
      team: POLO_TEAMS[4]
    },
    {
      id: 'room-4',
      name: 'Dubai Sands Arena Clash',
      host: 'Sheikh_Rashid (UAE)',
      pitch: 'arena' as const,
      players: '2/4',
      ping: '65ms',
      chukkers: 2,
      team: POLO_TEAMS[3]
    }
  ]);

  const handleQuickMatch = () => {
    setSearchingMatch(true);
    setMatchedOpponent(null);

    // Simulate instant online matchmaking
    setTimeout(() => {
      const randomTeam = POLO_TEAMS[Math.floor(Math.random() * POLO_TEAMS.length)];
      setMatchedOpponent(randomTeam.name);
      setTimeout(() => {
        setSearchingMatch(false);
        onJoinMatch(randomTeam, 'turf');
      }, 1000);
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#0A1A12]/90 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-4xl bg-[#0A1A12] border-2 border-[#D4AF37]/50 p-6 sm:p-8 shadow-2xl flex flex-col my-auto text-[#F4F1EA] font-serif">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#D4AF37]/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 border border-[#D4AF37] bg-[#0E2319] text-[#D4AF37] flex items-center justify-center">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold tracking-[0.3em] text-[#D4AF37] font-sans">
                Global Club Network
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-[0.2em] uppercase text-[#F4F1EA] mt-0.5">
                Online Polo Matchmaking & Club Arenas
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-xs text-[#F4F1EA]/60 hover:text-[#D4AF37] uppercase tracking-[0.2em] font-sans font-semibold transition-colors"
          >
            Close
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 mt-5 border-b border-[#D4AF37]/20 pb-3">
          <button
            onClick={() => setActiveTab('rooms')}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] font-sans transition-all flex items-center gap-2 ${
              activeTab === 'rooms'
                ? 'bg-[#D4AF37] text-[#0A1A12] shadow-md font-bold'
                : 'bg-[#0E2319] text-[#F4F1EA]/60 hover:text-[#D4AF37] border border-[#D4AF37]/20'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Open Matches ({rooms.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('ranked')}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] font-sans transition-all flex items-center gap-2 ${
              activeTab === 'ranked'
                ? 'bg-[#D4AF37] text-[#0A1A12] shadow-md font-bold'
                : 'bg-[#0E2319] text-[#F4F1EA]/60 hover:text-[#D4AF37] border border-[#D4AF37]/20'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>Ranked 10-Goal Ladder</span>
          </button>
        </div>

        {/* Quick Match Bar */}
        <div className="mt-5 p-5 bg-[#0E2319] border border-[#D4AF37]/30 border-l-4 border-l-[#D4AF37] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="font-serif font-bold text-sm text-[#F4F1EA] tracking-wider uppercase">
              Quick Competitive Matchmaking
            </div>
            <div className="text-xs text-[#F4F1EA]/60 font-sans mt-0.5">
              Instantly match against high-goal opponents in an official 4-chukker duel.
            </div>
          </div>

          <button
            onClick={handleQuickMatch}
            disabled={searchingMatch}
            className="px-6 py-2.5 bg-[#D4AF37] hover:bg-[#F4F1EA] disabled:bg-[#162A1F] text-[#0A1A12] font-sans font-bold text-xs uppercase tracking-[0.2em] shadow-lg transition-all flex items-center gap-2"
          >
            {searchingMatch ? (
              <>
                <div className="w-4 h-4 border-2 border-[#0A1A12] border-t-transparent rounded-full animate-spin" />
                <span>{matchedOpponent ? `Matched: ${matchedOpponent}!` : 'Finding Opponents...'}</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Find Match Now</span>
              </>
            )}
          </button>
        </div>

        {/* Tab 1: Live Rooms List */}
        {activeTab === 'rooms' && (
          <div className="mt-5 space-y-3">
            {rooms.map((room) => (
              <div
                key={room.id}
                className="p-4 bg-[#0E2319] border border-[#D4AF37]/20 hover:border-[#D4AF37]/60 transition-all flex flex-col sm:flex-row items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-3.5 h-10 border border-[#D4AF37]/30"
                    style={{ backgroundColor: room.team.primaryColor }}
                  />
                  <div>
                    <div className="font-bold text-sm text-[#F4F1EA] flex items-center gap-2 font-serif">
                      <span>{room.name}</span>
                      <span className="text-[9px] px-1.5 py-0.5 border border-[#D4AF37]/40 text-[#D4AF37] font-sans uppercase">
                        {room.pitch.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-xs text-[#F4F1EA]/60 flex items-center gap-2 mt-0.5 font-sans">
                      <span>Host: {room.host}</span>
                      <span>•</span>
                      <span>{room.chukkers} Chukkers</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right text-xs font-sans">
                    <div className="text-[#F4F1EA]/80 font-semibold">{room.players} Riders</div>
                    <div className="text-[#D4AF37] font-mono flex items-center gap-1 justify-end">
                      <Wifi className="w-3 h-3" />
                      <span>{room.ping}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => onJoinMatch(room.team, room.pitch)}
                    className="px-4 py-2 border border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#0A1A12] font-bold text-xs uppercase tracking-[0.2em] font-sans transition-all flex items-center gap-1"
                  >
                    <span>Join Arena</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 2: Ranked 10-Goal Ladder */}
        {activeTab === 'ranked' && (
          <div className="mt-5 space-y-4">
            {/* Active Pro Card pattern from Artistic Flair */}
            <div className="p-6 bg-[#162A1F] border-l-4 border-[#D4AF37] border-y border-r border-[#D4AF37]/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 border border-[#D4AF37] bg-[#0E2319] flex items-center justify-center font-bold text-xl text-[#D4AF37] font-serif shadow-lg">
                  8★
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase text-[#D4AF37] tracking-[0.3em] font-sans">
                    Active Pro Card
                  </div>
                  <div className="text-xl font-bold font-serif text-[#F4F1EA]">
                    High-Goal 8-Goaler
                  </div>
                  <div className="text-xs text-[#D4AF37] italic font-serif mt-1">
                    Ranked top 3% worldwide • Hurlingham Gold Cup Finalist
                  </div>
                </div>
              </div>
              <div className="text-left sm:text-right font-sans">
                <div className="font-serif text-2xl font-bold text-[#D4AF37]">2,480 ELO</div>
                <div className="text-[10px] text-[#F4F1EA]/60 uppercase tracking-widest mt-0.5">Rank #42 Worldwide</div>
              </div>
            </div>

            {/* Worldwide Leaderboard Table */}
            <div className="border border-[#D4AF37]/20 bg-[#0E2319] overflow-hidden text-xs">
              <div className="grid grid-cols-12 bg-[#0A1A12] p-3 font-bold uppercase tracking-wider text-[#D4AF37] font-sans border-b border-[#D4AF37]/20">
                <div className="col-span-1">#</div>
                <div className="col-span-5">Player / Club</div>
                <div className="col-span-3 text-center">Handicap</div>
                <div className="col-span-3 text-right">Rating Points</div>
              </div>
              {[
                { rank: 1, name: 'Adolfo Cambiaso (La Dolfina)', hcp: '10 Goals', pts: '3,120' },
                { rank: 2, name: 'Facundo Pieres (Ellerstina)', hcp: '10 Goals', pts: '2,980' },
                { rank: 3, name: 'Pablo Mac Donough (Dubai)', hcp: '10 Goals', pts: '2,910' },
                { rank: 4, name: 'Lord Henry Albright (Hurlingham)', hcp: '9 Goals', pts: '2,740' },
                { rank: 5, name: 'You (Online Player)', hcp: '8 Goals', pts: '2,480', isUser: true }
              ].map((row) => (
                <div
                  key={row.rank}
                  className={`grid grid-cols-12 p-3 items-center border-b border-[#D4AF37]/10 font-sans ${
                    row.isUser ? 'bg-[#162A1F] font-bold text-[#D4AF37] border-l-2 border-l-[#D4AF37]' : 'text-[#F4F1EA]/80'
                  }`}
                >
                  <div className="col-span-1 font-mono font-bold text-[#D4AF37]">#{row.rank}</div>
                  <div className="col-span-5 font-medium">{row.name}</div>
                  <div className="col-span-3 text-center font-serif text-[#D4AF37]">{row.hcp}</div>
                  <div className="col-span-3 text-right font-mono font-bold text-[#F4F1EA]">{row.pts}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
