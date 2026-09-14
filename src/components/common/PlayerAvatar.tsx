import React, { useState } from 'react';

interface PlayerAvatarProps {
  avatar?: string | null;
  name?: string | null;
  className?: string;
  fallbackIcon?: string;
}

export const PlayerAvatar: React.FC<PlayerAvatarProps> = ({
  avatar,
  name,
  className = 'w-10 h-10 rounded-xl',
  fallbackIcon = '🎓'
}) => {
  const [hasImageError, setHasImageError] = useState(false);

  // Determinar si el avatar es una URL (foto de Google, URL externa o path local)
  const isUrl = Boolean(
    avatar &&
    !hasImageError &&
    (
      avatar.startsWith('http://') ||
      avatar.startsWith('https://') ||
      avatar.startsWith('/') ||
      avatar.startsWith('data:') ||
      avatar.includes('googleusercontent.com')
    )
  );

  if (isUrl && avatar) {
    return (
      <div className={`overflow-hidden shrink-0 flex items-center justify-center bg-zinc-900 ${className}`}>
        <img
          src={avatar}
          alt={name || 'Avatar'}
          className="w-full h-full object-cover rounded-[inherit]"
          referrerPolicy="no-referrer"
          onError={() => setHasImageError(true)}
        />
      </div>
    );
  }

  // Si no es URL o falló la imagen: mostrar emoji o primera letra del nombre
  const displayText = avatar && !avatar.startsWith('http') && avatar.length <= 4
    ? avatar
    : (name ? name.charAt(0).toUpperCase() : fallbackIcon);

  return (
    <div className={`shrink-0 flex items-center justify-center select-none overflow-hidden ${className}`}>
      <span className="leading-none">{displayText}</span>
    </div>
  );
};
