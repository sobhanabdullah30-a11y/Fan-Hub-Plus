import { contentIdFromUrl } from '../services/contentPresentation.js';
import { AccessOverview } from '../components/common/AccessOverview.jsx';
import { SiteFooter } from '../components/layout/SiteFooter.jsx';
import { Topbar } from '../components/layout/Topbar.jsx';
import { Sidebar } from '../components/layout/Sidebar.jsx';
import { Empty } from '../components/common/EmptyState.jsx';
import { LoadingState } from '../components/common/LoadingState.jsx';
import { Admin } from '../pages/AdminPage.jsx';
import { Profile } from '../pages/ProfilePage.jsx';
import { Dashboard } from '../pages/DashboardPage.jsx';
import { Events } from '../pages/EventsPage.jsx';
import { Catalog } from '../pages/CatalogPage.jsx';
import React, { useState, useEffect } from 'react';
import { emptyStore } from '../state/emptyStore.js';
import { loadStore } from '../services/applicationStore.js';
import { usePremiumMotion } from '../hooks/usePremiumMotion.js';
import { getSession, setSession, api, send } from '../services/httpClient.js';
import { contentItem } from '../services/catalogAdapters.js';
import { publicPages, pageLink } from './routes.js';
import { Check, X, MessageSquare, Send } from 'lucide-react';
import { ContentCard as Card } from '../features/catalog/ContentCard.jsx';

import { DiscoveryHome } from '../pages/HomePage.jsx';
import { AboutPage } from '../pages/information/AboutPage.jsx';
import { ContactSection } from '../features/feedback/ContactSection.jsx';
import { HelpPage } from '../pages/information/HelpPage.jsx';
import { ResourcesPage } from '../pages/information/ResourcesPage.jsx';
import { SiteMap } from '../pages/information/SiteMap.jsx';
import { Modal } from '../components/dialogs/Modal.jsx';

export function App() {
  const [accent, setAccent] = useState(() => localStorage.getItem('fh-accent') || 'lilac');
  useEffect(() => {
    document.documentElement.dataset.accent = accent;
    localStorage.setItem('fh-accent', accent);
  }, [accent]);
  const [motion, setMotion] = useState(
    () =>
      localStorage.getItem('fh-motion') !== 'off' &&
      !matchMedia('(prefers-reduced-motion: reduce)').matches
  );
  const [db, setDb] = useState(emptyStore),
    [page, setPage] = useState('Discover'),
    [category, setCategory] = useState('All fandoms'),
    [query, setQuery] = useState(''),
    [type, setType] = useState('All types'),
    [genre, setGenre] = useState('All genres'),
    [fandom, setFandom] = useState('All universes'),
    [year, setYear] = useState('All years'),
    [sort, setSort] = useState('Popular'),
    [popularity, setPopularity] = useState('Any popularity'),
    [filters, setFilters] = useState(false),
    [modal, setModal] = useState(null),
    [selected, setSelected] = useState(null),
    [toast, setToast] = useState(''),
    [mobile, setMobile] = useState(false),
    [theme, setTheme] = useState(() => localStorage.getItem('fh-theme') || 'dark'),
    [large, setLarge] = useState(() => localStorage.getItem('fh-large') === 'true'),
    [city, setCity] = useState('All cities'),
    [location, setLocation] = useState(null),
    [adminTab, setAdminTab] = useState('Content'),
    [chat, setChat] = useState(false),
    [messages, setMessages] = useState([
      {
        role: 'assistant',
        text: 'Hey, explorer! I’m your Fan Guide. Ask about fandoms, bookmarks, events, or sharing your own story.',
      },
    ]);
  const conversation = React.useRef(null);
  const openedLink = React.useRef(null);
  const [remoteResults, setRemoteResults] = useState([]),
    [catalogBusy, setCatalogBusy] = useState(false),
    [catalogPage, setCatalogPage] = useState(1);
  const catalogCache = React.useRef(new Map());
  const [catalogTotal, setCatalogTotal] = useState(0);
  const [workspacePage, setWorkspacePage] = useState(1);
  const [eventPage, setEventPage] = useState(1);
  const loadVersion = React.useRef(0);
  const preserveDiscoverContent = React.useRef(false);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState('');
  const [busy, setBusy] = useState(false);
  const mutationLock = React.useRef(false);
  async function reload() {
    const version = ++loadVersion.current;
    catalogCache.current.clear();
    const next = await loadStore({
      page,
      adminTab,
      workspacePage,
      eventPage,
      city,
      location,
      category,
    });
    if (version === loadVersion.current) setDb((prev) => ({ ...next, ratings: prev.ratings }));
    return next;
  }
  async function refresh({ keepContent = false } = {}) {
    const expectedVersion = loadVersion.current + 1;
    if (!keepContent) setLoading(true);
    setApiError('');
    try {
      await reload();
    } catch (e) {
      setApiError(e.message);
    } finally {
      if (!keepContent && expectedVersion === loadVersion.current) setLoading(false);
    }
  }
  useEffect(() => {
    const expired = () => {
      setDb(emptyStore());
      setToast('Your session expired. Please sign in again.');
      setModal('login');
      refresh();
    };
    window.addEventListener('fh-auth-expired', expired);
    return () => window.removeEventListener('fh-auth-expired', expired);
  }, []);
  useEffect(() => {
    const keepContent = preserveDiscoverContent.current && page === 'Discover';
    preserveDiscoverContent.current = false;
    refresh({ keepContent });
  }, [
    page,
    adminTab,
    workspacePage,
    eventPage,
    city,
    location,
    page === 'Discover' ? category : '',
  ]);
  function selectHomeCategory(nextCategory) {
    if (nextCategory === category) return;
    preserveDiscoverContent.current = true;
    setCategory(nextCategory);
  }
  useEffect(() => {
    setWorkspacePage(1);
  }, [page, adminTab]);
  useEffect(() => {
    setEventPage(1);
  }, [city, location]);
  async function perform(action, success, after) {
    if (mutationLock.current) return false;
    mutationLock.current = true;
    setBusy(true);
    setApiError('');
    try {
      await action();
      await reload();
      if (success) setToast(success);
      after?.();
      return true;
    } catch (e) {
      setApiError(e.message);
      return false;
    } finally {
      mutationLock.current = false;
      setBusy(false);
    }
  }
  usePremiumMotion(page + ':' + db.content.length + ':' + db.categories.length, motion);
  useEffect(() => {
    localStorage.setItem('fh-motion', motion ? 'on' : 'off');
  }, [motion]);
  useEffect(() => {
    const session = getSession();
    if (!session) return;
    const timer = setTimeout(
      () => {
        setSession(null);
        window.dispatchEvent(new Event('fh-auth-expired'));
      },
      Math.max(0, Date.parse(session.expiresAt) - Date.now())
    );
    return () => clearTimeout(timer);
  }, [db.session]);
  const user = db.users.find((u) => u.id === db.session),
    published = db.content.filter((c) => c.status === 'published'),
    saved = db.bookmarks.filter((b) => b.userId === user?.id);
  useEffect(() => {
    if (loading) return;
    const params = new URLSearchParams(window.location.search);
    const id = contentIdFromUrl(new URL(window.location.href));
    if (id && openedLink.current !== id) {
      openedLink.current = id;
      api('/api/content/' + encodeURIComponent(id))
        .then((c) => open(contentItem(c, db.categories)))
        .catch((e) => {
          openedLink.current = null;
          setApiError(e.message);
        });
    }
    if (params.get('token')) {
      const verify =
        window.location.pathname === '/verify-email' || params.get('action') === 'verify';
      setModal(verify ? 'verify' : 'reset');
    }
  }, [loading]);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('fh-theme', theme);
  }, [theme]);
  useEffect(() => {
    document.documentElement.style.fontSize = large ? '18px' : '16px';
    localStorage.setItem('fh-large', large);
  }, [large]);
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(''), 3500);
      return () => clearTimeout(t);
    }
  }, [toast]);
  useEffect(() => {
    function syncRoute() {
      const [encoded, qs] = window.location.hash.replace(/^#\//, '').split('?');
      let destination;
      try {
        destination = decodeURIComponent(encoded || 'Discover');
      } catch {
        return;
      }
      if (
        ![...publicPages, 'My dashboard', 'My collection', 'Settings', 'Admin'].includes(
          destination
        )
      )
        return;
      setPage(destination);
      const requested = new URLSearchParams(qs).get('category');
      setCategory(requested || 'All fandoms');
      setQuery(new URLSearchParams(qs).get('q') || '');
      setType('All types');
      setFandom('All universes');
      setGenre('All genres');
      setYear('All years');
      setPopularity('Any popularity');
      setFilters(destination === 'Explore');
      setMobile(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    syncRoute();
    window.addEventListener('hashchange', syncRoute);
    return () => window.removeEventListener('hashchange', syncRoute);
  }, []);
  useEffect(() => {
    if (user?.theme)
      setTheme(
        user.theme === 'system'
          ? matchMedia('(prefers-color-scheme: dark)').matches
            ? 'dark'
            : 'light'
          : user.theme
      );
    if (user?.fontSize) setLarge(user.fontSize === 'large');
  }, [user?.id]);
  async function saveContact(fields) {
    if (!user) {
      setModal('login');
      throw new Error('Sign in to send your message.');
    }
    await send('/api/me/feedback', {
      type: fields.type === 'bug' ? 'Bug' : fields.type === 'suggestion' ? 'Suggestion' : 'Query',
      message: [
        fields.name && 'From: ' + fields.name,
        fields.email && 'Email: ' + fields.email,
        fields.message,
      ]
        .filter(Boolean)
        .join('\n'),
    });
  }
  function navigate(p, c = 'All fandoms') {
    window.location.hash = pageLink(p, c === 'All fandoms' ? undefined : c);
    setFandom('All universes');
    setPage(p);
    setCategory(c);
    setMobile(false);
    setQuery('');
    setType('All types');
    setGenre('All genres');
    setYear('All years');
    setPopularity('Any popularity');
    setFilters(p === 'Explore');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  function searchCatalog(value) {
    const url = pageLink('Explore') + (value ? '?q=' + encodeURIComponent(value) : '');
    if (page === 'Explore') window.history.replaceState(null, '', url);
    else window.history.pushState(null, '', url);
    setPage('Explore');
    setCategory('All fandoms');
    setQuery(value);
    setFilters(true);
    setMobile(false);
  }
  function requireUser(fn) {
    if (!user) setModal('login');
    else fn();
  }
  async function signOut() {
    await perform(async () => {
      try {
        await send('/api/auth/logout');
      } finally {
        setSession(null);
        setDb(emptyStore());
      }
    }, 'Signed out.');
    setModal(null);
    setSelected(null);
    navigate('Discover');
    setToast('Signed out.');
  }
  function bookmark(c) {
    requireUser(() =>
      perform(
        () =>
          saved.some((b) => b.contentId === c.id)
            ? api('/api/me/bookmarks/' + c.id, { method: 'DELETE' })
            : send('/api/me/bookmarks/' + c.id, { note: '' }, 'PUT'),
        'Collection updated.'
      )
    );
  }
  function rateMedia(c, stars) {
    requireUser(() =>
      perform(
        () => send('/api/content/' + c.id + '/rating', { stars, comment: '' }, 'PUT'),
        'Rating saved.',
        () =>
          setDb((current) => ({
            ...current,
            ratings: [
              ...current.ratings.filter(
                (rating) => !(rating.userId === user.id && rating.contentId === c.id)
              ),
              { userId: user.id, contentId: c.id, value: stars },
            ],
          }))
      )
    );
  }
  function removeMediaRating(c) {
    requireUser(() =>
      perform(
        () => api('/api/content/' + c.id + '/rating', { method: 'DELETE' }),
        'Rating removed.',
        () =>
          setDb((current) => ({
            ...current,
            ratings: current.ratings.filter(
              (rating) => !(rating.userId === user.id && rating.contentId === c.id)
            ),
          }))
      )
    );
  }
  function openMediaFeedback(c) {
    requireUser(() => {
      setSelected({ ...c, feedbackContext: true });
      setModal('feedback');
    });
  }
  const mediaActions = {
    user,
    ratings: db.ratings,
    rate: rateMedia,
    removeRating: removeMediaRating,
    feedback: openMediaFeedback,
  };
  async function open(c) {
    setSelected(c);
    setModal('detail');
    try {
      const [detail, ratings] = await Promise.all([
        api('/api/content/' + c.id),
        api('/api/content/' + c.id + '/ratings'),
      ]);
      setSelected(contentItem(detail, db.categories));
      setDb((d) => ({
        ...d,
        ratings: [
          ...d.ratings.filter((r) => r.contentId !== c.id),
          ...(ratings.items || []).map((r) => ({ ...r, contentId: c.id, value: r.stars })),
        ],
      }));
      await send('/api/content/' + c.id + '/views');
    } catch (e) {
      setApiError(e.message);
    }
  }
  useEffect(() => {
    setCatalogPage(1);
  }, [page, query, category, type, genre, fandom, year, sort, popularity]);
  useEffect(() => {
    if (
      !['Explore', 'Media room', 'Characters', 'Showcase', 'My collection'].includes(page) ||
      loading
    )
      return;
    if (page === 'My collection' && !user) return;
    const controller = new AbortController();
    const params = new URLSearchParams({
      Sort: sort === 'Latest' ? 'latest' : sort === 'A–Z' ? 'alphabetical' : 'popular',
      page: catalogPage,
      pageSize: 12,
    });
    if (query) params.set('Search', query);
    const cat = db.categories.find((c) => c.name === category);
    if (cat) params.set('CategoryId', cat.id);
    if (fandom !== 'All universes') params.set('Fandom', fandom);
    if (genre !== 'All genres') params.set('Genre', genre);
    if (year !== 'All years') params.set('ReleaseYear', year);
    if (type !== 'All types') params.set('Type', type[0].toUpperCase() + type.slice(1));
    if (popularity !== 'Any popularity') params.set('MinPopularity', '70');
    if (page === 'Media room')
      ['Video', 'Audio', 'Image'].forEach((value) => params.append('Types', value));
    if (page === 'Characters') params.append('Types', 'Character');
    if (page === 'Showcase')
      ['Merchandise', 'Release'].forEach((value) => params.append('Types', value));

    const collection = page === 'My collection';
    const endpoint = collection ? '/api/me/bookmarks?' : '/api/content?';
    const cacheKey = `${user?.id || 'visitor'}:${endpoint}${params}`;
    const cached = catalogCache.current.get(cacheKey);
    if (cached) {
      setRemoteResults(cached.items);
      setCatalogTotal(cached.total);
      if (collection) setDb((current) => ({ ...current, bookmarks: cached.bookmarks }));
      setCatalogBusy(false);
      return () => controller.abort();
    }

    // Never leave the prior page's records visible while this request resolves.
    setRemoteResults([]);
    setCatalogTotal(0);
    setCatalogBusy(true);
    async function loadCatalog() {
      try {
        const result = await api(endpoint + params, {
          signal: controller.signal,
        });
        if (controller.signal.aborted) return;
        const items = result.items.map((row) =>
          contentItem(collection ? row.content : row, db.categories)
        );
        const bookmarks = collection
          ? result.items.map((bookmark) => ({ ...bookmark, userId: user.id }))
          : null;
        catalogCache.current.set(cacheKey, { items, total: result.total, bookmarks });
        setRemoteResults(items);
        setCatalogTotal(result.total);
        if (bookmarks) setDb((current) => ({ ...current, bookmarks }));
      } catch (e) {
        if (!controller.signal.aborted) {
          setRemoteResults([]);
          setCatalogTotal(0);
          setApiError(e.message);
        }
      } finally {
        if (!controller.signal.aborted) setCatalogBusy(false);
      }
    }
    void loadCatalog();
    return () => {
      controller.abort();
    };
  }, [
    page,
    query,
    category,
    type,
    genre,
    fandom,
    year,
    sort,
    popularity,
    loading,
    db.categories,
    catalogPage,
    user?.id,
  ]);
  const results = remoteResults;

  // Fetch bookmark state only for the content currently on screen.
  useEffect(() => {
    if (!user || loading || page === 'My collection') return;
    const ids = [
      ...new Set([...published, ...results, ...(selected ? [selected] : [])].map((c) => c.id)),
    ].slice(0, 100);
    if (!ids.length) return;
    let active = true;
    const params = new URLSearchParams({ pageSize: 100 });
    ids.forEach((id) => params.append('ContentIds', id));
    api('/api/me/bookmarks?' + params)
      .then((result) => {
        if (active)
          setDb((d) => ({ ...d, bookmarks: result.items.map((b) => ({ ...b, userId: user.id })) }));
      })
      .catch((e) => {
        if (active) setApiError(e.message);
      });
    return () => {
      active = false;
    };
  }, [user?.id, loading, db.content, remoteResults, selected?.id, page]);

  useEffect(() => {
    if (!chat || !user) return;
    let active = true;
    api('/api/assistant/messages?pageSize=20')
      .then((result) => result.items)
      .then((rows) => {
        if (!active) return;
        const latest = rows[0]?.conversationId;
        conversation.current = latest || null;
        setMessages(
          rows
            .filter((r) => r.conversationId === latest)
            .reverse()
            .flatMap((r) => [
              { role: 'user', text: r.message },
              { role: 'assistant', text: r.response },
            ])
        );
      })
      .catch((e) => {
        if (active) setApiError(e.message);
      });
    return () => {
      active = false;
    };
  }, [chat, user?.id]);

  return (
    <div className="app universe-edition" data-motion={motion ? 'on' : 'off'}>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      {mobile && (
        <button
          className="mobile-backdrop"
          aria-label="Close navigation"
          onClick={() => setMobile(false)}
        />
      )}
      <Sidebar
        mobile={mobile}
        navigate={navigate}
        onSignOut={signOut}
        page={page}
        requireUser={requireUser}
        saved={saved}
        setModal={setModal}
        setSelected={setSelected}
        user={user}
      />
      <div className="main-shell">
        <Topbar
          category={category}
          motion={motion}
          navigate={navigate}
          onSignOut={signOut}
          page={page}
          query={query}
          searchCatalog={searchCatalog}
          setMobile={setMobile}
          setModal={setModal}
          setMotion={setMotion}
          setTheme={setTheme}
          theme={theme}
          user={user}
        />
        <main id="main">
          <div aria-live="polite">
            {loading && <p className="notice">Loading your universe…</p>}
            {busy && <p className="notice">Saving changes…</p>}
            {apiError && (
              <div className="notice" role="alert">
                {apiError}{' '}
                <button className="secondary" onClick={refresh}>
                  Retry connection
                </button>
              </div>
            )}
          </div>
          {!loading && ['My dashboard', 'Admin'].includes(page) && user && (
            <AccessOverview user={user} />
          )}
          {loading ? (
            <LoadingState label="Loading your universe…" />
          ) : page === 'Admin' && user?.role !== 'admin' ? (
            <Empty
              title={user ? 'Administrator access required' : 'Sign in to continue'}
              text={
                user
                  ? 'Your member account does not have access to management tools.'
                  : 'This workspace is restricted to administrators.'
              }
              action={() => (user ? navigate('My dashboard') : setModal('login'))}
              actionLabel={user ? 'Open my dashboard' : 'Sign in'}
            />
          ) : ['My dashboard', 'My collection', 'Settings'].includes(page) && !user ? (
            <Empty
              actionLabel="Sign in"
              title="Member access required"
              text="Sign in to view your private dashboard, bookmarks and settings."
              action={() => setModal('login')}
            />
          ) : page === 'Discover' ? (
            <DiscoveryHome
              published={published}
              categories={db.categories.map((item) => item.name)}
              category={category}
              setCategory={selectHomeCategory}
              navigate={navigate}
              open={open}
              user={user}
              requireUser={requireUser}
              setSelected={setSelected}
              setModal={setModal}
              saved={saved}
              bookmark={bookmark}
              Card={Card}
              accent={accent}
              setAccent={setAccent}
              motion={motion}
              setMotion={setMotion}
              onContact={saveContact}
              mediaActions={mediaActions}
            />
          ) : ['Explore', 'Media room', 'Characters', 'Showcase', 'My collection'].includes(
              page
            ) ? (
            <Catalog
              bookmark={bookmark}
              catalogBusy={catalogBusy}
              catalogPage={catalogPage}
              catalogTotal={catalogTotal}
              category={category}
              db={db}
              fandom={fandom}
              filters={filters}
              genre={genre}
              navigate={navigate}
              open={open}
              page={page}
              popularity={popularity}
              query={query}
              requireUser={requireUser}
              results={results}
              saved={saved}
              setCatalogPage={setCatalogPage}
              setCategory={setCategory}
              setFandom={setFandom}
              setFilters={setFilters}
              setGenre={setGenre}
              setModal={setModal}
              setPopularity={setPopularity}
              setQuery={setQuery}
              setSelected={setSelected}
              setSort={setSort}
              setType={setType}
              setYear={setYear}
              mediaActions={mediaActions}
              sort={sort}
              type={type}
              year={year}
            />
          ) : page === 'About' ? (
            <AboutPage startTour={() => setModal('tour')} register={() => setModal('register')} />
          ) : page === 'Contact' ? (
            <ContactSection standalone user={user} onContact={saveContact} />
          ) : page === 'Help' ? (
            <HelpPage
              faqs={db.faqs}
              startTour={() => setModal('tour')}
              feedback={() => setModal('feedback')}
            />
          ) : page === 'Resources' ? (
            <ResourcesPage />
          ) : page === 'Sitemap' ? (
            <>
              <div className="page-heading">
                <div>
                  <h1>Platform sitemap</h1>
                  <p>Understand the structure of Fan Hub Plus and find every destination.</p>
                </div>
              </div>
              <SiteMap
                user={user}
                signIn={() => setModal('login')}
                submit={() =>
                  requireUser(() => {
                    setSelected(null);
                    setModal('submit');
                  })
                }
                feedback={() => setModal('feedback')}
              />
            </>
          ) : page === 'Events' ? (
            <Events
              eventPage={eventPage}
              setEventPage={setEventPage}
              city={city}
              db={db}
              location={location}
              setApiError={setApiError}
              setCity={setCity}
              setLocation={setLocation}
              setToast={setToast}
            />
          ) : page === 'My dashboard' && user ? (
            <Dashboard
              workspacePage={workspacePage}
              setWorkspacePage={setWorkspacePage}
              bookmark={bookmark}
              db={db}
              navigate={navigate}
              open={open}
              published={published}
              saved={saved}
              setModal={setModal}
              setSelected={setSelected}
              user={user}
              mediaActions={mediaActions}
            />
          ) : page === 'Settings' && user ? (
            <Profile
              db={db}
              large={large}
              perform={perform}
              setLarge={setLarge}
              setModal={setModal}
              setTheme={setTheme}
              theme={theme}
              user={user}
            />
          ) : page === 'Admin' && user?.role === 'admin' ? (
            <Admin
              workspacePage={workspacePage}
              setWorkspacePage={setWorkspacePage}
              adminTab={adminTab}
              busy={busy}
              db={db}
              perform={perform}
              published={published}
              setAdminTab={setAdminTab}
              setModal={setModal}
              setSelected={setSelected}
              user={user}
            />
          ) : (
            <Empty
              title="Your universe is waiting"
              text="Sign in to personalize your experience."
              action={() => setModal('login')}
            />
          )}
          <SiteFooter setModal={setModal} />
        </main>
      </div>
      <button className="chat-launcher" aria-label="Open fan guide" onClick={() => setChat(!chat)}>
        {chat ? <X size={20} /> : <MessageSquare size={20} />}
        <span>Fan Guide</span>
        <span className="live-dot" />
      </button>
      {chat && (
        <section className="chat-panel">
          <div className="chat-header">
            <MessageSquare size={20} />
            <div>
              <strong>Your Fan Guide</strong>
              <small>Connected Fan Guide</small>
            </div>
            <button className="icon-button" aria-label="Close guide" onClick={() => setChat(false)}>
              <X size={16} />
            </button>
          </div>
          <button
            className="text-button"
            disabled={busy || !conversation.current}
            onClick={() =>
              perform(
                () =>
                  api('/api/assistant/conversations/' + conversation.current, { method: 'DELETE' }),
                'Conversation cleared.',
                () => {
                  conversation.current = null;
                  setMessages([]);
                }
              )
            }
          >
            Clear conversation
          </button>
          <div className="chat-messages">
            {messages.map((m, i) => (
              <div key={i} className={`message ${m.role}`}>
                {m.text}
              </div>
            ))}
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const input = e.currentTarget.elements.message;
              const q = input.value.trim();
              if (!q) return;
              if (!user) {
                setModal('login');
                return;
              }
              if (mutationLock.current) return;
              mutationLock.current = true;
              setBusy(true);
              send('/api/assistant/messages', { message: q, conversationId: conversation.current })
                .then((result) => {
                  conversation.current = result.conversationId;
                  setMessages((m) => [
                    ...m,
                    { role: 'user', text: q },
                    { role: 'assistant', text: result.response },
                  ]);
                })
                .catch((e) => setApiError(e.message))
                .finally(() => {
                  mutationLock.current = false;
                  setBusy(false);
                });
              input.value = '';
            }}
          >
            <input
              name="message"
              aria-label="Message the fan guide"
              placeholder="Where should I start?"
              maxLength="500"
            />
            <button className="icon-button" aria-label="Send message">
              <Send size={17} />
            </button>
          </form>
        </section>
      )}
      {toast && (
        <div className="toast" role="status">
          <Check size={17} />
          {toast}
        </div>
      )}
      {modal && (
        <Modal
          modal={modal}
          close={() => setModal(null)}
          user={user}
          selected={selected}
          db={db}
          perform={perform}
          reload={reload}
          busy={busy}
          apiError={apiError}
          open={open}
          setModal={setModal}
          setSelected={setSelected}
          setToast={setToast}
          navigate={navigate}
          saved={saved}
          bookmark={bookmark}
          requireUser={requireUser}
        />
      )}
    </div>
  );
}
