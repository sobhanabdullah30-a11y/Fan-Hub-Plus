import React from 'react';

export function LoadingState({ label = 'Loading discoveries…', cards = 3 }) {
  return (
    <section className="loading-state" role="status" aria-live="polite" aria-label={label}>
      <div className="loading-state-heading">
        <span className="loading-spinner" aria-hidden="true" />
        <div>
          <strong>{label}</strong>
          <p>Preparing the latest content from Fan Hub.</p>
        </div>
      </div>
      {cards > 0 && (
        <div className="loading-card-grid" aria-hidden="true">
          {Array.from({ length: cards }, (_, index) => (
            <div className="loading-card" key={index}>
              <span className="loading-art" />
              <span className="loading-line wide" />
              <span className="loading-line" />
              <span className="loading-line short" />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
