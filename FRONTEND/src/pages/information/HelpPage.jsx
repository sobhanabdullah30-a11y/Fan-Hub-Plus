import React, { useState } from 'react';
import { Play, ArrowRight } from 'lucide-react';

export function HelpPage({ startTour, feedback, faqs = [] }) {
  const [search, setSearch] = useState('');
  const visible = faqs
    .map((f) => ['Fan Hub help', f.question, f.answer])
    .filter((q) => q.join(' ').toLowerCase().includes(search.toLowerCase()));
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow purple">A LITTLE GUIDANCE GOES A LONG WAY</span>
          <h1>How can we help?</h1>
          <p>Learn the platform, find your way around, and get answers.</p>
        </div>
        <button className="secondary" onClick={startTour}>
          Take the tour <Play size={15} />
        </button>
      </div>
      <label className="help-search">
        Search help
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Try bookmarks, events, or password…"
        />
      </label>
      <div className="faq-list">
        {visible.map(([group, q, a]) => (
          <details key={q}>
            <summary>
              <span>
                <small>{group}</small>
                {q}
              </span>
              <PlusIndicator />
            </summary>
            <p>{a}</p>
          </details>
        ))}
        {!visible.length && (
          <p>No answers match that search. Try a different phrase or send us feedback.</p>
        )}
      </div>
      <div className="community-banner">
        <div>
          <h2>Still have a question?</h2>
          <p>Tell us what you need, or share an idea to improve the experience.</p>
        </div>
        <button className="primary" onClick={feedback}>
          Send feedback <ArrowRight size={15} />
        </button>
      </div>
    </>
  );
}

export function PlusIndicator() {
  return (
    <span aria-hidden="true" className="faq-plus">
      +
    </span>
  );
}
