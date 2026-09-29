import { worldPalette, UniverseArtwork } from '../../components/media/UniverseArtwork.jsx';
import { ArrowUpRight, ChevronRight } from 'lucide-react';
import React from 'react';

export function UniverseTiles({ categories, navigate }) {
  return (
    <div className="premium-universe-grid">
      {categories.map((c, i) => (
        <button
          className="world-card"
          key={c}
          data-spotlight
          data-tilt
          data-reveal
          style={{ '--world-color': (worldPalette[c] || worldPalette.Anime)[0] }}
          onClick={() => navigate('Explore', c)}
        >
          <UniverseArtwork category={c} />
          <div className="world-shade" />
          <span className="world-number">WORLD / 0{i + 1}</span>
          <span className="world-arrow">
            <ArrowUpRight size={18} />
          </span>
          <span className="world-info">
            <strong>{c}</strong>
            <span>
              {{
                Anime: 'Limitless imagination',
                Gaming: 'Press start on possibility',
                Movies: 'Stories beyond the screen',
                'TV Shows': 'Your next great binge',
                'K-Pop': 'Find your frequency',
                Comics: 'Legends live here',
                Manga: 'A world in every panel',
                Cosplay: 'Become the extraordinary',
              }[c] || 'Find your community'}
            </span>
            <small>
              EXPLORE CATEGORY <ChevronRight size={12} />
            </small>
          </span>
        </button>
      ))}
    </div>
  );
}
