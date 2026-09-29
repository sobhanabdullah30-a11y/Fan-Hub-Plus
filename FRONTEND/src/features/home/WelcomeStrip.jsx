import { ArrowRight } from 'lucide-react';
import { pageLink } from '../../app/routes.js';
import React from 'react';

export function WelcomeStrip({ navigate, startTour }) {
  return (
    <section className="welcome-strip" aria-labelledby="new-here-title">
      <div>
        <span className="eyebrow purple">NEW TO FAN HUB PLUS?</span>
        <h2 id="new-here-title">Eight fandoms. One place to feel at home.</h2>
        <p>
          Discover stories, explore characters and media, and find fan events. Join to save your
          favorites and share your own creations.
        </p>
      </div>
      <div className="welcome-links">
        <button className="primary" onClick={startTour}>
          Take a quick tour <ArrowRight size={15} />
        </button>
        <a href={pageLink('About')}>What is Fan Hub Plus?</a>
        <a href={pageLink('Sitemap')}>View the sitemap</a>
      </div>
    </section>
  );
}
