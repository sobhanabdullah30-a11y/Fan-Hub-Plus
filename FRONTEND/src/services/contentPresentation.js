export function localDateTime(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function featuredArticles(items, category = 'All fandoms') {
  return items.filter(
    (item) =>
      item.featured &&
      item.type === 'article' &&
      (category === 'All fandoms' || item.category === category)
  );
}

export function upcomingReleases(items, now = Date.now()) {
  return items
    .filter((item) => item.type === 'release' && Date.parse(item.releaseDate) > now)
    .sort((a, b) => Date.parse(a.releaseDate) - Date.parse(b.releaseDate));
}

export function contentIdFromUrl(url) {
  const path = url.pathname.match(/^\/content\/([0-9a-f-]{36})\/?$/i);
  return path?.[1] || url.searchParams.get('content');
}

export function videoSource(value) {
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:') return null;
    if (/\.(mp4|webm|ogv)$/i.test(url.pathname)) return { kind: 'file', url: url.href };
    if (
      ['www.youtube.com', 'youtube.com', 'youtu.be', 'www.youtube-nocookie.com'].includes(
        url.hostname
      )
    ) {
      const id =
        url.hostname === 'youtu.be'
          ? url.pathname.slice(1)
          : url.searchParams.get('v') || url.pathname.split('/embed/')[1];
      if (/^[\w-]{11}$/.test(id || ''))
        return { kind: 'embed', url: `https://www.youtube-nocookie.com/embed/${id}` };
    }
    if (['vimeo.com', 'www.vimeo.com', 'player.vimeo.com'].includes(url.hostname)) {
      const id = url.pathname.split('/').filter(Boolean).pop();
      if (/^\d+$/.test(id || ''))
        return { kind: 'embed', url: `https://player.vimeo.com/video/${id}` };
    }
    return { kind: 'link', url: url.href };
  } catch {
    return null;
  }
}
