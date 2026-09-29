import { contentBody } from '../../services/catalogAdapters.js';
import { send } from '../../services/httpClient.js';
import { categories } from '../../state/emptyStore.js';
import { Send } from 'lucide-react';
import React, { useState } from 'react';
import { localDateTime } from '../../services/contentPresentation.js';

export function ContentEditor({
  busy,
  close,
  db,
  error,
  modal,
  perform,
  selected,
  setError,
  user,
}) {
  const [contentType, setContentType] = useState(selected?.type || 'article');
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        const f = Object.fromEntries(new FormData(e.currentTarget));
        try {
          const body = contentBody(f, db.categories, selected);
          const root = user.role === 'admin' ? '/api/admin/content' : '/api/me/submissions';
          await perform(
            () => send(root + (selected ? '/' + selected.id : ''), body, selected ? 'PUT' : 'POST'),
            selected ? 'Content updated.' : 'Content submitted.',
            close
          );
        } catch (e) {
          setError(e.message);
        }
      }}
    >
      <p>
        {modal === 'submit'
          ? 'Share your creativity with the community. An admin will review your submission before it appears.'
          : 'Manage articles, character profiles, media, collectibles, and releases.'}
      </p>
      <label>
        Title
        <input
          name="title"
          required
          maxLength="150"
          defaultValue={modal === 'editor' ? selected?.title : ''}
        />
      </label>
      <div className="form-grid">
        <label>
          Category
          <select name="category" defaultValue={selected?.category || 'Anime'}>
            {categories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
        <label>
          Content type
          <select
            name="type"
            value={contentType}
            onChange={(event) => setContentType(event.target.value)}
          >
            {[
              'article',
              'character',
              'video',
              'audio',
              'image',
              'merchandise',
              'release',
              'event',
            ].map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </label>
      </div>
      <label>
        Short description
        <textarea
          name="description"
          required
          maxLength="1000"
          defaultValue={selected?.description}
        />
      </label>
      <label>
        Fandom / universe
        <input
          name="fandom"
          required
          maxLength="100"
          defaultValue={selected?.fandom || 'Community originals'}
        />
      </label>
      <label>
        Full story / biography{' '}
        <small>
          Use ## headings, **bold**, - list items, &gt; quotes or ![caption](https://image-url).
          Separate blocks with a blank line.
        </small>
        <textarea name="body" rows="5" defaultValue={selected?.body} />
      </label>
      <div className="form-grid">
        <label>
          Genre
          <input name="genre" defaultValue={selected?.genre || 'Adventure'} required />
        </label>
        <label>
          Tag
          <input name="tag" defaultValue={selected?.tag || 'Community pick'} />
        </label>
        <label>
          Release date
          <input
            name="date"
            type="date"
            defaultValue={selected?.releaseDate?.slice(0, 10) || ''}
            required={contentType === 'release'}
          />
        </label>
      </div>
      <label>
        Image URL (HTTPS)
        <textarea
          name="images"
          placeholder="One HTTPS image URL per line"
          defaultValue={(selected?.imageUrls || []).join('\n')}
        />
      </label>
      <label>
        Video file, YouTube/Vimeo or audio URL (HTTPS)
        <input name="mediaUrl" type="url" defaultValue={selected?.mediaUrl} />
      </label>
      {contentType === 'event' && (
        <fieldset>
          <legend>Event details (for Event content)</legend>
          {['city', 'venue', 'ticketUrl'].map((n) => (
            <label key={n}>
              {n}
              <input name={n} defaultValue={selected?.[n] || ''} />
            </label>
          ))}
          {['latitude', 'longitude'].map((n) => (
            <label key={n}>
              {n}
              <input name={n} type="number" step="any" defaultValue={selected?.[n] ?? ''} />
            </label>
          ))}
          {['startsAt', 'endsAt'].map((n) => (
            <label key={n}>
              {n}
              <input name={n} type="datetime-local" defaultValue={localDateTime(selected?.[n])} />
            </label>
          ))}
        </fieldset>
      )}
      {user.role === 'admin' && (
        <label>
          <input type="checkbox" name="featured" defaultChecked={selected?.featured} /> Featured
        </label>
      )}
      {error && <p role="alert">{error}</p>}
      <button disabled={busy} className="primary full">
        {modal === 'submit' ? 'Submit for review' : 'Save discovery'} <Send size={16} />
      </button>
    </form>
  );
}
