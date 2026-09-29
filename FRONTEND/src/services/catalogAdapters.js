export const titleCase = (value) => value[0].toUpperCase() + value.slice(1);

export function contentItem(c, cats) {
  return {
    ...c,
    category: cats.find((x) => x.id === c.categoryId)?.name || 'Uncategorized',
    type: c.type.toLowerCase(),
    status: (c.status || 'Published').toLowerCase(),
    image: c.imageUrls?.[0] || '',
    gallery: c.imageUrls || [],
    tag: (c.tags || []).filter((tag) => !tag.startsWith('fanhub-')).join(', '),
    date: (c.startsAt || c.releaseDate || c.createdAt || '').slice(0, 10),
    year: Number((c.releaseDate || c.createdAt || '').slice(0, 4)),
    popularity: c.views || 0,
    views: c.views || 0,
    fandom: c.fandom || '',
    genre: c.genre || '',
    description: c.description || '',
    lat: c.latitude,
    lng: c.longitude,
  };
}

export function userItem(profile, cats) {
  const u = profile.user || profile;
  return {
    ...u,
    name: u.displayName || u.email,
    role: u.role === 'Admin' ? 'admin' : 'user',
    favorites: (profile.categoryIds || u.categoryIds || [])
      .map((id) => cats.find((c) => c.id === id)?.name)
      .filter(Boolean),
    favoriteNames: u.favoriteFandoms || [],
    fontSize: u.fontSize >= 18 ? 'large' : 'normal',
  };
}

export function contentBody(f, cats) {
  const body = {
    categoryId: cats.find((c) => c.name === f.category)?.id,
    title: f.title.trim(),
    description: f.description.trim(),
    body: f.body || '',
    type: titleCase(f.type),
    fandom: f.fandom.trim(),
    genre: f.genre || '',
    tags: (f.tag || '')
      .split(',')
      .map((x) => x.trim())
      .filter(Boolean),
    imageUrls: (f.images || f.image || '')
      .split(/\n/)
      .map((x) => x.trim())
      .filter(Boolean),
    mediaUrl: f.mediaUrl || null,
    releaseDate: f.date ? new Date(f.date).toISOString() : null,
    featured: f.featured === 'on',
    city: f.city || null,
    venue: f.venue || null,
    latitude: f.latitude ? Number(f.latitude) : null,
    longitude: f.longitude ? Number(f.longitude) : null,
    startsAt: f.startsAt ? new Date(f.startsAt).toISOString() : null,
    endsAt: f.endsAt ? new Date(f.endsAt).toISOString() : null,
    ticketUrl: f.ticketUrl || null,
  };
  for (const url of [...body.imageUrls, body.mediaUrl, body.ticketUrl].filter(Boolean)) {
    try {
      if (new URL(url).protocol !== 'https:') throw new Error();
    } catch {
      throw new Error('Image, media and ticket links must be valid HTTPS URLs.');
    }
  }
  if (body.type === 'Release' && !body.releaseDate)
    throw new Error('Releases need a release date.');
  if (body.type === 'Event' && (!body.startsAt || !body.city || !body.venue))
    throw new Error('Events need a start date, city and venue.');
  if (body.startsAt && body.endsAt && body.endsAt < body.startsAt)
    throw new Error('Event end must follow its start.');
  if (!body.categoryId) throw new Error('Choose an available category.');
  return body;
}
