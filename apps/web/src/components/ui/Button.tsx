import { classNames } from '../../lib/utils';
import { playSound, initAudio } from '../../lib/sounds';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export default function Button({
  variant = 'primary',
  size = 'md',
  children,
  className,
  onClick,
  ...props
}: ButtonProps) {
  const baseStyles =
    'font-extrabold rounded-sm cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed';

  const textShadow = '2px 2px 0 rgba(0,0,0,0.17)';

  const variants = {
    primary:
      'bg-accent-green text-white hover:bg-[#38c41c] active:bg-[#30aa19]',
    secondary:
      'bg-accent-blue text-white hover:bg-[#1671c5] active:bg-[#1361a9]',
    danger:
      'bg-accent-red text-white hover:bg-[#b5430a] active:bg-[#9c3a08]',
    ghost:
      'bg-transparent hover:bg-white/10 text-white border border-white/20',
  };

  const sizes = {
    sm: 'py-1.5 px-4 text-sm',
    md: 'py-2.5 px-6 text-base',
    lg: 'py-3.5 px-8 text-lg',
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    initAudio();
    playSound('click');
    onClick?.(e);
  };

  return (
    <button
      className={classNames(baseStyles, variants[variant], sizes[size], className)}
      style={{ textShadow, transition: 'background-color 80ms' }}
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  );
}