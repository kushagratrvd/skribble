/**
 * CSS-based avatar rendering — matches original skribbl.io approach.
 * Uses background-image + background-position on div elements
 * instead of canvas, which has cross-browser GIF rendering issues (Edge).
 *
 * Each layer (color, eyes, mouth) is a div positioned over the same area,
 * with the sprite atlas as background and pixel-based offsets to show
 * the correct frame from the 10×10 grid.
 */
import { AvatarState } from '@skribbl/shared';
import { ATLAS_CONFIG } from '../../hooks/useAvatar';

interface AvatarProps {
  avatar: AvatarState;
  size?: number;
  className?: string;
}

const LAYERS: (keyof AvatarState)[] = ['color', 'eyes', 'mouth'];

export function Avatar({ avatar, size = 120, className = '' }: AvatarProps) {
  return (
    <div
      className={`crisp ${className}`}
      style={{
        position: 'relative',
        width: size,
        height: size,
      }}
    >
      {LAYERS.map((key) => {
        const cfg = ATLAS_CONFIG[key];
        const idx = avatar[key];
        const col = idx % cfg.cols;
        const row = Math.floor(idx / cfg.cols);

        return (
          <div
            key={key}
            className={`avatar-layer avatar-${key}`}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundImage: `url(${cfg.url})`,
              backgroundSize: `${cfg.cols * size}px ${cfg.rows * size}px`,
              backgroundPosition: `${-col * size}px ${-row * size}px`,
              backgroundRepeat: 'no-repeat',
              imageRendering: 'pixelated',
            }}
          />
        );
      })}
    </div>
  );
}