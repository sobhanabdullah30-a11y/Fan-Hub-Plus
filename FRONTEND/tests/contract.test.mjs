import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { contentBody, contentItem, userItem } from '../src/services/catalogAdapters.js';
const contract = JSON.parse(fs.readFileSync(new URL('../src/contracts/openapi.json', import.meta.url)));
const cats = [{ id: '10000000-0000-0000-0000-000000000001', name: 'Anime' }];
const fields = {
  category: 'Anime',
  title: ' Test ',
  description: ' Description ',
  type: 'article',
  fandom: 'Original',
  tag: 'art, stories',
  images: 'https://example.com/a.png\nhttps://example.com/b.png',
  date: '2026-09-25',
};
test('editor payload contains only Swagger fields and valid enum values', () => {
  const body = contentBody(fields, cats);
  const schema = contract.components.schemas.ContentForCreation;
  assert.deepEqual(
    Object.keys(body).filter((k) => !schema.properties[k]),
    []
  );
  for (const key of schema.required) assert.ok(body[key] != null);
  assert.ok(contract.components.schemas.ContentType.enum.includes(body.type));
  assert.equal(body.imageUrls.length, 2);
  assert.equal(body.categoryId, cats[0].id);
});
test('unsafe asset URLs and missing categories cannot reach the API', () => {
  assert.throws(() => contentBody({ ...fields, images: 'javascript:alert(1)' }, cats), /HTTPS/);
  assert.throws(() => contentBody({ ...fields, category: 'missing' }, cats), /category/);
});
test('event dates must be coherent', () => {
  assert.throws(() => contentBody({ ...fields, type: 'event' }, cats), /start date/);
  assert.throws(
    () =>
      contentBody(
        {
          ...fields,
          type: 'event',
          city: 'City',
          venue: 'Venue',
          startsAt: '2026-09-25T12:00',
          endsAt: '2026-09-25T11:00',
        },
        cats
      ),
    /end/
  );
});
test('server enum, nullable media, publication state and IDs map without fabricated content', () => {
  const result = contentItem(
    {
      id: 'server-id',
      categoryId: cats[0].id,
      type: 'Character',
      status: 'Pending',
      createdAt: '2026-09-25T00:00:00Z',
      imageUrls: null,
      tags: null,
    },
    cats
  );
  assert.equal(result.id, 'server-id');
  assert.equal(result.type, 'character');
  assert.equal(result.status, 'pending');
  assert.equal(result.image, '');
  assert.deepEqual(result.gallery, []);
});
test('only explicit backend Admin role maps to administrator', () => {
  assert.equal(userItem({ displayName: 'Member', role: 'Member' }, cats).role, 'user');
  assert.equal(userItem({ displayName: 'Administrator', role: 'Admin' }, cats).role, 'admin');
  assert.equal(userItem({ displayName: 'Unknown' }, cats).role, 'user');
});

test('nested profile response preserves the signed-in administrator and interests', () => {
  const user = userItem(
    {
      user: {
        id: 'admin-id',
        displayName: 'Administrator',
        role: 'Admin',
        fontSize: 18,
        favoriteFandoms: ['Original'],
      },
      categoryIds: [cats[0].id],
    },
    cats
  );
  assert.equal(user.id, 'admin-id');
  assert.equal(user.role, 'admin');
  assert.deepEqual(user.favorites, ['Anime']);
  assert.deepEqual(user.favoriteNames, ['Original']);
});

test('optional editor text remains valid for non-nullable backend strings', () => {
  const body = contentBody(fields, cats);
  assert.equal(body.body, '');
  assert.equal(body.genre, '');
});

test('authenticated store loads the nested profile and preserves own preferences in admin users', async () => {
  const { loadStore } = await import('../src/services/applicationStore.js');
  const { setSession } = await import('../src/services/httpClient.js');
  const oldFetch = globalThis.fetch;
  const admin = {
    id: 'admin-id',
    email: 'admin@example.test',
    displayName: 'Administrator',
    role: 'Admin',
  };
  const page = { items: [], total: 0, pageNumber: 1, pageSize: 100 };
  const responses = {
    '/api/categories': cats,
    '/api/content': page,
    '/api/events': page,
    '/api/assistant/faqs': [],
    '/api/content/filters': {},
    '/api/me': { user: admin, categoryIds: [cats[0].id] },
    '/api/me/bookmarks': page,
    '/api/me/submissions': page,
    '/api/me/activity': page,
    '/api/me/dashboard': {},
    '/api/me/feedback': page,
    '/api/admin/content': page,
    '/api/admin/users': { ...page, items: [admin], total: 1 },
    '/api/admin/feedback': page,
    '/api/admin/analytics': {},
  };
  globalThis.fetch = async (url, options) => {
    const path = new URL(url, 'https://example.test').pathname;
    assert.ok(path in responses, `Unexpected endpoint ${path}`);
    assert.equal(options.headers.Authorization, 'Bearer test-token');
    return new Response(JSON.stringify(responses[path]), { status: 200 });
  };
  setSession({ accessToken: 'test-token', expiresAt: new Date(Date.now() + 60000).toISOString() });
  try {
    const store = await loadStore();
    assert.equal(store.session, 'admin-id');
    assert.equal(store.users[0].role, 'admin');
    assert.deepEqual(store.users[0].favorites, ['Anime']);
  } finally {
    setSession(null);
    globalThis.fetch = oldFetch;
  }
});


const { featuredArticles, upcomingReleases, localDateTime, contentIdFromUrl, videoSource } = await import('../src/services/contentPresentation.js');

test('direct videos use native playback while supported providers use embed URLs', () => {
  assert.equal(videoSource('https://example.test/trailer.mp4?version=2').kind, 'file');
  assert.equal(videoSource('https://youtu.be/aqz-KE-bpKQ').url, 'https://www.youtube-nocookie.com/embed/aqz-KE-bpKQ');
  assert.equal(videoSource('https://example.test/watch').kind, 'link');
  assert.equal(videoSource('javascript:alert(1)'), null);
});
test('featured articles exclude unfeatured records and events', () => {
  const items = [{ id: 1, type: 'event', featured: true }, { id: 2, type: 'article', featured: false }, { id: 3, type: 'article', featured: true, category: 'Anime' }];
  assert.deepEqual(featuredArticles(items).map(x => x.id), [3]);
  assert.equal(featuredArticles(items, 'Gaming').length, 0);
});
test('upcoming releases exclude past dates and sort chronologically', () => {
  const items = [{ type: 'release', releaseDate: '2026-10-03T00:00Z' }, { type: 'release', releaseDate: '2026-09-01T00:00Z' }, { type: 'release', releaseDate: '2026-10-01T00:00Z' }];
  assert.deepEqual(upcomingReleases(items, Date.parse('2026-09-26')).map(x => x.releaseDate), ['2026-10-01T00:00Z','2026-10-03T00:00Z']);
});
test('event editor preserves an offset timestamp when submitted without edits', () => {
  const original = '2026-10-03T17:00:00+05:00';
  assert.equal(new Date(localDateTime(original)).toISOString(), new Date(original).toISOString());
});
test('canonical and legacy content links resolve to the same record', () => {
  const id = '11111111-1111-1111-1111-111111111111';
  assert.equal(contentIdFromUrl(new URL('https://example.test/content/' + id)), id);
  assert.equal(contentIdFromUrl(new URL('https://example.test/?content=' + id)), id);
});
