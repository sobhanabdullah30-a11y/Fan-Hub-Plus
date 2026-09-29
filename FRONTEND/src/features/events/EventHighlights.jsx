import React from 'react';

export function EventHighlights({ events }) {
  return (
    <section className="event-highlights">
      <div className="section-heading">
        <div>
          <span className="eyebrow purple">THE COMMUNITY JOURNAL</span>
          <h2>Every gathering has a story.</h2>
          <p>A look ahead at the people and passions behind our community events.</p>
        </div>
      </div>
      <ol className="timeline">
        {events.map((e) => (
          <li key={e.id}>
            <time dateTime={e.date}>
              {new Date(e.date + 'T12:00').toLocaleDateString('en', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </time>
            <div className="panel">
              <span className="eyebrow purple">
                {e.category} · {e.city}
              </span>
              <h3>{e.title}</h3>
              <p>{e.description}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
