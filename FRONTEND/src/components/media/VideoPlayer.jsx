import React, { useState } from 'react';
import { videoSource } from '../../services/contentPresentation.js';

export function VideoPlayer({ url, title, poster }) {
  const source = videoSource(url);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  if (!source) return <p role="alert">A valid HTTPS video URL is required.</p>;
  return (
    <section aria-label={`Video: ${title}`}>
      {loading && !failed && source.kind !== 'link' && <p role="status">Loading video…</p>}
      {source.kind === 'file' && (
        <video
          className="video-player"
          controls
          playsInline
          preload="metadata"
          poster={poster}
          src={source.url}
          aria-label={title}
          onLoadedMetadata={() => setLoading(false)}
          onError={() => {
            setFailed(true);
            setLoading(false);
          }}
        >
          {new URL(source.url).pathname.startsWith('/catalog/') && (
            <track
              kind="captions"
              src={source.url.replace(/\.mp4$/i, '.vtt')}
              srcLang="en"
              label="English"
            />
          )}
        </video>
      )}
      {source.kind === 'embed' && (
        <iframe
          className="video-player"
          src={source.url}
          title={title}
          sandbox="allow-scripts allow-same-origin allow-presentation"
          allow="fullscreen; picture-in-picture"
          allowFullScreen
          onLoad={() => setLoading(false)}
          onError={() => setFailed(true)}
        />
      )}
      {failed && <p role="alert">The video could not load. Try opening the source below.</p>}
      {source.kind === 'link' && <p>This provider does not have a supported embedded player.</p>}
      <a href={source.url} target="_blank" rel="noreferrer">
        Open video source
      </a>
    </section>
  );
}
