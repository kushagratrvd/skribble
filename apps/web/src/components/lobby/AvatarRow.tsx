import { useMemo, useState, useCallback } from 'react';
import { AvatarState } from '@skribbl/shared';
import { Avatar } from './Avatar';
import { ATLAS_CONFIG } from '../../hooks/useAvatar';

interface AvatarRowProps {
  count?: number;
  size?: number;
}

export default function AvatarRow({ count = 8, size = 48 }: AvatarRowProps) {
  // Original skribbl.io: color is sequential (i), eyes/mouth are random
  const [avatars, setAvatars] = useState<AvatarState[]>(() =>
    Array.from({ length: count }, (_, i) => ({
      color: i % ATLAS_CONFIG.color.max,
      eyes: Math.floor(Math.random() * ATLAS_CONFIG.eyes.max),
      mouth: Math.floor(Math.random() * ATLAS_CONFIG.mouth.max),
    }))
  );

  // Click to re-randomize eyes + mouth (like original)
  const handleClick = useCallback((index: number) => {
    setAvatars((prev) =>
      prev.map((a, i) =>
        i === index
          ? {
              ...a,
              eyes: Math.floor(Math.random() * ATLAS_CONFIG.eyes.max),
              mouth: Math.floor(Math.random() * ATLAS_CONFIG.mouth.max),
            }
          : a
      )
    );
  }, []);

  return (
    <div
      className="flex items-center justify-center"
      style={{
        marginTop: '10px',
        height: `${size}px`,
        filter: 'drop-shadow(3px 3px 0 rgba(0,0,0,0.25))',
      }}
    >
      {avatars.map((avatar, i) => (
        <div
          key={i}
          onClick={() => handleClick(i)}
          className="cursor-pointer crisp"
          style={{
            width: size,
            height: size,
            transition: 'transform 0.1s ease-in-out',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          <Avatar avatar={avatar} size={size} />
        </div>
      ))}
    </div>
  );
}
