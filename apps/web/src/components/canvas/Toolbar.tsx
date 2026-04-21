interface ToolbarProps {
  color: string;
  setColor: (color: string) => void;
  brushSize: number;
  setBrushSize: (size: number) => void;
  tool: 'brush' | 'eraser';
  setTool: (tool: 'brush' | 'eraser') => void;
  onUndo: () => void;
  onClear: () => void;
}

const COLORS = [
  '#000000', '#808080', '#C0C0C0', '#FFFFFF',
  '#FF0000', '#FF6600', '#FFFF00', '#00FF00',
  '#00FFFF', '#0000FF', '#9900FF', '#FF00FF',
  '#8B4513', '#FF69B4', '#006400', '#000080',
  '#FF4500', '#FFD700', '#7CFC00', '#40E0D0',
];

const BRUSH_SIZES = [
  { label: 'S', size: 3 },
  { label: 'M', size: 8 },
  { label: 'L', size: 16 },
  { label: 'XL', size: 28 },
];

export default function Toolbar({
  color,
  setColor,
  brushSize,
  setBrushSize,
  tool,
  setTool,
  onUndo,
  onClear,
}: ToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 bg-primary-700 p-3 rounded-xl border border-primary-500/30 w-full max-w-[800px]">
      {/* Color palette */}
      <div className="flex flex-wrap gap-1">
        {COLORS.map((c) => (
          <button
            key={c}
            onClick={() => {
              setColor(c);
              setTool('brush');
            }}
            className={`w-7 h-7 rounded-md border-2 transition-transform hover:scale-110 ${
              color === c && tool === 'brush'
                ? 'border-white scale-110'
                : 'border-transparent'
            }`}
            style={{ backgroundColor: c }}
            title={c}
          />
        ))}
      </div>

      {/* Divider */}
      <div className="w-px h-8 bg-white/20" />

      {/* Brush sizes */}
      <div className="flex gap-1.5">
        {BRUSH_SIZES.map((bs) => (
          <button
            key={bs.size}
            onClick={() => setBrushSize(bs.size)}
            className={`w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${
              brushSize === bs.size
                ? 'bg-accent-blue text-white'
                : 'bg-primary-600 text-white/60 hover:bg-primary-500'
            }`}
          >
            {bs.label}
          </button>
        ))}
      </div>

      {/* Divider */}
      <div className="w-px h-8 bg-white/20" />

      {/* Tools */}
      <div className="flex gap-1.5">
        <button
          onClick={() => setTool('brush')}
          className={`px-3 py-2 rounded-lg text-sm font-bold transition-all ${
            tool === 'brush'
              ? 'bg-accent-blue text-white'
              : 'bg-primary-600 text-white/60 hover:bg-primary-500'
          }`}
        >
          ✏️ Brush
        </button>
        <button
          onClick={() => setTool('eraser')}
          className={`px-3 py-2 rounded-lg text-sm font-bold transition-all ${
            tool === 'eraser'
              ? 'bg-accent-blue text-white'
              : 'bg-primary-600 text-white/60 hover:bg-primary-500'
          }`}
        >
          🧹 Eraser
        </button>
      </div>

      {/* Divider */}
      <div className="w-px h-8 bg-white/20" />

      {/* Undo & Clear */}
      <div className="flex gap-1.5">
        <button
          onClick={onUndo}
          className="px-3 py-2 rounded-lg text-sm font-bold bg-primary-600 text-white/60 hover:bg-primary-500 hover:text-white transition-all"
        >
          ↩ Undo
        </button>
        <button
          onClick={onClear}
          className="px-3 py-2 rounded-lg text-sm font-bold bg-accent-red/20 text-accent-red hover:bg-accent-red hover:text-white transition-all"
        >
          🗑 Clear
        </button>
      </div>
    </div>
  );
}