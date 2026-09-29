import { VideoPlayer } from '../../components/media/VideoPlayer.jsx';
import { MediaGallery } from '../../components/media/MediaGallery.jsx';
import { ArticleBody } from '../../components/content/ArticleBody.jsx';
import {
  Bookmark,
  Share2,
  Star,
  Check,
  MessageSquare,
  Clapperboard,
  UserRound,
} from 'lucide-react';
import { api, send } from '../../services/httpClient.js';
import React from 'react';

export function ContentDetails({
  bookmark,
  busy,
  db,
  error,
  open,
  perform,
  requireUser,
  saved,
  selected,
  setError,
  setModal,
  setSelected,
  setToast,
  user,
}) {
  const isMedia = ['video', 'audio', 'image'].includes(selected.type);
  const isRateable = Boolean(selected.id);
  const tags = (selected.tag || '')
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);

  return (
    <>
      <div className="detail-meta">
        <span>
          {selected.fandom} · {selected.year}
        </span>
        {selected.genre && <span>{selected.genre}</span>}
        {tags.map((tag) => (
          <span className="detail-tag" key={tag}>
            {tag}
          </span>
        ))}
      </div>
      <p className="detail-lede">{selected.description}</p>
      {isMedia && (
        <section className="detail-media-panel" aria-label="Interactive media player">
          <div className="detail-section-heading">
            <span className="eyebrow purple">
              <Clapperboard size={14} /> INTERACTIVE MEDIA
            </span>
            <p>Play, rate, save, or share this community discovery.</p>
          </div>
          {selected.type === 'video' && (
            <VideoPlayer
              key={selected.mediaUrl}
              url={selected.mediaUrl}
              title={selected.title}
              poster={selected.image}
            />
          )}
          {selected.type === 'audio' && (
            <audio
              controls
              preload="metadata"
              src={selected.mediaUrl}
              aria-label={selected.title}
            />
          )}
          {selected.type === 'image' && (
            <MediaGallery
              items={(selected.imageUrls || []).map((image, i) => ({
                id: i,
                image,
                title: selected.title,
              }))}
            />
          )}
        </section>
      )}
      {selected.type === 'merchandise' && (
        <div className="notice">Merchandise showcase only. No checkout, orders, or payments.</div>
      )}
      {['merchandise', 'character'].includes(selected.type) && (
        <MediaGallery
          items={(selected.imageUrls || []).map((image, i) => ({
            id: i,
            image,
            title: selected.title,
          }))}
        />
      )}
      {selected.type === 'character' && (
        <section className="character-profile-summary" aria-label="Character profile">
          <span className="eyebrow purple">
            <UserRound size={14} /> CHARACTER PROFILE
          </span>
          <dl>
            <div>
              <dt>Universe</dt>
              <dd>{selected.fandom}</dd>
            </div>
            <div>
              <dt>Category</dt>
              <dd>{selected.category}</dd>
            </div>
            <div>
              <dt>Genre</dt>
              <dd>{selected.genre || 'Community original'}</dd>
            </div>
          </dl>
        </section>
      )}
      {selected.type === 'article' && selected.featured && (
        <div className="featured-story-note">Featured story · curated by the Fan Hub team</div>
      )}
      <ArticleBody text={selected.body || selected.description} />
      <div className="detail-actions">
        <button className="primary" onClick={() => bookmark(selected)}>
          <Bookmark size={16} />
          {saved.some((b) => b.contentId === selected.id)
            ? 'Saved to collection'
            : 'Save discovery'}
        </button>
        <button
          className="secondary"
          onClick={async () => {
            const url = `${window.location.origin}/content/${selected.id}`;
            try {
              await api('/api/content/' + selected.id + '/share');
              await navigator.clipboard.writeText(url);
              setToast('Story link copied.');
            } catch {
              setError(`Copy this link: ${url}`);
            }
          }}
        >
          <Share2 size={16} /> Share
        </button>
      </div>
      {error && <p>{error}</p>}
      {user && isRateable && (
        <button
          className="text-button"
          disabled={busy}
          onClick={() =>
            perform(
              () => api('/api/content/' + selected.id + '/rating', { method: 'DELETE' }),
              'Rating removed.',
              () => open(selected)
            )
          }
        >
          Remove my rating
        </button>
      )}
      {isRateable && (
        <div className="rating-row">
          <span>How was this discovery?</span>
          <div>
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                aria-label={`Rate ${n} stars`}
                className="star-button"
                onClick={() =>
                  requireUser(() => {
                    perform(
                      () =>
                        send(
                          '/api/content/' + selected.id + '/rating',
                          { stars: n, comment: '' },
                          'PUT'
                        ),
                      'Rating saved.',
                      () => open(selected)
                    );
                  })
                }
              >
                <Star
                  size={21}
                  fill={
                    (db.ratings.find((r) => r.userId === user?.id && r.contentId === selected.id)
                      ?.value || 0) >= n
                      ? 'currentColor'
                      : 'none'
                  }
                />
              </button>
            ))}
          </div>
          <small>{db.ratings.filter((r) => r.contentId === selected.id).length} ratings</small>
        </div>
      )}
      {isRateable && (
        <button
          className="secondary media-feedback-button"
          onClick={() => {
            setSelected({ ...selected, feedbackContext: true });
            setModal('feedback');
          }}
        >
          <MessageSquare size={16} /> Send feedback about this discovery
        </button>
      )}
      {saved.some((b) => b.contentId === selected.id) && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const note = new FormData(e.currentTarget).get('note');
            perform(
              () => send('/api/me/bookmarks/' + selected.id, { note }, 'PUT'),
              'Personal note saved.'
            );
          }}
        >
          <label>
            Your private note
            <textarea
              name="note"
              defaultValue={saved.find((b) => b.contentId === selected.id)?.note}
              placeholder="What made this discovery special?"
              maxLength="2000"
            />
          </label>
          <button className="secondary">
            Save note <Check size={14} />
          </button>
        </form>
      )}
    </>
  );
}
