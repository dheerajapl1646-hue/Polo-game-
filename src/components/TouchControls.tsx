import React, { useRef, useState, useEffect } from 'react';
import { Zap, ShieldAlert } from 'lucide-react';

interface TouchControlsProps {
  onUpdateInput: (input: { moveX: number; moveY: number; swing: boolean; sprint: boolean; hook: boolean }) => void;
}

export const TouchControls: React.FC<TouchControlsProps> = ({ onUpdateInput }) => {
  const joystickBaseRef = useRef<HTMLDivElement | null>(null);
  const [joystickActive, setJoystickActive] = useState(false);
  const [knobPos, setKnobPos] = useState({ x: 0, y: 0 });
  const [isSwinging, setIsSwinging] = useState(false);
  const [isSprinting, setIsSprinting] = useState(false);
  const [isHooking, setIsHooking] = useState(false);

  const currentInputRef = useRef({ moveX: 0, moveY: 0, swing: false, sprint: false, hook: false });

  const updateInput = (partial: Partial<typeof currentInputRef.current>) => {
    currentInputRef.current = { ...currentInputRef.current, ...partial };
    onUpdateInput(currentInputRef.current);
  };

  const handleJoystickStart = (e: React.TouchEvent | React.MouseEvent) => {
    setJoystickActive(true);
    handleJoystickMove(e);
  };

  const handleJoystickMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!joystickBaseRef.current) return;
    const rect = joystickBaseRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const dx = clientX - centerX;
    const dy = clientY - centerY;
    const maxRadius = rect.width / 2;
    const dist = Math.hypot(dx, dy);

    const clampedDist = Math.min(maxRadius, dist);
    const angle = Math.atan2(dy, dx);

    const knobX = Math.cos(angle) * clampedDist;
    const knobY = Math.sin(angle) * clampedDist;

    setKnobPos({ x: knobX, y: knobY });

    const normalizedX = knobX / maxRadius;
    const normalizedY = knobY / maxRadius;
    updateInput({ moveX: normalizedX, moveY: normalizedY });
  };

  const handleJoystickEnd = () => {
    setJoystickActive(false);
    setKnobPos({ x: 0, y: 0 });
    updateInput({ moveX: 0, moveY: 0 });
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-20 flex justify-between items-end p-4 sm:p-6 select-none">
      {/* Left Virtual Joystick */}
      <div
        ref={joystickBaseRef}
        id="virtual-joystick"
        onTouchStart={handleJoystickStart}
        onTouchMove={handleJoystickMove}
        onTouchEnd={handleJoystickEnd}
        onTouchCancel={handleJoystickEnd}
        className="pointer-events-auto relative w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-[#0A1A12]/80 border-2 border-[#D4AF37]/40 backdrop-blur-md flex items-center justify-center shadow-2xl active:border-[#D4AF37]"
      >
        <div
          className="w-12 h-12 rounded-full bg-[#D4AF37] border border-[#F4F1EA]/80 shadow-lg flex items-center justify-center text-[10px] font-bold text-[#0A1A12] font-sans tracking-wider transition-transform duration-75"
          style={{
            transform: `translate(${knobPos.x}px, ${knobPos.y}px)`
          }}
        >
          RIDE
        </div>
      </div>

      {/* Right Action Buttons */}
      <div className="pointer-events-auto flex items-end gap-3">
        {/* Mallet Hook / Defense Button */}
        <button
          id="touch-hook-btn"
          onTouchStart={() => { setIsHooking(true); updateInput({ hook: true }); }}
          onTouchEnd={() => { setIsHooking(false); updateInput({ hook: false }); }}
          className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-[#0E2319]/90 border border-[#D4AF37]/40 text-[#D4AF37] backdrop-blur-md shadow-xl flex flex-col items-center justify-center active:scale-95 active:bg-[#D4AF37]/30 transition-transform font-sans"
          title="Hook Mallet (E)"
        >
          <ShieldAlert className="w-5 h-5" />
          <span className="text-[9px] font-bold tracking-wider">HOOK</span>
        </button>

        {/* Sprint Gallop Burst Button */}
        <button
          id="touch-sprint-btn"
          onTouchStart={() => { setIsSprinting(true); updateInput({ sprint: true }); }}
          onTouchEnd={() => { setIsSprinting(false); updateInput({ sprint: false }); }}
          className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full border backdrop-blur-md shadow-xl flex flex-col items-center justify-center active:scale-95 transition-all font-sans ${
            isSprinting
              ? 'bg-[#162A1F] border-[#D4AF37] text-[#D4AF37] scale-95'
              : 'bg-[#0E2319]/90 border-[#D4AF37]/40 text-[#D4AF37]'
          }`}
          title="Gallop Burst (Shift)"
        >
          <Zap className="w-6 h-6" />
          <span className="text-[9px] font-bold tracking-wider">SPRINT</span>
        </button>

        {/* Primary Mallet Swing Button */}
        <button
          id="touch-swing-btn"
          onTouchStart={() => { setIsSwinging(true); updateInput({ swing: true }); }}
          onTouchEnd={() => { setIsSwinging(false); updateInput({ swing: false }); }}
          className={`w-20 h-20 sm:w-22 sm:h-22 rounded-full border-2 shadow-2xl backdrop-blur-md flex flex-col items-center justify-center active:scale-90 transition-all ${
            isSwinging
              ? 'bg-[#F4F1EA] border-[#D4AF37] text-[#0A1A12] scale-95 shadow-[#D4AF37]/50'
              : 'bg-[#D4AF37] border-[#F4F1EA]/80 text-[#0A1A12] font-black'
          }`}
          title="Swing Mallet (Hold Space to charge, release to strike)"
        >
          <span className="text-sm sm:text-base font-bold uppercase font-serif tracking-wider">SWING</span>
          <span className="text-[8px] font-bold text-[#0A1A12]/80 uppercase font-sans tracking-widest">Hold / Tap</span>
        </button>
      </div>
    </div>
  );
};
