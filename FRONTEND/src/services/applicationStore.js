import { api, getSession } from './httpClient.js';
import { categories, emptyStore } from '../state/emptyStore.js';
import { contentItem, userItem } from './catalogAdapters.js';

export async function loadStore({
  page = 'Discover',
  adminTab = 'Content',
  workspacePage = 1,
  eventPage = 1,
  city = 'All cities',
  location = null,
  category = 'All fandoms',
} = {}) {
  const [cats, faqs, filters] = await Promise.all([
    api('/api/categories'),
    api('/api/assistant/faqs'),
    api('/api/content/filters'),
  ]);
  categories.splice(0, categories.length, ...cats.map((c) => c.name));
  const d = { ...emptyStore(), categories: cats, faqs, filters };
  const mapContent = (rows) => rows.map((c) => contentItem(c, cats));
  if (page === 'Discover') {
    const categoryId = cats.find((c) => c.name === category)?.id;
    const [featured, releases, video] = await Promise.all([
      api(
        '/api/content?Type=Article&Featured=true&pageSize=3' +
          (categoryId ? '&CategoryId=' + categoryId : '')
      ),
      api('/api/content?Type=Release&Upcoming=true&pageSize=3&Sort=upcoming'),
      api('/api/content?Type=Video&Featured=true&Sort=popular&pageSize=1').then((featuredVideo) =>
        featuredVideo.items.length
          ? featuredVideo
          : api('/api/content?Type=Video&Sort=popular&pageSize=1')
      ),
    ]);
    d.content = mapContent([...featured.items, ...releases.items, ...video.items]);
  }
  if (page === 'Events') {
    const query = new URLSearchParams({ page: eventPage, pageSize: 12 });
    if (city !== 'All cities') query.set('City', city);
    if (location) {
      query.set('Latitude', location.latitude);
      query.set('Longitude', location.longitude);
      query.set('RadiusKm', '100');
    }
    const events = await api('/api/events?' + query);
    d.events = mapContent(events.items);
    d.eventTotal = events.total;
  }
  if (!getSession()) return d;
  const me = userItem(await api('/api/me'), cats);
  d.users = [me];
  d.session = me.id;
  if (page === 'My dashboard') {
    const [dashboard, submissions, feedback] = await Promise.all([
      api('/api/me/dashboard'),
      api(`/api/me/submissions?page=${workspacePage}&pageSize=12`),
      api(`/api/me/feedback?page=${workspacePage}&pageSize=12`),
    ]);
    d.dashboard = dashboard;
    d.submissionTotal = submissions.total;
    d.myFeedback = feedback.items;
    d.workspaceTotal = Math.max(submissions.total, feedback.total);
    d.bookmarkTotal = dashboard.bookmarks?.total || 0;
    d.bookmarks = (dashboard.bookmarks?.items || []).map((b) => ({ ...b, userId: me.id }));
    d.activity = (dashboard.recentActivity || []).map((a) => ({
      ...a,
      title: a.action,
      date: a.createdAt,
    }));
    d.recommendations = mapContent(dashboard.recommendations || []);
    d.submissions = mapContent(submissions.items);
    d.content = [
      ...new Map(
        [
          ...d.submissions,
          ...d.recommendations,
          ...mapContent(d.bookmarks.filter((b) => b.content).map((b) => b.content)),
        ].map((c) => [c.id, c])
      ).values(),
    ];
  }
  if (page === 'Admin' && me.role === 'admin') {
    d.analytics = await api('/api/admin/analytics');
    const routes = {
      Content: '/api/admin/content',
      Submissions: '/api/admin/content?status=Pending',
      Users: '/api/admin/users',
      Feedback: '/api/admin/feedback',
    };
    if (routes[adminTab]) {
      const path = routes[adminTab];
      const result = await api(
        `${path}${path.includes('?') ? '&' : '?'}page=${workspacePage}&pageSize=20`
      );
      d.workspaceTotal = result.total;
      if (adminTab === 'Content' || adminTab === 'Submissions')
        d.content = mapContent(result.items);
      if (adminTab === 'Users') {
        d.adminUsers = result.items.map((u) => (u.id === me.id ? me : userItem(u, cats)));
        d.users = [me];
      }
      if (adminTab === 'Feedback')
        d.feedback = result.items.map((f) => ({
          ...f,
          type: f.type.toLowerCase(),
          status: f.status.toLowerCase(),
        }));
    }
  }
  return d;
}
