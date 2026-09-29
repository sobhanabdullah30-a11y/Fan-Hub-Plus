import { featuredArticles, upcomingReleases } from '../services/contentPresentation.js';
import { AccessOverview } from '../components/common/AccessOverview.jsx';
import { HomeNavigation, HomeInformation } from '../features/home/HomeNavigation.jsx';
import { UniverseHero } from '../features/home/UniverseHero.jsx';
import { WelcomeStrip } from '../features/home/WelcomeStrip.jsx';
import { ArrowUpRight, Play, CalendarDays, ArrowRight } from 'lucide-react';
import { UniverseTiles } from '../features/home/UniverseTiles.jsx';
import { UniverseArtwork } from '../components/media/UniverseArtwork.jsx';
import { ContactSection } from '../features/feedback/ContactSection.jsx';
import { SiteMap } from './information/SiteMap.jsx';
import React from 'react';

export function DiscoveryHome({
  published,
  categories,
  category,
  setCategory,
  navigate,
  open,
  user,
  requireUser,
  setSelected,
  setModal,
  saved,
  bookmark,
  Card,
  motion,
  accent,
  setAccent,
  onContact,
  mediaActions,
}) {
  const submit = () =>
    requireUser(() => {
      setSelected(null);
      setModal('submit');
    });
  const heroProps = { navigate, setModal, submit, motion };
  const featured = published.find((c) => c.type === 'video') || published[0],
    releases = upcomingReleases(published).slice(0, 3);
  const articles = featuredArticles(published, category);
  return (
    <div className="discovery-premium">
      <HomeNavigation
        accent={accent}
        setAccent={setAccent}
        user={user}
        navigate={navigate}
        setModal={setModal}
      />
      <div className="discovery-topline">
        <span>A HOME FOR YOUR OBSESSIONS</span>
        <span>CURATED CULTURE, UNLIMITED CONNECTIONS</span>
      </div>
      <UniverseHero {...heroProps} />
      <div className="universe-content">
        <WelcomeStrip navigate={navigate} startTour={() => setModal('tour')} />
        <AccessOverview user={user} />
        <section className="worlds-section" id="landing-explore" tabIndex="-1">
          <div className="premium-section-heading" data-reveal>
            <div>
              <span className="section-index">01 / EXPLORE</span>
              <h2>
                Every obsession.
                <br />
                <span>A whole new world.</span>
              </h2>
            </div>
            <div>
              <p>Choose a familiar favorite or try something new.</p>
              <button className="text-button" onClick={() => navigate('Explore')}>
                Explore all universes <ArrowUpRight size={16} />
              </button>
            </div>
          </div>
          <UniverseTiles categories={categories} navigate={navigate} />
        </section>
        <section className="editorial-section">
          <div className="premium-section-heading" data-reveal>
            <div>
              <span className="section-index">02 / THE CULTURE EDIT</span>
              <h2>
                Worth your <span>attention.</span>
              </h2>
            </div>
            <button className="secondary" onClick={() => navigate('Explore')}>
              All discoveries <ArrowUpRight size={16} />
            </button>
          </div>
          <div className="home-tabs">
            {['All fandoms', ...categories].map((c) => (
              <button
                className={category === c ? 'active' : ''}
                key={c}
                onClick={() => navigate('Explore', c)}
              >
                {c}
              </button>
            ))}
            <span>
              <span className="live-dot" /> BROWSE EVERY DISCOVERY
            </span>
          </div>
          {!articles.length && (
            <p className="notice">
              No featured articles in this category yet. Browse all discoveries or share a story for
              review.
            </p>
          )}
          <div className="card-grid">
            {articles.slice(0, 3).map((c) => (
              <Card
                key={c.id}
                item={c}
                saved={saved}
                bookmark={bookmark}
                open={open}
                mediaActions={mediaActions}
              />
            ))}
          </div>
        </section>
        <section className="feature-bento" data-reveal>
          <div className="screening-room" data-spotlight>
            <UniverseArtwork category={featured?.category || 'Movies'} />
            <div className="screening-overlay" />
            <span className="section-index">03 / FEATURED MEDIA</span>
            <button
              className="big-play"
              aria-label={featured ? `Play ${featured.title}` : 'Browse the media room'}
              onClick={() => (featured ? open(featured) : navigate('Media room'))}
            >
              <Play size={29} fill="currentColor" />
            </button>
            <div className="screening-copy">
              <span className="eyebrow">FEATURED {featured?.type?.toUpperCase() || 'MEDIA'}</span>
              <h2>{featured?.title || 'Discover stories beyond the screen.'}</h2>
              <p className="screening-description">
                {featured?.description ||
                  'Watch, listen, and explore fan-made media from the community.'}
              </p>
              <div className="screening-meta">
                <span>{featured?.category || 'Community media'}</span>
                {featured?.genre && <span>{featured.genre}</span>}
              </div>
              <button
                className="primary screening-action"
                onClick={() => (featured ? open(featured) : navigate('Media room'))}
              >
                {featured ? 'Play featured media' : 'Explore media room'} <ArrowUpRight size={16} />
              </button>
            </div>
            <span className="screening-code">FAN HUB MEDIA ROOM</span>
          </div>
          <div className="community-feature" data-spotlight>
            <span className="section-index">BETTER TOGETHER</span>
            <div className="community-mark" aria-hidden="true">
              <CalendarDays size={46} strokeWidth={1} />
            </div>
            <h2>
              Meet beyond
              <br />
              <em>the screen.</em>
            </h2>
            <p>
              Browse conventions and meetups by city, check the calendar, and save an event for
              later.
            </p>
            <button className="secondary" onClick={() => navigate('Events')}>
              Find your next moment <ArrowUpRight size={16} />
            </button>
          </div>
        </section>
        <section className="premium-releases">
          <div className="premium-section-heading" data-reveal>
            <div>
              <span className="section-index">04 / ON THE HORIZON</span>
              <h2>
                The anticipation <span>is real.</span>
              </h2>
            </div>
            <button className="text-button" onClick={() => navigate('Showcase')}>
              See the release watch <ArrowRight size={16} />
            </button>
          </div>
          {!releases.length && (
            <p className="notice">No upcoming releases have been announced yet.</p>
          )}
          <div className="release-list">
            {releases.map((c, i) => (
              <button className="release-row" key={c.id} onClick={() => open(c)} data-spotlight>
                <span className="release-index">0{i + 1}</span>
                <span className="release-art">
                  <UniverseArtwork category={c.category} />
                </span>
                <span className="release-info">
                  <small>{c.category} / UPCOMING RELEASE</small>
                  <strong>{c.title}</strong>
                </span>
                <span className="release-when">
                  {new Date(c.date + 'T12:00').toLocaleDateString('en', {
                    month: 'short',
                    day: 'numeric',
                  })}
                  <small>{c.year}</small>
                </span>
                <span className="round-arrow">
                  <ArrowUpRight size={20} />
                </span>
              </button>
            ))}
          </div>
        </section>
        <section className="join-universe" data-reveal data-spotlight>
          <div className="join-lines" aria-hidden="true" />
          <span className="section-index">YOUR OWN CORNER OF FAN HUB PLUS</span>
          <h2>
            Keep your favorites
            <br />
            <em>close.</em>
          </h2>
          <p>Save the stories. Share your perspective. Find your people.</p>
          <button
            className="primary premium-primary"
            onClick={() => (user ? navigate('My dashboard') : setModal('register'))}
          >
            {user ? 'Enter your universe' : 'Create your collection'}
            <span>
              <ArrowUpRight size={20} />
            </span>
          </button>
          <span className="join-wordmark" aria-hidden="true">
            FANHUB
          </span>
        </section>
        <HomeInformation navigate={navigate} setModal={setModal} />
        <ContactSection onContact={onContact} user={user} />
        <SiteMap
          compact
          user={user}
          signIn={() => setModal('login')}
          submit={submit}
          feedback={() => setModal('feedback')}
        />
      </div>
    </div>
  );
}
