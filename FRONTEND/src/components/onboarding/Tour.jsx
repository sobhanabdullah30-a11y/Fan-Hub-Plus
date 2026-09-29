import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';

export function Tour({ onDone, navigate, register }) {
  const [step, setStep] = useState(0);
  const steps = [
    [
      'Welcome to Fan Hub Plus',
      'This is your shared home for eight fandom categories. Browse freely as a visitor; join when you want to save and contribute.',
      'About',
    ],
    [
      'Find your next obsession',
      'Explore lets you search stories, profiles, media and collectibles. Choose a category, then refine with the filters and sorting controls.',
      'Explore',
    ],
    [
      'Keep the things you love',
      'A member profile unlocks your dashboard, bookmarks, private notes, ratings and favorite fandoms. You can edit your preferences in Settings.',
      'My dashboard',
    ],
    [
      'Meet, create, and get involved',
      'Discover events by city or on the calendar. Share your own fan story; an administrator reviews it before publication.',
      'Events',
    ],
  ];
  const [title, text, page] = steps[step];
  return (
    <section className="tour-content">
      <div className="tour-progress" aria-label={`Step ${step + 1} of ${steps.length}`}>
        {steps.map((_, i) => (
          <span key={i} className={i <= step ? 'complete' : ''} />
        ))}
      </div>
      <span className="eyebrow purple">
        STEP {step + 1} OF {steps.length}
      </span>
      <h3>{title}</h3>
      <p>{text}</p>
      <div className="tour-actions">
        <button className="secondary" disabled={!step} onClick={() => setStep(step - 1)}>
          <ChevronLeft size={15} /> Back
        </button>
        {step < steps.length - 1 ? (
          <button className="primary" onClick={() => setStep(step + 1)}>
            Next <ChevronRight size={15} />
          </button>
        ) : (
          <button
            className="primary"
            onClick={() => {
              onDone();
              navigate('Explore');
            }}
          >
            Start exploring <Check size={15} />
          </button>
        )}
      </div>
      <div className="auth-links">
        <button
          onClick={() => {
            onDone();
            navigate(page);
          }}
        >
          Open this area
        </button>
        <button
          onClick={() => {
            onDone();
            register();
          }}
        >
          Create a member profile
        </button>
      </div>
    </section>
  );
}
