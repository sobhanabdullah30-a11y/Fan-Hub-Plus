import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function EventCalendar({ events }) {
  const [month, setMonth] = useState(() =>
    events.length
      ? events
          .map((e) => e.date)
          .sort()[0]
          .slice(0, 7)
      : new Date().toISOString().slice(0, 7)
  );
  const [y, m] = month.split('-').map(Number),
    offset = new Date(y, m - 1, 1).getDay(),
    days = new Date(y, m, 0).getDate();
  function move(delta) {
    const date = new Date(y, m - 1 + delta, 1);
    setMonth(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`);
  }
  const monthEvents = events.filter((e) => e.date.startsWith(month));
  return (
    <section className="panel calendar-panel" aria-label="Event calendar">
      <div className="calendar-header">
        <div>
          <span className="eyebrow purple">PLAN YOUR NEXT FAN MOMENT</span>
          <h2>
            {new Date(y, m - 1, 1).toLocaleDateString('en', { month: 'long', year: 'numeric' })}
          </h2>
        </div>
        <div>
          <button className="icon-button" aria-label="Previous month" onClick={() => move(-1)}>
            <ChevronLeft size={20} />
          </button>
          <label>
            Jump to month
            <input
              type="month"
              value={month}
              onChange={(e) => {
                if (e.target.value) setMonth(e.target.value);
              }}
            />
          </label>
          <button className="icon-button" aria-label="Next month" onClick={() => move(1)}>
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
      <div className="calendar-grid">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
          <div className="weekday" key={d}>
            {d}
          </div>
        ))}
        {Array.from({ length: offset }, (_, i) => (
          <div aria-hidden="true" className="calendar-day blank" key={`blank${i}`} />
        ))}
        {Array.from({ length: days }, (_, i) => {
          const date = `${month}-${String(i + 1).padStart(2, '0')}`,
            matches = events.filter((e) => e.date === date);
          return (
            <div className={`calendar-day ${matches.length ? 'has-events' : ''}`} key={date}>
              <span>{i + 1}</span>
              {matches.map((e) => (
                <button
                  key={e.id}
                  title={`${e.title}, ${e.city}`}
                  onClick={() =>
                    document
                      .getElementById(`event-${e.id}`)
                      ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
                  }
                >
                  <span className="calendar-event-title">{e.title}</span>
                  <span className="calendar-dot" aria-hidden="true">
                    ●
                  </span>
                  <span className="sr-only">
                    {e.title}, {e.city}, {e.date}
                  </span>
                </button>
              ))}
            </div>
          );
        })}
      </div>
      <p className="calendar-caption">
        {monthEvents.length
          ? `${monthEvents.length} event${monthEvents.length === 1 ? '' : 's'} this month. Select a marked day to see event details.`
          : 'No events for this month and city. Choose another month or city.'}
      </p>
    </section>
  );
}
