import React from 'react';

export interface SmartPictureProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  pictureClassName?: string;
  loading?: 'eager' | 'lazy';
}

function deriveWebpSrc(src: string): string | null {
  if (
    /\.png$/i.test(src) &&
    (src.startsWith('/media/') || src.startsWith('/brand/plate-'))
  ) {
    return src.replace(/\.png$/i, '.webp');
  }
  return null;
}

export function SmartPicture({
  src,
  alt,
  width,
  height,
  className,
  pictureClassName,
  loading = 'eager',
}: SmartPictureProps): React.ReactElement {
  const webpSrc = deriveWebpSrc(src);

  return (
    <picture className={pictureClassName}>
      {webpSrc && <source srcSet={webpSrc} type="image/webp" />}
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading={loading}
        decoding="async"
        className={className}
      />
    </picture>
  );
}
