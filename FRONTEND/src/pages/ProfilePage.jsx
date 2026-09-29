import { send } from '../services/httpClient.js';
import { categories } from '../state/emptyStore.js';
import { Moon, Sun, Check } from 'lucide-react';
import React from 'react';

export function Profile({ db, large, perform, setLarge, setModal, setTheme, theme, user }) {
  return (
    <>
      <div className="page-heading">
        <div>
          <h1>Make it yours.</h1>
          <p>Your profile, your fandoms, your way to explore.</p>
        </div>
      </div>
      <form
        className="panel profile-form"
        onSubmit={async (e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          await perform(
            () =>
              send(
                '/api/me',
                {
                  displayName: f.get('name'),
                  favoriteFandoms: f
                    .get('favoriteNames')
                    .split(',')
                    .map((x) => x.trim())
                    .filter(Boolean),
                  categoryIds: f
                    .getAll('favorites')
                    .map((n) => db.categories.find((c) => c.name === n)?.id)
                    .filter(Boolean),
                  theme,
                  fontSize: large ? 18 : 16,
                  avatarUrl: f.get('avatarUrl') || null,
                },
                'PUT'
              ),
            'Profile updated.'
          );
        }}
      >
        <h2>Profile & preferences</h2>
        <button type="button" className="secondary" onClick={() => setModal('password')}>
          Change password
        </button>
        <label>
          Avatar URL (HTTPS)
          <input name="avatarUrl" type="url" defaultValue={user.avatarUrl || ''} />
        </label>
        <label>
          Display name
          <input name="name" required maxLength="80" defaultValue={user.name} />
        </label>
        <label>
          Email
          <input value={user.email} disabled readOnly />
        </label>
        <label>Categories of interest</label>
        <div className="interest-grid">
          {categories.map((c) => (
            <label className="interest" key={c}>
              <input
                type="checkbox"
                name="favorites"
                value={c}
                defaultChecked={user.favorites.includes(c)}
              />
              {c}
            </label>
          ))}
        </div>
        <label className="profile-fandoms">
          Favorite fandoms / universes
          <input
            name="favoriteNames"
            defaultValue={(user.favoriteNames || []).join(', ')}
            placeholder="Horizon Voyagers, Nova Chronicles…"
            maxLength="300"
          />
          <p>Separate names with commas. These also personalize your dashboard.</p>
        </label>
        <div className="setting-row">
          <div>
            <strong>Dark appearance</strong>
            <p>A softer glow for late-night exploring.</p>
          </div>
          <button
            type="button"
            className="secondary"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />} {theme}
          </button>
        </div>
        <div className="setting-row">
          <div>
            <strong>Larger text</strong>
            <p>Give every story a little more room.</p>
          </div>
          <input
            aria-label="Larger text"
            type="checkbox"
            checked={large}
            onChange={(e) => setLarge(e.target.checked)}
          />
        </div>
        <button className="primary">
          Save changes <Check size={16} />
        </button>
      </form>
    </>
  );
}
