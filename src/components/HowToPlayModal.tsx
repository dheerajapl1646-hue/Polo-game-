import React from 'react';
import { X, ShieldAlert, Zap, Compass, Trophy, HelpCircle, Check, Sparkles } from 'lucide-react';

interface HowToPlayModalProps {
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#0A1A12]/90 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-4xl bg-[#0A1A12] border-2 border-[#D4AF37]/50 p-6 sm:p-8 shadow-2xl flex flex-col my-auto text-[#F4F1EA] max-h-[90vh] overflow-y-auto font-serif">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#D4AF37]/20">
          <div>
            <div className="text-[10px] uppercase font-bold tracking-[0.3em] text-[#D4AF37] font-sans">
              Hurlingham Polo Association Rules
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-[0.2em] uppercase text-[#F4F1EA] mt-0.5">
              The Rules of Polo & How to Play
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-[#0E2319] hover:bg-[#162A1F] border border-[#D4AF37]/30 text-[#D4AF37] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section 1: Core Polo Rules */}
        <div className="mt-6 space-y-5">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#D4AF37] font-sans flex items-center gap-1.5 mb-2">
              <Compass className="w-4 h-4 text-[#D4AF37]" />
              <span>1. Line of the Ball (Right of Way)</span>
            </h3>
            <p className="text-xs sm:text-sm text-[#F4F1EA]/80 leading-relaxed bg-[#0E2319] p-4 border border-[#D4AF37]/20 border-l-4 border-l-[#D4AF37]">
              When the ball is struck, an imaginary path called the <strong className="text-[#D4AF37]">Line of the Ball (LOB)</strong> is established.
              The player who struck the ball or is closest to the line on their offside (right side) possesses the Right of Way.
              Crossing into the path of an on-rushing galloper creates a dangerous collision hazard and results in an immediate <strong className="text-[#D4AF37]">whistle and penalty shot</strong>!
            </p>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#D4AF37] font-sans flex items-center gap-1.5 mb-2">
              <ShieldAlert className="w-4 h-4 text-[#D4AF37]" />
              <span>2. The Ride-Off (The Bump) & Mallet Hooking</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm text-[#F4F1EA]/80">
              <div className="bg-[#0E2319] p-4 border border-[#D4AF37]/20 border-l-4 border-l-[#D4AF37]">
                <div className="font-bold text-[#F4F1EA] mb-1 font-serif uppercase tracking-wider text-xs">The Ride-Off</div>
                You can push an opposing rider off the ball by galloping shoulder-to-shoulder at a safe angle (&le; 30°).
                Horses with higher Bump Weight easily push lighter steeds off line!
              </div>
              <div className="bg-[#0E2319] p-4 border border-[#D4AF37]/20 border-l-4 border-l-[#D4AF37]">
                <div className="font-bold text-[#F4F1EA] mb-1 font-serif uppercase tracking-wider text-xs">Mallet Hooking</div>
                When an opponent starts their swing, press <strong>E</strong> (or the Hook button) to reach out and hook their mallet, neutralizing their shot!
              </div>
            </div>
          </div>

          {/* Section 2: Polo Shots */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#D4AF37] font-sans flex items-center gap-1.5 mb-2">
              <Zap className="w-4 h-4 text-[#D4AF37]" />
              <span>3. Classic Polo Shots</span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              <div className="bg-[#0E2319] p-3 border border-[#D4AF37]/20">
                <span className="font-bold text-[#D4AF37] block mb-1 font-sans uppercase tracking-widest text-[10px]">Offside Forehand</span>
                <span className="text-[#F4F1EA]/70 text-[11px]">Ball on right; standard powerful forward drive towards goal.</span>
              </div>
              <div className="bg-[#0E2319] p-3 border border-[#D4AF37]/20">
                <span className="font-bold text-[#D4AF37] block mb-1 font-sans uppercase tracking-widest text-[10px]">Nearside Forehand</span>
                <span className="text-[#F4F1EA]/70 text-[11px]">Ball on left; rider leans across to drive ball along near side.</span>
              </div>
              <div className="bg-[#0E2319] p-3 border border-[#D4AF37]/20">
                <span className="font-bold text-[#D4AF37] block mb-1 font-sans uppercase tracking-widest text-[10px]">Offside Backhand</span>
                <span className="text-[#F4F1EA]/70 text-[11px]">Ball on right; defensive clear or pass struck backward.</span>
              </div>
              <div className="bg-[#0E2319] p-3 border border-[#D4AF37]/20">
                <span className="font-bold text-[#D4AF37] block mb-1 font-sans uppercase tracking-widest text-[10px]">Neck Shot</span>
                <span className="text-[#F4F1EA]/70 text-[11px]">Ball in front; sliced under the pony's neck diagonally.</span>
              </div>
            </div>
          </div>

          {/* Section 3: Controls Guide */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#D4AF37] font-sans flex items-center gap-1.5 mb-2">
              <HelpCircle className="w-4 h-4 text-[#D4AF37]" />
              <span>4. Controls Reference</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {/* Player 1 Controls */}
              <div className="bg-[#0E2319] p-4 border border-[#D4AF37]/20 space-y-2">
                <div className="font-bold text-[#D4AF37] font-sans uppercase tracking-[0.2em] text-[11px]">Player 1 (Keyboard)</div>
                <div className="flex justify-between py-1 border-b border-[#D4AF37]/10 text-xs">
                  <span className="text-[#F4F1EA]/60">Steer & Gallop:</span>
                  <span className="font-mono text-[#F4F1EA]">W, A, S, D / Arrows</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#D4AF37]/10 text-xs">
                  <span className="text-[#F4F1EA]/60">Swing Mallet:</span>
                  <span className="font-mono text-[#F4F1EA]">Hold Space (Charge) & Release</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#D4AF37]/10 text-xs">
                  <span className="text-[#F4F1EA]/60">Sprint Gallop Burst:</span>
                  <span className="font-mono text-[#F4F1EA]">Left Shift</span>
                </div>
                <div className="flex justify-between py-1 text-xs">
                  <span className="text-[#F4F1EA]/60">Hook Mallet / Tackle:</span>
                  <span className="font-mono text-[#F4F1EA]">E key</span>
                </div>
              </div>

              {/* Player 2 (Local 2-Player) */}
              <div className="bg-[#0E2319] p-4 border border-[#D4AF37]/20 space-y-2">
                <div className="font-bold text-[#D4AF37] font-sans uppercase tracking-[0.2em] text-[11px]">Player 2 (Local Versus)</div>
                <div className="flex justify-between py-1 border-b border-[#D4AF37]/10 text-xs">
                  <span className="text-[#F4F1EA]/60">Steer & Gallop:</span>
                  <span className="font-mono text-[#F4F1EA]">I, J, K, L / Numpad 8,4,5,6</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#D4AF37]/10 text-xs">
                  <span className="text-[#F4F1EA]/60">Swing Mallet:</span>
                  <span className="font-mono text-[#F4F1EA]">Enter / Numpad Enter</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#D4AF37]/10 text-xs">
                  <span className="text-[#F4F1EA]/60">Sprint Burst:</span>
                  <span className="font-mono text-[#F4F1EA]">Right Ctrl / Numpad 0</span>
                </div>
                <div className="flex justify-between py-1 text-xs">
                  <span className="text-[#F4F1EA]/60">Mobile / Tablet:</span>
                  <span className="font-mono text-[#F4F1EA]">Touch Joystick & Buttons</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dismiss button */}
        <div className="mt-6 pt-4 border-t border-[#D4AF37]/20 flex justify-end">
          <button
            onClick={onClose}
            className="px-8 py-3 bg-[#D4AF37] hover:bg-[#F4F1EA] text-[#0A1A12] font-sans font-bold text-xs tracking-[0.3em] uppercase shadow-2xl transition-all"
          >
            Enter Field of Play
          </button>
        </div>
      </div>
    </div>
  );
};
