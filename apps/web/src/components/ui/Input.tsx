import { classNames } from '../../lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export default function Input({ label, className, ...props }: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-white/80 text-sm mb-1.5 font-bold" style={{ textShadow: '1px 1px 0 rgba(0,0,0,0.2)' }}>
          {label}
        </label>
      )}
      <input
        className={classNames('input-field', className)}
        {...props}
      />
    </div>
  );
}