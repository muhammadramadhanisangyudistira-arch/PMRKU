'use client';

import React, { useState } from 'react';
import { fixDriveImageUrl, getDriveThumbnailUrl } from '@/lib/drive-utils';
import { User as UserIcon } from 'lucide-react';

interface DriveImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string;
  alt: string;
  fallbackType?: 'avatar' | 'photo' | 'logo';
}

export const DriveImage: React.FC<DriveImageProps> = ({
  src,
  alt,
  className = '',
  fallbackType = 'avatar',
  ...props
}) => {
  const [useThumbnailFallback, setUseThumbnailFallback] = useState(false);
  const [loadError, setLoadError] = useState(false);

  if (!src || loadError) {
    if (fallbackType === 'avatar') {
      return (
        <div
          className={`flex items-center justify-center bg-rose-50 text-rose-500 border border-rose-200 ${className}`}
          title={alt}
        >
          <UserIcon className="w-1/2 h-1/2 stroke-[1.75]" />
        </div>
      );
    }
    return (
      <div
        className={`flex items-center justify-center bg-slate-100 text-slate-400 border border-slate-200 text-xs font-medium text-center p-2 ${className}`}
      >
        <span>{alt || 'Gambar'}</span>
      </div>
    );
  }

  const primaryUrl = fixDriveImageUrl(src);
  const fallbackUrl = getDriveThumbnailUrl(src);

  const currentSrc = useThumbnailFallback ? fallbackUrl : primaryUrl;

  return (
    <img
      src={currentSrc}
      alt={alt}
      className={className}
      referrerPolicy="no-referrer"
      onError={() => {
        if (!useThumbnailFallback && fallbackUrl !== primaryUrl) {
          setUseThumbnailFallback(true);
        } else {
          setLoadError(true);
        }
      }}
      {...props}
    />
  );
};
