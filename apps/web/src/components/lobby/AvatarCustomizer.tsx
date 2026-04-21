import { AvatarState } from '@skribbl/shared';
import { Avatar } from './Avatar';
import { ATLAS_CONFIG } from '../../hooks/useAvatar';
import arrowSprite from '../../assets/arrow.gif';
import randomizeIcon from '../../assets/randomize.gif';

interface AvatarCustomizerProps {
  avatar: AvatarState;
  onChange: (avatar: AvatarState) => void;
}

const PARTS: (keyof AvatarState)[] = ['color', 'eyes', 'mouth'];

export default function AvatarCustomizer({ avatar, onChange }: AvatarCustomizerProps) {
  const updatePart = (part: keyof AvatarState, dir: 1 | -1) => {
    const max = ATLAS_CONFIG[part].max;
    let nextValue = avatar[part] + dir;
    if (nextValue < 0) nextValue = max - 1;
    if (nextValue >= max) nextValue = 0;
    onChange({ ...avatar, [part]: nextValue });
  };

  const randomize = () => {
    onChange({
      color: Math.floor(Math.random() * ATLAS_CONFIG.color.max),
      eyes: Math.floor(Math.random() * ATLAS_CONFIG.eyes.max),
      mouth: Math.floor(Math.random() * ATLAS_CONFIG.mouth.max),
    });
  };

  return (
    <div
      className="relative flex items-center justify-center gap-2 rounded-sm p-2 my-2"
      style={{ background: 'rgba(0,0,0,0.1)' }}
    >
      {/* Randomize Button — top right */}
      <button
        onClick={randomize}
        className="absolute right-1 top-1 w-8 h-8 opacity-60 hover:opacity-100 hover:scale-[1.2] transition-all cursor-pointer"
        title="Randomize your Avatar!"
        style={{
          backgroundImage: `url(${randomizeIcon})`,
          backgroundSize: 'cover',
          border: 'none',
          backgroundColor: 'transparent',
        }}
      />

      {/* Left Arrows Column */}
      <div className="flex flex-col justify-around gap-1">
        {PARTS.map((part) => (
          <button
            key={`left-${part}`}
            onClick={() => updatePart(part, -1)}
            className="w-[34px] h-[34px] cursor-pointer border-none bg-transparent"
            title={`Previous ${part}`}
            style={{
              backgroundImage: `url(${arrowSprite})`,
              backgroundSize: '200%',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: '0 0',
              filter: 'drop-shadow(0 0 3px rgba(0,0,0,0.15))',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundPosition = '100% 0';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundPosition = '0 0';
            }}
          />
        ))}
      </div>

      {/* Avatar Canvas */}
      <div className="w-24 h-24 flex-shrink-0">
        <Avatar avatar={avatar} size={96} />
      </div>

      {/* Right Arrows Column */}
      <div className="flex flex-col justify-around gap-1">
        {PARTS.map((part) => (
          <button
            key={`right-${part}`}
            onClick={() => updatePart(part, 1)}
            className="w-[34px] h-[34px] cursor-pointer border-none bg-transparent"
            title={`Next ${part}`}
            style={{
              backgroundImage: `url(${arrowSprite})`,
              backgroundSize: '200%',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: '0 100%',
              filter: 'drop-shadow(0 0 3px rgba(0,0,0,0.15))',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundPosition = '100% 100%';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundPosition = '0 100%';
            }}
          />
        ))}
      </div>
    </div>
  );
}
