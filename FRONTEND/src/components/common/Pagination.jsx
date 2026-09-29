import React from 'react';

export function Pagination({ page, pageSize, total = 0, onChange, label = 'Results' }) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  if (pages === 1) return null;
  return (
    <nav className="detail-actions" aria-label={`${label} pagination`}>
      <button className="secondary" disabled={page <= 1} onClick={() => onChange(page - 1)}>
        Previous
      </button>
      <span>
        {label}: page {page} of {pages} · {total} records
      </span>
      <button className="secondary" disabled={page >= pages} onClick={() => onChange(page + 1)}>
        Next
      </button>
    </nav>
  );
}
