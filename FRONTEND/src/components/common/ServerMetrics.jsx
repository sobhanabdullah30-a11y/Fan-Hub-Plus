import React from 'react';

export function ServerMetrics({ value }) {
  if (value == null) return <p>No statistics available.</p>;
  const label = (s) => s.replace(/([a-z])([A-Z])/g, '$1 $2');
  return (
    <div className="server-metrics">
      {Object.entries(value).map(([key, v]) => (
        <div key={key}>
          <strong>{label(key)}</strong>
          {v && typeof v === 'object' ? <ServerMetrics value={v} /> : <p>{String(v ?? '—')}</p>}
        </div>
      ))}
    </div>
  );
}
