import React, { useState } from 'react';

export function EventMap({ events }) {
  const locations = events.filter((e) => Number.isFinite(e.lat) && Number.isFinite(e.lng));
  const [selected, setSelected] = useState('');
  const event = locations.find((e) => e.id === selected) || locations[0];
  if (!event) return <p>No mapped locations are available for these events.</p>;
  const lat = event.lat,
    lng = event.lng;
  const query = new URLSearchParams({
    bbox: `${lng - 0.04},${lat - 0.03},${lng + 0.04},${lat + 0.03}`,
    layer: 'mapnik',
    marker: `${lat},${lng}`,
  });
  return (
    <section className="panel">
      <h2>Explore event locations</h2>
      <label>
        Show on map
        <select value={event.id} onChange={(e) => setSelected(e.target.value)}>
          {locations.map((e) => (
            <option key={e.id} value={e.id}>
              {e.title} — {e.city}
            </option>
          ))}
        </select>
      </label>
      <iframe
        title={`Map: ${event.title}`}
        src={`https://www.openstreetmap.org/export/embed.html?${query}`}
        loading="lazy"
        style={{ width: '100%', height: 320, border: 0 }}
      />
      <a
        href={`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=13/${lat}/${lng}`}
        target="_blank"
        rel="noreferrer"
      >
        Open larger map
      </a>
    </section>
  );
}
