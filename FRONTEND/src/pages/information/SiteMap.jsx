import { sitemapGroups } from '../../content/sitemapGroups.js';
import { Map, ArrowRight, Shield } from 'lucide-react';
import { pageLink } from '../../app/routes.js';
import { categories } from '../../state/emptyStore.js';
import React from 'react';

export function SiteMap({ user, signIn, submit, feedback, compact = false }) {
  return (
    <section
      className={`site-map ${compact ? 'compact-map' : ''}`}
      aria-labelledby={compact ? 'home-sitemap-heading' : 'sitemap-heading'}
    >
      <div className="section-heading">
        <div>
          <span className="eyebrow purple">YOUR MAP TO FAN HUB PLUS</span>
          <h2 id={compact ? 'home-sitemap-heading' : 'sitemap-heading'}>
            {compact ? 'Explore our sitemap' : 'Every destination, in one place.'}
          </h2>
          <p>Follow a link to explore. Member and admin areas are clearly marked.</p>
        </div>
        <Map size={25} className="purple" />
      </div>
      <div className="sitemap-columns">
        {sitemapGroups.map((group) => (
          <div key={group.title}>
            <h3>{group.title}</h3>
            <p>{group.description}</p>
            <ul>
              {group.links.map(([label, page]) => (
                <li key={page}>
                  <a
                    href={pageLink(page)}
                    onClick={(e) => {
                      if (['My dashboard', 'My collection', 'Settings'].includes(page) && !user) {
                        e.preventDefault();
                        signIn();
                      }
                    }}
                  >
                    {label}
                    <ArrowRight size={12} />
                  </a>
                </li>
              ))}
            </ul>
            {group.title === 'Your personal space' && (
              <button className="sitemap-action" onClick={submit}>
                Submit a fan story <ArrowRight size={12} />
              </button>
            )}
            {group.title === 'Get to know us' && (
              <button className="sitemap-action" onClick={feedback}>
                Feedback & contact <ArrowRight size={12} />
              </button>
            )}
          </div>
        ))}
        <div>
          <h3>Find your fandom</h3>
          <p>Browse all eight categories</p>
          <ul>
            {categories.map((c) => (
              <li key={c}>
                <a href={pageLink('Explore', c)}>
                  {c}
                  <ArrowRight size={12} />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="sitemap-admin">
        <Shield size={17} />
        <span>
          <strong>Administration</strong> · Content, media, users, submissions, feedback and
          analytics. Administrator access required.
        </span>
        {user?.role === 'admin' ? (
          <a href={pageLink('Admin')}>
            Open admin portal <ArrowRight size={13} />
          </a>
        ) : (
          <span className="badge">Admin only</span>
        )}
      </div>
    </section>
  );
}
