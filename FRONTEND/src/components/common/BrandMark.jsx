import React from 'react';

export function BrandMark() {
  return (
    <span className="brand-lockup" aria-label="Fan Hub Plus">
      <span className="brand-logo" aria-hidden="true">
        <img src={`${import.meta.env.BASE_URL}fanhub-logo.png`} alt="" width="52" height="52" />
      </span>
      <span className="brand-wordmark">
        fan<span className="brand-wordmark-light">hub</span>
      </span>
      <span className="brand-plus">PLUS</span>
    </span>
  );
}
