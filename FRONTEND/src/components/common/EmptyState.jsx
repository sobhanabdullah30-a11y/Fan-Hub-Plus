import { Compass, ArrowRight } from 'lucide-react';
import React from 'react';

export function Empty({ title, text, action, actionLabel = 'Explore fandoms' }) {
  return (
    <div className="empty">
      <Compass size={38} />
      <h2>{title}</h2>
      <p>{text}</p>
      {action && (
        <button className="primary" onClick={action}>
          {actionLabel} <ArrowRight size={16} />
        </button>
      )}
    </div>
  );
}
