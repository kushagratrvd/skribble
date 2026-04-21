import React from 'react';
import { classNames } from '../../lib/utils';

interface ModalProps {
  isOpen: boolean;
  onClose?: () => void;
  title?: string;
  children: React.ReactNode;
  closeable?: boolean;
  className?: string;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  closeable = true,
  className,
}: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 animate-fade-in" 
        style={{ backgroundColor: 'rgba(0,0,0,0.55)' }}
        onClick={closeable ? onClose : undefined}
      />
      
      {/* Modal content */}
      <div className={classNames(
        "relative w-full max-w-lg overflow-hidden",
        className
      )}
      style={{
        backgroundColor: 'rgba(12, 44, 150, 0.75)',
        backdropFilter: 'blur(4px)',
        borderRadius: '10px',
        boxShadow: '0 0 50px 0 rgba(0,0,0,0.15)',
        color: '#f0f0f0',
      }}
      >
        {/* Header */}
        {(title || (closeable && onClose)) && (
          <div className="relative text-center p-3 pt-3">
            {title && (
              <h2 className="text-2xl font-extrabold text-white">
                {title}
              </h2>
            )}
            {closeable && onClose && (
              <button
                onClick={onClose}
                className="absolute top-2 right-3 text-[#aaa] hover:text-white text-3xl leading-none cursor-pointer"
                aria-label="Close modal"
              >
                ×
              </button>
            )}
          </div>
        )}
        
        {/* Body */}
        <div className="p-4 pt-2" style={{ whiteSpace: 'pre-line' }}>
          {children}
        </div>
      </div>
    </div>
  );
}