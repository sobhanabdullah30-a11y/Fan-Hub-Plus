import { pageLink } from '../../app/routes.js';
import React from 'react';
import { BrandMark } from '../common/BrandMark.jsx';

export function SiteFooter({ setModal }) {
  return (
    <footer>
      <div>
        <strong>
          <BrandMark />
        </strong>
        <p>A universe for every kind of fan.</p>
      </div>
      <div className="footer-links">
        <a href={pageLink('Sitemap')}>Sitemap</a>
        <button onClick={() => setModal('feedback')}>Send feedback</button>
        <a href={pageLink('About')}>About & how it works</a>
        <a href={pageLink('Contact')}>Contact us</a>
        <a href={pageLink('Help')}>Help & FAQ</a>
      </div>
      <span>
        © 2026 Fan Hub Plus
        <br />
        <small>Connected to Fan Hub Plus</small>
      </span>
    </footer>
  );
}
