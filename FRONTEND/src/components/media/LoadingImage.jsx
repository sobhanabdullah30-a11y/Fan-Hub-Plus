import React, { useEffect, useState } from 'react';
import { ImageOff } from 'lucide-react';

export function LoadingImage({ src, alt = '', className = '', ...props }) {
  const [state, setState] = useState('loading');
  useEffect(() => {
    setState('loading');
  }, [src]);

  return (
    <span className={`loading-image ${className}`} aria-busy={state === 'loading'}>
      {state === 'loading' && (
        <span className="image-spinner" role="status">
          <span className="sr-only">Loading image</span>
        </span>
      )}
      {state === 'error' ? (
        <span className="image-unavailable">
          <ImageOff size={20} />
          <span>Image unavailable</span>
        </span>
      ) : (
        <img
          {...props}
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          onLoad={() => setState('ready')}
          onError={() => setState('error')}
        />
      )}
    </span>
  );
}
