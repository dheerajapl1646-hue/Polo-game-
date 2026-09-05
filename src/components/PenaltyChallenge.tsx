import React, { useState } from 'react';
import { Target, Trophy, RotateCcw, ArrowRight, Award, CheckCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { poloAudio } from '../utils/audio';

interface PenaltyChallengeProps {
  onBackToMatch: () => void;
}

interface TargetRing {
  id: string;
  name: string;
  distance: string;
  pts: number;
  xRatio: number; // 0.1 to 0.9 across goal width
  yRatio: number; // 0.1 (top) to 0.9 (bottom)
}

export const PenaltyChallenge: React.FC<PenaltyChallengeProps> = ({ onBackToMatch }) => {
  const [attempt, setAttempt] = useState(1);
  const [totalScore, setTotalScore] = useState(0);
  const [results, setResults] = useState<{ attempt: number; hit: boolean; pts: number; shotName: string }[]>([]);
  const [isAiming, setIsAiming] = useState(false);
  const [power, setPower] = useState(0.5);
  const [aimAngle, setAimAngle] = useState(0); // in degrees: -30 to 30
  const [feedback, setFeedback] = useState<string | null>(null);

  const maxAttempts = 5;

  // Penalty shot types for the 5 attempts
  const penaltyStages = [
    { num: 1, name: 'Penalty 2 (30 Yards)', dist: '30 Yards', targetPts: 100, wind: 2 },
    { num: 2, name: 'Penalty 3 (40 Yards)', dist: '40 Yards', targetPts: 150, wind: -4 },
    { num: 3, name: 'Penalty 4 (60 Yards Center)', dist: '60 Yards', targetPts: 200, wind: 6 },
    { num: 4, name: 'Safety 60-Yard Drive', dist: '60 Yards', targetPts: 250, wind: -8 },
    { num: 5, name: 'Championship Decider (60Y Loft)', dist: '60 Yards', targetPts: 300, wind: 10 }
  ];

  const currentStage = penaltyStages[attempt - 1] || penaltyStages[0];

  const handleShoot = () => {
    if (attempt > maxAttempts) return;

    poloAudio.playMalletHit(power);

    // Calculate accuracy: angle + wind factor + power sweet spot
    const idealPower = 0.65 + (attempt * 0.05);
    const powerError = Math.abs(power - idealPower);
    const angleError = Math.abs(aimAngle + currentStage.wind * 1.5);

    const isSuccess = powerError < 0.25 && angleError < 14;

    if (isSuccess) {
      poloAudio.playCrowdCheer();
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
      const pts = Math.round(currentStage.targetPts * (1 - powerError * 0.8));
      setTotalScore((prev) => prev + pts);
      setFeedback(`GOAL! Superb Strike! +${pts} pts`);
      setResults((prev) => [...prev, { attempt, hit: true, pts, shotName: currentStage.name }]);
    } else {
      poloAudio.playWhistle();
      setFeedback('MISSED! Wide of the uprights.');
      setResults((prev) => [...prev, { attempt, hit: false, pts: 0, shotName: currentStage.name }]);
    }

    // Move to next attempt after delay
    setTimeout(() => {
      setAttempt((prev) => prev + 1);
      setFeedback(null);
      setPower(0.5);
      setAimAngle(0);
    }, 1600);
  };

  const handleReset = () => {
    setAttempt(1);
    setTotalScore(0);
    setResults([]);
    setFeedback(null);
  };

  const isComplete = attempt > maxAttempts;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-950/90 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-3xl bg-stone-900 border-2 border-amber-600/70 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col my-auto text-stone-100">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs uppercase font-bold tracking-widest text-amber-500 font-display">
                Precision Polo Challenge
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-wide font-display text-stone-100">
                Penalty Shootout & Precision Target
              </h2>
            </div>
          </div>
          <button
            onClick={onBackToMatch}
            className="text-xs text-stone-400 hover:text-stone-200 uppercase font-semibold"
          >
            Back to Match
          </button>
        </div>

        {/* Content Body */}
        {!isComplete ? (
          <div className="mt-5 space-y-5">
            {/* Round info banner */}
            <div className="flex items-center justify-between bg-stone-950 p-4 rounded-2xl border border-stone-800 text-xs">
              <div>
                <span className="text-stone-400">Shot:</span>{' '}
                <span className="font-bold text-amber-400">{attempt} of {maxAttempts}</span>
                <span className="mx-2 text-stone-600">|</span>
                <span className="font-semibold text-stone-200">{currentStage.name}</span>
              </div>
              <div>
                <span className="text-stone-400">Total Score:</span>{' '}
                <span className="font-mono font-black text-amber-400 text-base">{totalScore}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-stone-400">Crosswind:</span>{' '}
                <span className={`font-bold ${currentStage.wind > 0 ? 'text-sky-400' : 'text-amber-400'}`}>
                  {currentStage.wind > 0 ? `→ ${currentStage.wind} mph R` : `← ${Math.abs(currentStage.wind)} mph L`}
                </span>
              </div>
            </div>

            {/* Goal Simulator Pitch Graphic */}
            <div
              className="relative w-full h-56 sm:h-64 rounded-2xl border-2 border-emerald-700 overflow-hidden flex flex-col justify-between p-4 shadow-inner"
              style={{
                background: 'radial-gradient(ellipse at bottom, #166534 0%, #052e16 100%)'
              }}
            >
              {/* Goal Posts & Crossbar Visual */}
              <div className="w-full flex justify-center items-start pt-3">
                <div className="relative w-64 sm:w-80 h-28 border-x-4 border-t-2 border-amber-200 flex justify-between shadow-2xl">
                  {/* Goal Flags */}
                  <div className="absolute -top-3 -left-3 w-3 h-3 bg-red-500 rounded-sm" />
                  <div className="absolute -top-3 -right-3 w-3 h-3 bg-blue-500 rounded-sm" />

                  {/* Net grid */}
                  <div
                    className="w-full h-full opacity-20"
                    style={{
                      backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)',
                      backgroundSize: '12px 12px'
                    }}
                  />

                  {/* Target bullseye in center */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-16 h-16 rounded-full border-2 border-amber-400/60 flex items-center justify-center animate-ping opacity-30" />
                    <div className="w-8 h-8 rounded-full bg-amber-500/30 border border-amber-400 flex items-center justify-center text-[10px] font-bold text-amber-300">
                      GOAL
                    </div>
                  </div>
                </div>
              </div>

              {/* Feedback toast */}
              {feedback && (
                <div className="self-center px-4 py-2 rounded-xl bg-stone-900/90 border border-amber-500 text-amber-300 font-bold text-sm backdrop-blur shadow-2xl animate-bounce">
                  {feedback}
                </div>
              )}

              {/* Ball Position at bottom */}
              <div className="self-center flex flex-col items-center">
                {/* Aim direction line */}
                <div
                  className="w-1 h-14 bg-gradient-to-t from-amber-400 to-transparent origin-bottom mb-1 transition-transform"
                  style={{ transform: `rotate(${aimAngle}deg)` }}
                />
                <div className="w-6 h-6 rounded-full bg-white shadow-lg border border-stone-400 flex items-center justify-center text-[8px] text-stone-800 font-bold">
                  ●
                </div>
                <div className="text-[10px] text-stone-300 font-semibold mt-1">{currentStage.dist} Spot</div>
              </div>
            </div>

            {/* Controls: Aim Angle & Swing Power Slider */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-stone-950 p-4 rounded-2xl border border-stone-800">
              <div>
                <label className="text-xs font-bold text-stone-300 flex justify-between mb-1.5">
                  <span>Aim Angle (Mallet Direction)</span>
                  <span className="font-mono text-amber-400">{aimAngle}°</span>
                </label>
                <input
                  type="range"
                  min="-25"
                  max="25"
                  value={aimAngle}
                  onChange={(e) => setAimAngle(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-300 flex justify-between mb-1.5">
                  <span>Swing Power & Loft</span>
                  <span className="font-mono text-amber-400">{Math.round(power * 100)}%</span>
                </label>
                <input
                  type="range"
                  min="0.2"
                  max="1.0"
                  step="0.02"
                  value={power}
                  onChange={(e) => setPower(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>
            </div>

            {/* Strike Mallet Action Button */}
            <div className="flex justify-end">
              <button
                onClick={handleShoot}
                className="w-full sm:w-auto px-8 py-3 rounded-2xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-display font-black text-sm uppercase tracking-wider shadow-xl transition-all"
              >
                Strike Mallet Forehand
              </button>
            </div>
          </div>
        ) : (
          /* Final Results Scorecard */
          <div className="mt-6 text-center space-y-6">
            <div className="p-6 rounded-3xl bg-stone-950 border border-amber-600/50 shadow-2xl">
              <Trophy className="w-12 h-12 text-amber-400 mx-auto mb-2" />
              <div className="text-xs uppercase tracking-widest text-amber-400 font-bold font-display">
                Shootout Complete
              </div>
              <div className="text-4xl sm:text-5xl font-mono font-black text-stone-100 mt-1">
                {totalScore} <span className="text-lg font-sans text-stone-400">PTS</span>
              </div>
              <p className="text-xs text-stone-400 mt-2">
                {totalScore >= 700
                  ? 'Master 10-Goal Striker! Unstoppable precision from any yard marker.'
                  : totalScore >= 400
                  ? 'High-Goal Prodigy! Excellent loft and wind compensation.'
                  : 'Solid Practice! Keep tuning your mallet aim against crosswinds.'}
              </p>
            </div>

            <div className="space-y-2 text-left">
              {results.map((r) => (
                <div
                  key={r.attempt}
                  className="p-3 rounded-xl bg-stone-950 border border-stone-800 flex items-center justify-between text-xs"
                >
                  <span className="font-semibold text-stone-200">Attempt {r.attempt}: {r.shotName}</span>
                  <div className="flex items-center gap-2">
                    <span className={`font-bold ${r.hit ? 'text-emerald-400' : 'text-stone-500'}`}>
                      {r.hit ? `+${r.pts} pts` : 'Missed'}
                    </span>
                    {r.hit ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <span className="text-stone-600">✕</span>}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-center gap-3">
              <button
                onClick={handleReset}
                className="px-6 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Shoot Again</span>
              </button>
              <button
                onClick={onBackToMatch}
                className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-display font-black text-xs uppercase tracking-wider shadow-lg flex items-center gap-1.5"
              >
                <span>Return to Polo Match</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
