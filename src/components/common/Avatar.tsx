import React, { useState } from 'react';

interface AvatarProps {
  src?: string;
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-lg',
};

// Deterministic pastel/neutral gradient based on name
const getGradientByName = (name: string) => {
  const gradients = [
    'from-blue-600 to-indigo-600',
    'from-indigo-600 to-violet-600',
    'from-purple-600 to-pink-600',
    'from-emerald-600 to-teal-600',
    'from-cyan-600 to-blue-600',
    'from-amber-600 to-orange-600',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % gradients.length;
  return gradients[index];
};

const getInitials = (name: string) => {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export const Avatar: React.FC<AvatarProps> = ({ src, name, size = 'sm', className = '' }) => {
  const [imgError, setImgError] = useState(false);
  const initials = getInitials(name);
  const gradient = getGradientByName(name);
  const sizeClass = sizeClasses[size];

  if (src && !imgError) {
    return (
      <img
        src={src}
        alt={name}
        onError={() => setImgError(true)}
        className={`${sizeClass} rounded-full object-cover shrink-0 border border-slate-200/80 shadow-2xs ${className}`}
        referrerPolicy="no-referrer"
      />
    );
  }

  return (
    <div
      className={`${sizeClass} rounded-full bg-gradient-to-tr ${gradient} text-white font-bold flex items-center justify-center shrink-0 shadow-2xs select-none ${className}`}
      aria-label={name}
      title={name}
    >
      <span>{initials}</span>
    </div>
  );
};
