import { EventMap } from '../features/events/EventMap.jsx';
import { Pagination } from '../components/common/Pagination.jsx';
import { MapPin, ArrowUpRight, Plus } from 'lucide-react';
import { EventCalendar } from '../features/events/EventCalendar.jsx';
import { api } from '../services/httpClient.js';
import { EventHighlights } from '../features/events/EventHighlights.jsx';
import React from 'react';

export function Events({
  eventPage,
  setEventPage,
  city,
  db,
  location,
  setApiError,
  setCity,
  setLocation,
  setToast,
}) {
  const list = db.events
    .filter((e) => city === 'All cities' || e.city === city)
    .map((e) => ({
      ...e,
      distance:
        location && Number.isFinite(e.lat) && Number.isFinite(e.lng)
          ? Math.round(
              6371 *
                2 *
                Math.asin(
                  Math.sqrt(
                    Math.sin(((e.lat - location.latitude) * Math.PI) / 360) ** 2 +
                      Math.cos((location.latitude * Math.PI) / 180) *
                        Math.cos((e.lat * Math.PI) / 180) *
                        Math.sin(((e.lng - location.longitude) * Math.PI) / 360) ** 2
                  )
                )
            )
          : null,
    }))
    .sort((a, b) => (location ? a.distance - b.distance : a.date.localeCompare(b.date)));
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow purple">TAKE YOUR FANDOM OFFLINE</div>
          <h1>Meet your people.</h1>
          <p>Conventions, community nights, and moments worth showing up for.</p>
        </div>
      </div>
      <div className="notice">
        Check event details before making travel plans. Entries labelled [Demo] are fictional and
        have no real booking.
      </div>
      <div className="filter-bar">
        <select aria-label="Filter by city" value={city} onChange={(e) => setCity(e.target.value)}>
          {['All cities', ...(db.filters?.cities || [])].map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <button
          className="secondary"
          onClick={() =>
            navigator.geolocation
              ? navigator.geolocation.getCurrentPosition(
                  (p) => {
                    setLocation(p.coords);
                    setToast('Showing events within 100 km of your location.');
                  },
                  () => setToast('Location unavailable. Choose a city instead.')
                )
              : setToast('Location is not supported on this device.')
          }
        >
          <MapPin size={16} /> Near me
        </button>
      </div>
      {location && (
        <button className="secondary" onClick={() => setLocation(null)}>
          Show all locations
        </button>
      )}
      <p>
        {db.eventTotal || 0} upcoming events{location ? ' within 100 km' : ''}. Calendar and map
        show the current results page.
      </p>
      <EventMap events={list} />
      <EventCalendar key={city + ':' + eventPage} events={list} />
      <Pagination
        page={eventPage}
        pageSize={12}
        total={db.eventTotal}
        onChange={setEventPage}
        label="Events"
      />
      <div className="events-list">
        {list.map((e) => (
          <article className="event-card" id={`event-${e.id}`} key={e.id}>
            <div className="event-date">
              <span>
                {new Date(e.date + 'T12:00').toLocaleDateString('en', { month: 'short' })}
              </span>
              <strong>{e.date.slice(-2)}</strong>
            </div>
            <div>
              <span className="eyebrow purple">{e.category} · COMMUNITY EVENT</span>
              <h2>{e.title}</h2>
              <p>
                <MapPin size={14} /> {e.venue}, {e.city}
                {e.distance !== null && ` · ${e.distance.toLocaleString()} km away`}
              </p>
            </div>
            <div className="event-actions">
              {e.ticketUrl && /^https:\/\//.test(e.ticketUrl) ? (
                <a className="secondary" href={e.ticketUrl} target="_blank" rel="noreferrer">
                  Organizer tickets <ArrowUpRight size={15} />
                </a>
              ) : (
                <span className="ticket-unavailable">Ticket link not provided</span>
              )}
              {Number.isFinite(e.lat) && Number.isFinite(e.lng) && (
                <a
                  className="secondary"
                  href={`https://www.openstreetmap.org/?mlat=${e.lat}&mlon=${e.lng}#map=13/${e.lat}/${e.lng}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  View map <ArrowUpRight size={15} />
                </a>
              )}
              <button
                className="text-button"
                onClick={() => {
                  api('/api/events/' + e.id + '/calendar', { blob: true })
                    .then((blob) => {
                      const url = URL.createObjectURL(blob);
                      const link = document.createElement('a');
                      link.href = url;
                      link.download = e.title + '.ics';
                      link.click();
                      setTimeout(() => URL.revokeObjectURL(url), 1000);
                    })
                    .catch((error) => setApiError(error.message));
                }}
              >
                Add to calendar <Plus size={14} />
              </button>
            </div>
          </article>
        ))}
      </div>
      <EventHighlights events={list} />
    </>
  );
}
