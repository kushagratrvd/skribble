import { useGameStore } from '../../store/gameStore';
import clockGif from '../../assets/clock.gif';

export default function Timer() {
  const timeLeft = useGameStore((s) => s.timeLeft);
  const phase = useGameStore((s) => s.phase);

  if (phase !== 'drawing' && phase !== 'choosing') return null;

  return (
    <div className="relative flex items-center justify-center flex-shrink-0" style={{ width: '56px', height: '62px' }}>
      <img 
        src={clockGif} 
        alt="Clock" 
        className="w-full h-full crisp absolute inset-0 z-0" 
      />
      <span 
        className="relative z-10 font-bold" 
        style={{ 
          fontSize: '18px', 
          lineHeight: '1', 
          color: '#000',
          transform: 'translateY(-2px)' // Small optical adjustment for the gif
        }}
      >
        {timeLeft}
      </span>
    </div>
  );
}