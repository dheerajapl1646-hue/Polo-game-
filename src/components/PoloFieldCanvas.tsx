import React, { useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import {
  FieldType,
  GameMode,
  HorseProfile,
  LineOfTheBall,
  MatchState,
  PoloBall,
  PoloPlayer,
  TeamConfig,
  TurfDivot
} from '../types/polo';
import {
  FIELD_HEIGHT,
  FIELD_WIDTH,
  GOAL_CENTER_Y,
  GOAL_LEFT_X,
  GOAL_RIGHT_X,
  createInitialBall,
  updateGamePhysics
} from '../game/physics';
import { PoloRenderer } from '../game/renderer';
import { poloAudio } from '../utils/audio';

interface PoloFieldCanvasProps {
  homeTeam: TeamConfig;
  awayTeam: TeamConfig;
  userHorse: HorseProfile;
  fieldType: FieldType;
  gameMode: GameMode;
  totalChukkers?: number;
  chukkerDurationSec?: number;
  onMatchEnd: (homeScore: number, awayScore: number, userStats: PoloPlayer['stats']) => void;
  onHalftimeDivotStomp: () => void;
  touchInput: { moveX: number; moveY: number; swing: boolean; sprint: boolean; hook: boolean } | null;
  isPaused: boolean;
  matchState: MatchState;
  setMatchState: React.Dispatch<React.SetStateAction<MatchState>>;
}

export const PoloFieldCanvas: React.FC<PoloFieldCanvasProps> = ({
  homeTeam,
  awayTeam,
  userHorse,
  fieldType,
  gameMode,
  totalChukkers = 4,
  chukkerDurationSec = 120, // 2 minutes per chukker for snappy web gameplay
  onMatchEnd,
  onHalftimeDivotStomp,
  touchInput,
  isPaused,
  matchState,
  setMatchState
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rendererRef = useRef<PoloRenderer>(new PoloRenderer());
  const keysRef = useRef<Set<string>>(new Set());
  const p2KeysRef = useRef<Set<string>>(new Set());

  // Game state refs for performance in 60fps loop
  const playersRef = useRef<PoloPlayer[]>([]);
  const ballRef = useRef<PoloBall>(createInitialBall());
  const lobRef = useRef<LineOfTheBall | null>(null);
  const divotsRef = useRef<TurfDivot[]>([]);
  const cameraRef = useRef({ x: FIELD_WIDTH / 2, y: FIELD_HEIGHT / 2, zoom: 1.1 });
  const animFrameIdRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());

  // Initialize Players based on teams and selected horse
  const initRosters = () => {
    const isTwoPlayer = gameMode === 'twoplayer';
    const isPractice = gameMode === 'practice';
    const isPenalties = gameMode === 'penalties';

    const newPlayers: PoloPlayer[] = [];

    // Home Team Players (4 riders)
    const homePositions: { num: 1 | 2 | 3 | 4; x: number; y: number; name: string }[] = [
      { num: 1, x: 700, y: 380, name: 'You (Lead #1)' },
      { num: 2, x: 620, y: 620, name: 'Sterling (#2)' },
      { num: 3, x: 480, y: 500, name: 'Montgomery (#3)' },
      { num: 4, x: 320, y: 500, name: 'Kensington (#4)' }
    ];

    homePositions.forEach((pos, idx) => {
      const isUser = idx === 0;
      newPlayers.push({
        id: `home_${pos.num}`,
        name: isUser ? `${pos.name}` : `${homeTeam.shortName} #${pos.num}`,
        jerseyNumber: pos.num,
        team: 'home',
        handicap: isUser ? 8 : 7,
        isUser,
        x: pos.x,
        y: pos.y,
        vx: 0,
        vy: 0,
        angle: 0,
        targetAngle: 0,
        speed: 0,
        maxSpeed: 175,
        stamina: 100,
        isSprinting: false,
        swingCharge: 0,
        isSwinging: false,
        swingProgress: 0,
        swingType: 'offside_forehand',
        horse: isUser ? userHorse : { ...userHorse, name: 'Mount ' + pos.num },
        stats: {
          goals: 0,
          shots: 0,
          shotsOnTarget: 0,
          fouls: 0,
          rideOffsWon: 0,
          hooks: 0,
          distanceCovered: 0
        },
        hookCooldown: 0,
        animFrame: 0,
        lastHitTime: 0
      });
    });

    // Away Team Players (if not practice mode)
    if (!isPractice) {
      const awayPositions: { num: 1 | 2 | 3 | 4; x: number; y: number }[] = [
        { num: 1, x: 1100, y: 620 },
        { num: 2, x: 1180, y: 380 },
        { num: 3, x: 1320, y: 500 },
        { num: 4, x: 1480, y: 500 }
      ];

      awayPositions.forEach((pos, idx) => {
        // If two-player mode, Player 2 controls Away #1
        const isPlayer2 = isTwoPlayer && idx === 0;

        newPlayers.push({
          id: `away_${pos.num}`,
          name: isPlayer2 ? 'Player 2 (#1)' : `${awayTeam.shortName} #${pos.num}`,
          jerseyNumber: pos.num,
          team: 'away',
          handicap: 8,
          isUser: false,
          isPlayer2,
          x: pos.x,
          y: pos.y,
          vx: 0,
          vy: 0,
          angle: Math.PI,
          targetAngle: Math.PI,
          speed: 0,
          maxSpeed: 175,
          stamina: 100,
          isSprinting: false,
          swingCharge: 0,
          isSwinging: false,
          swingProgress: 0,
          swingType: 'offside_forehand',
          horse: {
            ...userHorse,
            id: `away_horse_${pos.num}`,
            name: 'Rival Steed ' + pos.num,
            color: '#1c1917'
          },
          stats: {
            goals: 0,
            shots: 0,
            shotsOnTarget: 0,
            fouls: 0,
            rideOffsWon: 0,
            hooks: 0,
            distanceCovered: 0
          },
          hookCooldown: 0,
          animFrame: 0,
          lastHitTime: 0
        });
      });
    }

    playersRef.current = newPlayers;
    ballRef.current = createInitialBall();

    // Initial divots on field
    const initialDivots: TurfDivot[] = [];
    for (let i = 0; i < 18; i++) {
      initialDivots.push({
        x: 200 + Math.random() * (FIELD_WIDTH - 400),
        y: 120 + Math.random() * (FIELD_HEIGHT - 240),
        repaired: false,
        rotation: Math.random() * Math.PI * 2,
        size: 5 + Math.random() * 6
      });
    }
    divotsRef.current = initialDivots;
  };

  // Reset ball and positions after goal
  const resetAfterGoal = (scoringTeam: 'home' | 'away') => {
    // In authentic polo, teams swap field ends after every goal!
    setMatchState((prev) => ({
      ...prev,
      fieldSideSwapped: !prev.fieldSideSwapped,
      goalCelebrationTime: 2.8,
      lastGoalTeam: scoringTeam
    }));

    ballRef.current = createInitialBall();

    // Line up for center throw-in (bowl-in)
    playersRef.current.forEach((player) => {
      const isHome = player.team === 'home';
      const sideSign = isHome ? -1 : 1;
      const xOffset = sideSign * (80 + (player.jerseyNumber - 1) * 70);
      player.x = FIELD_WIDTH / 2 + xOffset;
      player.y = FIELD_HEIGHT / 2 + (player.jerseyNumber % 2 === 0 ? 50 : -50);
      player.angle = isHome ? 0 : Math.PI;
      player.targetAngle = player.angle;
      player.speed = 0;
      player.vx = 0;
      player.vy = 0;
    });
  };

  // Setup Keyboard Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent scrolling on Space / Arrow keys during game
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
      }

      // Player 1 Keys: WASD, Space, Shift, E, J, K
      keysRef.current.add(e.code);

      // Player 2 Keys: IJKL, Enter, Numpad
      if (['KeyI', 'KeyK', 'KeyJ', 'KeyL', 'Enter', 'NumpadEnter', 'Numpad0', 'Numpad4', 'Numpad5', 'Numpad6', 'Numpad8'].includes(e.code)) {
        p2KeysRef.current.add(e.code);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current.delete(e.code);
      p2KeysRef.current.delete(e.code);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Initialize rosters on mount or restart
  useEffect(() => {
    initRosters();
    poloAudio.playWhistle(true);
  }, [homeTeam, awayTeam, userHorse, gameMode]);

  // Main 60 FPS Game Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isRunning = true;

    const gameLoop = (currentTime: number) => {
      if (!isRunning) return;

      const delta = Math.min(0.05, (currentTime - lastTimeRef.current) / 1000);
      lastTimeRef.current = currentTime;

      // Handle ResizeObserver / Canvas dimensions
      const rect = canvas.getBoundingClientRect();
      if (canvas.width !== rect.width || canvas.height !== rect.height) {
        canvas.width = rect.width;
        canvas.height = rect.height;
      }

      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;

      // Update Physics if not paused and not celebrating goal
      if (!isPaused && !matchState.isGameOver) {
        // Chukker clock tick
        if (matchState.goalCelebrationTime > 0) {
          setMatchState((prev) => ({
            ...prev,
            goalCelebrationTime: Math.max(0, prev.goalCelebrationTime - delta)
          }));
        } else {
          // Normal chukker time decrement
          setMatchState((prev) => {
            const newTime = prev.chukkerTimeRemaining - delta;
            if (newTime <= 0) {
              poloAudio.playChukkerBell();
              poloAudio.playWhistle(true);

              // Check if halftime (after 2nd chukker in a 4-chukker match)
              if (prev.currentChukker === Math.floor(prev.totalChukkers / 2) && !prev.isHalftime) {
                onHalftimeDivotStomp();
                return {
                  ...prev,
                  isHalftime: true,
                  chukkerTimeRemaining: chukkerDurationSec
                };
              }

              // Check if game over
              if (prev.currentChukker >= prev.totalChukkers) {
                const userP = playersRef.current.find((p) => p.isUser);
                onMatchEnd(prev.homeScore, prev.awayScore, userP ? userP.stats : playersRef.current[0].stats);
                return {
                  ...prev,
                  isGameOver: true,
                  chukkerTimeRemaining: 0
                };
              }

              // Advance to next chukker
              return {
                ...prev,
                currentChukker: prev.currentChukker + 1,
                chukkerTimeRemaining: chukkerDurationSec
              };
            }
            return {
              ...prev,
              chukkerTimeRemaining: newTime
            };
          });

          // Run physics step
          const fieldFriction = fieldType === 'turf' ? 0.985 : fieldType === 'snow' ? 0.99 : 0.978;
          const result = updateGamePhysics(
            playersRef.current,
            ballRef.current,
            lobRef.current,
            matchState,
            keysRef.current,
            p2KeysRef.current,
            touchInput,
            gameMode === 'twoplayer',
            delta,
            fieldFriction
          );

          // Spawn turf divots during hard gallops or turns
          playersRef.current.forEach((p) => {
            if (p.speed > 130 && Math.random() < 0.04) {
              divotsRef.current.push({
                x: p.x,
                y: p.y,
                repaired: false,
                rotation: p.angle + Math.PI / 2,
                size: 5 + Math.random() * 5
              });
              rendererRef.current.addDivotParticle(p.x, p.y, fieldType);
              if (divotsRef.current.length > 50) divotsRef.current.shift();
            }
          });

          if (result.hitOccurred) {
            rendererRef.current.addHitSparkles(ballRef.current.x, ballRef.current.y);
          }

          // Goal Scored!
          if (result.goalScored) {
            const scoringTeam = result.goalScored;
            const scorer = playersRef.current.find((p) => p.id === ballRef.current.lastHitterId);
            if (scorer) scorer.stats.goals++;

            // Confetti celebration
            confetti({
              particleCount: 75,
              spread: 80,
              origin: { y: 0.6 }
            });

            setMatchState((prev) => ({
              ...prev,
              homeScore: scoringTeam === 'home' ? prev.homeScore + 1 : prev.homeScore,
              awayScore: scoringTeam === 'away' ? prev.awayScore + 1 : prev.awayScore,
              lastGoalScorer: scorer ? scorer.name : `${scoringTeam === 'home' ? homeTeam.name : awayTeam.name}`
            }));

            resetAfterGoal(scoringTeam);
          }

          // Foul Called
          if (result.foulMessage) {
            setMatchState((prev) => ({
              ...prev,
              foulNotice: result.foulMessage,
              foulTime: 3.0
            }));
          }
        }
      }

      // Smooth Camera follow: Center on User or midpoint of User & Ball
      const user = playersRef.current.find((p) => p.isUser);
      if (user) {
        const targetCamX = user.x * 0.7 + ballRef.current.x * 0.3;
        const targetCamY = user.y * 0.7 + ballRef.current.y * 0.3;
        cameraRef.current.x += (targetCamX - cameraRef.current.x) * (delta * 4.5);
        cameraRef.current.y += (targetCamY - cameraRef.current.y) * (delta * 4.5);
      }

      // Update Particles
      rendererRef.current.updateParticles(delta);

      // Render Scene
      rendererRef.current.render(
        ctx,
        canvasWidth,
        canvasHeight,
        cameraRef.current,
        playersRef.current,
        ballRef.current,
        lobRef.current,
        divotsRef.current,
        matchState,
        homeTeam,
        awayTeam,
        fieldType
      );

      animFrameIdRef.current = requestAnimationFrame(gameLoop);
    };

    animFrameIdRef.current = requestAnimationFrame(gameLoop);

    return () => {
      isRunning = false;
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    };
  }, [isPaused, matchState.isGameOver, fieldType, homeTeam, awayTeam, gameMode]);

  return (
    <div className="relative w-full h-full select-none overflow-hidden bg-stone-950">
      <canvas
        ref={canvasRef}
        id="polo-match-canvas"
        className="w-full h-full block cursor-crosshair touch-none"
      />
    </div>
  );
};
