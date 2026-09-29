import React from 'react';
import { ArrowUpRight, Compass, BookOpen, MessageCircle } from 'lucide-react';
import { pageLink } from '../../app/routes.js';

export function HomeNavigation({ accent, setAccent, user, navigate, setModal }) {
  return (
    <div className="home-navigation">
      <nav aria-label="Landing page navigation">
        <a href={pageLink('Discover')} aria-current="page">
          Home
        </a>
        <a href={pageLink('About')}>About us</a>
        <a href={pageLink('Contact')}>Contact us</a>
        <a href={pageLink('Help')}>Help</a>
      </nav>
      <div className="home-nav-tools">
        <div className="accent-picker" aria-label="Accent theme">
          {['lilac', 'mint', 'sunset'].map((color) => (
            <button
              key={color}
              className={`accent-${color}`}
              aria-label={`${color} accent theme`}
              aria-pressed={accent === color}
              onClick={() => setAccent(color)}
            >
              <span />
            </button>
          ))}
        </div>
        <button
          className="text-button"
          onClick={() => (user ? navigate('My dashboard') : setModal('login'))}
        >
          {user ? 'My portal' : 'Join the community'}
          <ArrowUpRight size={15} />
        </button>
      </div>
    </div>
  );
}

export function HomeInformation({ navigate, setModal }) {
  return (
    <section className="home-information" aria-label="About Fan Hub Plus" data-reveal>
      <div>
        <span className="section-index">A LITTLE ABOUT US</span>
        <h2>
          Built around the things
          <br />
          you love.
        </h2>
        <p>
          Fan Hub Plus brings eight fandoms together. Discover articles, character profiles and
          media, find fan events, and keep your favorites in your own collection.
        </p>
        <button className="text-button" onClick={() => navigate('About')}>
          Our story & how it works
          <ArrowUpRight size={17} />
        </button>
      </div>
      <div className="home-information-links">
        {[
          [Compass, 'Explore freely', 'Browse every fandom without an account.', 'Explore'],
          [BookOpen, 'Make it yours', 'Save discoveries, add notes and share your work.', 'join'],
          [
            MessageCircle,
            'Get in touch',
            'Questions, suggestions or something to report?',
            'Contact',
          ],
        ].map(([Icon, title, copy, page], i) => (
          <button
            key={title}
            onClick={() => (page === 'join' ? setModal('login') : navigate(page))}
          >
            <span className="home-info-icon">
              <Icon size={20} />
            </span>
            <span>
              <strong>{title}</strong>
              <small>{copy}</small>
            </span>
            <ArrowUpRight size={17} />
            <i>0{i + 1}</i>
          </button>
        ))}
      </div>
    </section>
  );
}
