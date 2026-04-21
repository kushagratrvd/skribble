import { useEffect } from 'react';
import { useCanvas } from '../../hooks/useCanvas';
import Toolbar from './Toolbar';
import { useGameStore } from '../../store/gameStore';
import { emitCanvasClear, emitDrawUndo } from '../../socket/events';

interface DrawingCanvasProps {
  isDrawer: boolean;
}

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;

export default function DrawingCanvas({ isDrawer }: DrawingCanvasProps) {
  const phase = useGameStore((s) => s.phase);
  const drawerName = useGameStore((s) => s.drawerName);

  const {
    canvasRef,
    color,
    setColor,
    brushSize,
    setBrushSize,
    tool,
    setTool,
    clearCanvas,
    strokesRef,
    redrawAll,
  } = useCanvas({
    isDrawer,
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
  });

  // Clear canvas on new round
  useEffect(() => {
    if (phase === 'choosing') {
      clearCanvas();
      strokesRef.current = [];
    }
  }, [phase, clearCanvas, strokesRef]);

  const handleUndo = () => {
    if (strokesRef.current.length > 0) {
      strokesRef.current.pop();
      redrawAll(strokesRef.current);
      emitDrawUndo();
    }
  };

  const handleClear = () => {
    clearCanvas();
    emitCanvasClear();
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className={`relative rounded-xl overflow-hidden shadow-2xl border-4 ${
          isDrawer && phase === 'drawing'
            ? 'border-accent-green animate-pulse-glow'
            : 'border-primary-500/50'
        }`}
      >
        <canvas
          ref={canvasRef}
          className="bg-white w-full max-w-[800px]"
          style={{
            aspectRatio: `${CANVAS_WIDTH}/${CANVAS_HEIGHT}`,
            cursor:
              isDrawer && phase === 'drawing' ? 'crosshair' : 'default',
            touchAction: 'none',
          }}
        />
        {phase === 'choosing' && !isDrawer && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <div className="text-white text-xl font-bold animate-pulse">
              {drawerName} is choosing a word...
            </div>
          </div>
        )}
      </div>

      {isDrawer && phase === 'drawing' && (
        <Toolbar
          color={color}
          setColor={setColor}
          brushSize={brushSize}
          setBrushSize={setBrushSize}
          tool={tool}
          setTool={setTool}
          onUndo={handleUndo}
          onClear={handleClear}
        />
      )}
    </div>
  );
}