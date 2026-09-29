import React from 'react';
import { Play, Headphones, Bookmark, Heart, MessageSquare, Star, X } from 'lucide-react';
import { PictureCover } from '../../components/media/PictureCover.jsx';
import { worldPalette } from '../../components/media/UniverseArtwork.jsx';
export function ContentCard({ item, wide = false, saved, bookmark, open, mediaActions }) {
  const isSaved = saved.some((b) => b.contentId === item.id);
  const isRateable = Boolean(item.id);
  const myRating =
    mediaActions?.ratings?.find(
      (rating) => rating.userId === mediaActions.user?.id && rating.contentId === item.id
    )?.value || 0;
  return (
    <article
      className={`content-card ${wide ? 'wide-card' : ''}`}
      data-spotlight
      data-tilt
      data-reveal
      style={{ '--card-accent': (worldPalette[item.category] || worldPalette.Anime)[0] }}
    >
      <button className="card-cover" aria-label={`Open ${item.title}`} onClick={() => open(item)}>
        <PictureCover key={item.image} item={item} />
        <span className="cover-shade" />
        <span className="category-label">{item.category}</span>
        {['video', 'audio'].includes(item.type) && (
          <span className="play-badge">
            {item.type === 'video' ? <Play size={22} /> : <Headphones size={22} />}
          </span>
        )}
      </button>
      <button
        className={`save-button ${isSaved ? 'saved' : ''}`}
        aria-label={`${isSaved ? 'Remove bookmark' : 'Bookmark'} ${item.title}`}
        aria-pressed={isSaved}
        onClick={() => bookmark(item)}
      >
        <Bookmark size={17} fill={isSaved ? 'currentColor' : 'none'} />
      </button>
      <div className="card-body">
        <div className="eyebrow">
          {item.type} <span>•</span>{' '}
          {item.type === 'article'
            ? Math.max(
                1,
                Math.ceil((item.body || item.description || '').split(/\s+/).length / 200)
              ) + ' min read'
            : item.genre || item.type}
        </div>
        <button className="title-button" onClick={() => open(item)}>
          {item.title}
        </button>
        <p>{item.description}</p>
        <div className="card-bottom">
          <span>
            <span className="tiny-avatar">F</span> {item.fandom}
          </span>
          <span>
            <Heart size={12} /> {item.popularity}
          </span>
        </div>
        {isRateable && mediaActions && (
          <div className="card-media-actions" aria-label={`Community actions for ${item.title}`}>
            <div className="card-rating-control">
              <span>Rate this discovery</span>
              <div className="compact-stars">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    className={value <= myRating ? 'is-rated' : ''}
                    aria-label={`Rate ${item.title} ${value} stars`}
                    onClick={(event) => {
                      event.stopPropagation();
                      mediaActions.rate(item, value);
                    }}
                  >
                    <Star size={15} fill={value <= myRating ? 'currentColor' : 'none'} />
                  </button>
                ))}
              </div>
            </div>
            <div className="card-media-buttons">
              {myRating > 0 && (
                <button
                  type="button"
                  className="card-media-link"
                  onClick={(event) => {
                    event.stopPropagation();
                    mediaActions.removeRating(item);
                  }}
                >
                  <X size={13} /> Remove rating
                </button>
              )}
              <button
                type="button"
                className="card-media-link"
                onClick={(event) => {
                  event.stopPropagation();
                  mediaActions.feedback(item);
                }}
              >
                <MessageSquare size={13} /> Feedback
              </button>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
