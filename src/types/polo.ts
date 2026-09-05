export type PositionId = 1 | 2 | 3 | 4;

export type ShotType =
  | 'offside_forehand'
  | 'nearside_forehand'
  | 'offside_backhand'
  | 'nearside_backhand'
  | 'neck_shot'
  | 'tail_shot';

export type FieldType = 'turf' | 'arena' | 'snow';

export type GameMode =
  | 'exhibition'
  | 'tournament'
  | 'penalties'
  | 'practice'
  | 'twoplayer'
  | 'online_lobby';

export interface HorseProfile {
  id: string;
  name: string;
  breed: string;
  color: string;
  maneColor: string;
  tailColor: string;
  speed: number;       // 1 - 10
  acceleration: number;// 1 - 10
  agility: number;     // 1 - 10
  stamina: number;     // 1 - 10
  bumpWeight: number;  // 1 - 10
  description: string;
}

export interface PlayerStats {
  goals: number;
  shots: number;
  shotsOnTarget: number;
  fouls: number;
  rideOffsWon: number;
  hooks: number;
  distanceCovered: number;
}

export interface PoloPlayer {
  id: string;
  name: string;
  jerseyNumber: PositionId;
  team: 'home' | 'away';
  handicap: number; // e.g. 0 to 10
  isUser: boolean;
  isPlayer2?: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;       // In radians
  targetAngle: number;
  speed: number;
  maxSpeed: number;
  stamina: number;     // 0 - 100
  isSprinting: boolean;
  swingCharge: number; // 0 - 1
  isSwinging: boolean;
  swingProgress: number;
  swingType: ShotType;
  horse: HorseProfile;
  stats: PlayerStats;
  hookCooldown: number;
  animFrame: number;
  lastHitTime: number;
}

export interface PoloBall {
  x: number;
  y: number;
  z: number;           // Height off ground for lofted shots
  vx: number;
  vy: number;
  vz: number;
  radius: number;
  lastHitterId: string | null;
  lastHitTeam: 'home' | 'away' | null;
  trail: { x: number; y: number; time: number }[];
}

export interface LineOfTheBall {
  startX: number;
  startY: number;
  dirX: number;
  dirY: number;
  createdAt: number;
  active: boolean;
  hitterTeam: 'home' | 'away';
}

export interface TeamConfig {
  id: string;
  name: string;
  shortName: string;
  clubCity: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  helmetColor: string;
  handicap: number;
  motto: string;
}

export interface MatchState {
  currentChukker: number;
  totalChukkers: number;
  chukkerTimeRemaining: number; // in seconds
  homeScore: number;
  awayScore: number;
  isPaused: boolean;
  isGameOver: boolean;
  isHalftime: boolean;
  foulNotice: string | null;
  foulTime: number;
  lastGoalScorer: string | null;
  lastGoalTeam: 'home' | 'away' | null;
  goalCelebrationTime: number;
  fieldSideSwapped: boolean; // Authentic polo: teams swap ends after every goal!
  divotsRepaired: number;
  weather: 'sunny' | 'overcast' | 'crisp';
}

export interface TurfDivot {
  x: number;
  y: number;
  repaired: boolean;
  rotation: number;
  size: number;
}

export interface TournamentMatch {
  id: string;
  round: 'quarter' | 'semi' | 'final';
  roundName: string;
  homeTeam: TeamConfig;
  awayTeam: TeamConfig;
  homeScore?: number;
  awayScore?: number;
  completed: boolean;
  winner?: 'home' | 'away';
}
