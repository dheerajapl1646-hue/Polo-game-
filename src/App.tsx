/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  FieldType,
  GameMode,
  HorseProfile,
  MatchState,
  PlayerStats,
  PositionId,
  TeamConfig,
  TournamentMatch
} from './types/polo';
import { POLO_PONIES, POLO_TEAMS } from './data/poloData';
import { PoloFieldCanvas } from './components/PoloFieldCanvas';
import { ScoreboardOverlay } from './components/ScoreboardOverlay';
import { TouchControls } from './components/TouchControls';
import { ClubhouseHeader } from './components/ClubhouseHeader';
import { StableTackRoom } from './components/StableTackRoom';
import { TournamentBracket } from './components/TournamentBracket';
import { PenaltyChallenge } from './components/PenaltyChallenge';
import { DivotStompModal } from './components/DivotStompModal';
import { HowToPlayModal } from './components/HowToPlayModal';
import { OnlineLobbyModal } from './components/OnlineLobbyModal';
import { MatchEndModal } from './components/MatchEndModal';
import { ExhibitionSettingsModal } from './components/ExhibitionSettingsModal';
import { poloAudio } from './utils/audio';

const INITIAL_CHUKKER_DURATION = 120; // 2 minutes per chukker

export default function App() {
  // Core Game Configurations
  const [gameMode, setGameMode] = useState<GameMode>('exhibition');
  const [fieldType, setFieldType] = useState<FieldType>('turf');
  const [homeTeam, setHomeTeam] = useState<TeamConfig>(POLO_TEAMS[0]); // Hurlingham
  const [awayTeam, setAwayTeam] = useState<TeamConfig>(POLO_TEAMS[1]); // Palermo
  const [userHorse, setUserHorse] = useState<HorseProfile>(POLO_PONIES[0]);
  const [userPosition, setUserPosition] = useState<PositionId>(1);
  const [totalChukkers, setTotalChukkers] = useState<number>(4);

  // Audio and Match State
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  const [matchState, setMatchState] = useState<MatchState>({
    currentChukker: 1,
    totalChukkers: 4,
    chukkerTimeRemaining: INITIAL_CHUKKER_DURATION,
    homeScore: 0,
    awayScore: 0,
    isPaused: false,
    isGameOver: false,
    isHalftime: false,
    foulNotice: null,
    foulTime: 0,
    lastGoalScorer: null,
    lastGoalTeam: null,
    goalCelebrationTime: 0,
    fieldSideSwapped: false,
    divotsRepaired: 0,
    weather: 'sunny'
  });

  // Touch Input State for Virtual Joystick & Buttons
  const [touchInput, setTouchInput] = useState<{
    moveX: number;
    moveY: number;
    swing: boolean;
    sprint: boolean;
    hook: boolean;
  } | null>(null);

  // Modals Visibility
  const [showStable, setShowStable] = useState<boolean>(false);
  const [showTournament, setShowTournament] = useState<boolean>(false);
  const [showHowToPlay, setShowHowToPlay] = useState<boolean>(false);
  const [showOnlineLobby, setShowOnlineLobby] = useState<boolean>(false);
  const [showExhibitionSettings, setShowExhibitionSettings] = useState<boolean>(false);
  const [showDivotStomp, setShowDivotStomp] = useState<boolean>(false);
  const [showMatchEnd, setShowMatchEnd] = useState<boolean>(false);

  // Match performance stats
  const [finalStats, setFinalStats] = useState<PlayerStats>({
    goals: 0,
    shots: 0,
    shotsOnTarget: 0,
    fouls: 0,
    rideOffsWon: 0,
    hooks: 0,
    distanceCovered: 0
  });

  // Tournament Matches Bracket State
  const [tournamentIndex, setTournamentIndex] = useState<number>(0);
  const [tournamentMatches, setTournamentMatches] = useState<TournamentMatch[]>([
    {
      id: 'tourney-qf',
      round: 'quarter',
      roundName: 'Quarterfinal Invitational',
      homeTeam: POLO_TEAMS[0],
      awayTeam: POLO_TEAMS[2], // Greenwich
      completed: false
    },
    {
      id: 'tourney-sf',
      round: 'semi',
      roundName: 'Semifinal Clásico',
      homeTeam: POLO_TEAMS[0],
      awayTeam: POLO_TEAMS[3], // Dubai
      completed: false
    },
    {
      id: 'tourney-fn',
      round: 'final',
      roundName: 'Grand Gold Cup Final',
      homeTeam: POLO_TEAMS[0],
      awayTeam: POLO_TEAMS[1], // Palermo
      completed: false
    }
  ]);

  // Restart or reset current match
  const handleRestartMatch = () => {
    setMatchState({
      currentChukker: 1,
      totalChukkers,
      chukkerTimeRemaining: INITIAL_CHUKKER_DURATION,
      homeScore: 0,
      awayScore: 0,
      isPaused: false,
      isGameOver: false,
      isHalftime: false,
      foulNotice: null,
      foulTime: 0,
      lastGoalScorer: null,
      lastGoalTeam: null,
      goalCelebrationTime: 0,
      fieldSideSwapped: false,
      divotsRepaired: 0,
      weather: 'sunny'
    });
    setIsPaused(false);
    setShowMatchEnd(false);
    poloAudio.playWhistle(true);
  };

  // Toggle Mute
  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    poloAudio.setMuted(nextMuted);
  };

  // Match End Handler
  const handleMatchEnd = (homeScore: number, awayScore: number, userStats: PlayerStats) => {
    setFinalStats(userStats);
    setShowMatchEnd(true);

    // If tournament mode, mark current match completed
    if (gameMode === 'tournament') {
      setTournamentMatches((prev) => {
        const next = [...prev];
        if (next[tournamentIndex]) {
          next[tournamentIndex] = {
            ...next[tournamentIndex],
            homeScore,
            awayScore,
            completed: true,
            winner: homeScore >= awayScore ? 'home' : 'away'
          };
        }
        return next;
      });
      if (homeScore >= awayScore && tournamentIndex < tournamentMatches.length - 1) {
        setTournamentIndex((idx) => idx + 1);
      }
    }
  };

  // Halftime Divot Stomping Trigger
  const handleHalftimeDivotStomp = () => {
    setIsPaused(true);
    setShowDivotStomp(true);
  };

  // Resume after divot stomping
  const handleDivotStompComplete = (repairedCount: number) => {
    setShowDivotStomp(false);
    setIsPaused(false);
    setMatchState((prev) => ({
      ...prev,
      isHalftime: false,
      divotsRepaired: prev.divotsRepaired + repairedCount
    }));
    poloAudio.playWhistle(true);
  };

  // Mode Selection
  const handleSelectMode = (mode: GameMode) => {
    setGameMode(mode);
    if (mode === 'tournament') {
      setShowTournament(true);
    } else if (mode === 'exhibition') {
      setShowExhibitionSettings(true);
    } else {
      handleRestartMatch();
    }
  };

  // Start specific tournament match
  const handleStartTournamentMatch = (match: TournamentMatch) => {
    setHomeTeam(match.homeTeam);
    setAwayTeam(match.awayTeam);
    setShowTournament(false);
    handleRestartMatch();
  };

  // Join online room
  const handleJoinOnlineMatch = (rivalTeam: TeamConfig, pitch: FieldType) => {
    setAwayTeam(rivalTeam);
    setFieldType(pitch);
    setShowOnlineLobby(false);
    setGameMode('exhibition');
    handleRestartMatch();
  };

  return (
    <div className="relative w-full h-screen flex flex-col bg-[#0A1A12] text-[#F4F1EA] border-[6px] sm:border-[10px] md:border-[12px] border-[#162A1F] overflow-hidden select-none font-serif">
      {/* 1. Clubhouse Top Navigation Header */}
      <ClubhouseHeader
        currentMode={gameMode}
        fieldType={fieldType}
        onSelectMode={handleSelectMode}
        onSelectField={setFieldType}
        onOpenRules={() => setShowHowToPlay(true)}
        onOpenStable={() => setShowStable(true)}
        onOpenOnlineLobby={() => setShowOnlineLobby(true)}
      />

      {/* 2. Main Play Area */}
      <main className="relative flex-1 w-full h-full overflow-hidden">
        {gameMode === 'penalties' ? (
          /* Penalty Shootout Mini-Game */
          <PenaltyChallenge onBackToMatch={() => setGameMode('exhibition')} />
        ) : (
          /* Real-Time 2D Equestrian Polo Field Canvas */
          <>
            <PoloFieldCanvas
              homeTeam={homeTeam}
              awayTeam={awayTeam}
              userHorse={userHorse}
              fieldType={fieldType}
              gameMode={gameMode}
              totalChukkers={totalChukkers}
              chukkerDurationSec={INITIAL_CHUKKER_DURATION}
              onMatchEnd={handleMatchEnd}
              onHalftimeDivotStomp={handleHalftimeDivotStomp}
              touchInput={touchInput}
              isPaused={isPaused}
              matchState={matchState}
              setMatchState={setMatchState}
            />

            {/* Scoreboard Overlay with Vintage Brass / Gold Accents */}
            <ScoreboardOverlay
              matchState={matchState}
              homeTeam={homeTeam}
              awayTeam={awayTeam}
              isPaused={isPaused}
              isMuted={isMuted}
              onTogglePause={() => setIsPaused((p) => !p)}
              onToggleMute={handleToggleMute}
              onRestartMatch={handleRestartMatch}
              onOpenRules={() => setShowHowToPlay(true)}
              onOpenStats={() => setShowMatchEnd(true)}
              onOpenTackRoom={() => setShowStable(true)}
            />

            {/* Mobile / Tablet On-Screen Touch Controls */}
            <TouchControls onUpdateInput={setTouchInput} />
          </>
        )}
      </main>

      {/* Regal Status Footer Strip from Artistic Flair Design */}
      <footer className="h-6 sm:h-7 border-t border-[#D4AF37]/20 flex items-center px-4 sm:px-8 bg-[#0A1A12] z-20 shrink-0">
        <div className="w-full flex justify-between items-center text-[8px] sm:text-[9px] uppercase tracking-[0.3em] sm:tracking-[0.4em] text-[#F4F1EA]/50 font-sans">
          <span>Est. 1875 Digital</span>
          <span className="hidden md:inline">Server Status: Optimal</span>
          <span className="hidden sm:inline">Hurlingham Polo Rules</span>
          <span>© Regal Polo Interactive</span>
        </div>
      </footer>

      {/* 3. Modals and Drawers */}
      {/* Stable & Tack Room (Horse Selection) */}
      {showStable && (
        <StableTackRoom
          currentHorse={userHorse}
          currentPosition={userPosition}
          onSelectHorse={setUserHorse}
          onSelectPosition={setUserPosition}
          onClose={() => setShowStable(false)}
        />
      )}

      {/* Tournament Gold Cup Progression Bracket */}
      {showTournament && (
        <TournamentBracket
          userTeam={homeTeam}
          currentMatchIndex={tournamentIndex}
          tournamentMatches={tournamentMatches}
          onStartTournamentMatch={handleStartTournamentMatch}
          onClose={() => setShowTournament(false)}
        />
      )}

      {/* How to Play & Official Polo Rules */}
      {showHowToPlay && <HowToPlayModal onClose={() => setShowHowToPlay(false)} />}

      {/* Online Matchmaking Lobby */}
      {showOnlineLobby && (
        <OnlineLobbyModal
          onJoinMatch={handleJoinOnlineMatch}
          onClose={() => setShowOnlineLobby(false)}
        />
      )}

      {/* Exhibition Fixture & Custom Settings */}
      {showExhibitionSettings && (
        <ExhibitionSettingsModal
          homeTeam={homeTeam}
          awayTeam={awayTeam}
          fieldType={fieldType}
          totalChukkers={totalChukkers}
          onSelectHomeTeam={setHomeTeam}
          onSelectAwayTeam={setAwayTeam}
          onSelectFieldType={setFieldType}
          onSelectTotalChukkers={setTotalChukkers}
          onStartMatch={() => {
            setShowExhibitionSettings(false);
            handleRestartMatch();
          }}
          onClose={() => setShowExhibitionSettings(false)}
        />
      )}

      {/* Halftime Interactive Divot Stomping Mini-Event */}
      {showDivotStomp && (
        <DivotStompModal onComplete={handleDivotStompComplete} />
      )}

      {/* Post-Match Results & Trophy Scorecard */}
      {showMatchEnd && (
        <MatchEndModal
          homeScore={matchState.homeScore}
          awayScore={matchState.awayScore}
          homeTeam={homeTeam}
          awayTeam={awayTeam}
          userStats={finalStats}
          onRestart={handleRestartMatch}
          onReturnToLobby={() => {
            setShowMatchEnd(false);
            setShowOnlineLobby(true);
          }}
        />
      )}
    </div>
  );
}
