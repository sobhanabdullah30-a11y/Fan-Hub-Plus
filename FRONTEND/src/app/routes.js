export const publicPages = [
  'Discover',
  'Explore',
  'Media room',
  'Characters',
  'Events',
  'Showcase',
  'Resources',
  'About',
  'Contact',
  'Help',
  'Sitemap',
];

export const pageLink = (page, category) =>
  `#/${encodeURIComponent(page)}${category ? `?category=${encodeURIComponent(category)}` : ''}`;
