import React, { useEffect, useMemo, useState } from 'react';
import { UniverseArtwork } from './UniverseArtwork.jsx';

// A single revision is shared by the current app session. It bypasses a stale
// browser/CDN image response after a refresh without reloading artwork while
// the visitor moves between pages.
const artworkRevision = Date.now().toString(36);

function currentArtworkUrl(source) {
  if (!source) return '';

  try {
    const url = new URL(source, window.location.href);
    url.searchParams.set('fanhub_artwork', artworkRevision);
    return url.toString();
  } catch {
    return source;
  }
}

export function PictureCover({ item }) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const source = useMemo(() => currentArtworkUrl(item.image), [item.image]);

  useEffect(() => {
    setLoaded(false);
    setFailed(false);
  }, [source]);

  return (
    <span className={`picture-cover ${loaded ? 'picture-ready' : ''}`}>
      <UniverseArtwork category={item.category} />
      {source && !failed && (
        <img
          src={source}
          alt={item.title}
          loading="lazy"
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
        />
      )}
    </span>
  );
}
