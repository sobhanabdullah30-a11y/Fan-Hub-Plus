import { Pagination } from '../components/common/Pagination.jsx';
import {
  Edit3,
  Bookmark,
  Heart,
  FileText,
  ArrowRight,
  Eye,
  Plus,
  BadgeCheck,
  ShieldCheck,
  Activity,
  KeyRound,
  SlidersHorizontal,
  ExternalLink,
} from 'lucide-react';
import { ContentCard as Card } from '../features/catalog/ContentCard.jsx';
import { api } from '../services/httpClient.js';
import { contentItem } from '../services/catalogAdapters.js';
import React from 'react';

export function Dashboard({
  workspacePage,
  setWorkspacePage,
  bookmark,
  db,
  navigate,
  open,
  published,
  saved,
  setModal,
  setSelected,
  user,
  mediaActions,
}) {
  const [overviewTab, setOverviewTab] = React.useState('profile');
  const favoriteFandoms = db.dashboard?.favoriteFandoms || user.favoriteNames || [];
  const savedItems = published.filter((content) =>
    saved.some((bookmark) => bookmark.contentId === content.id)
  );
  const memberActivity = (db.activity || []).filter(
    (item) => !item.userId || item.userId === user.id
  );
  const overviewTabs = [
    ['profile', 'Profile'],
    ['saved', 'Saved discoveries'],
    ['activity', 'Recent activity'],
    ['interests', 'Interests'],
  ];
  const feedbackReference = (message = '') => {
    const match = message.match(/^Feedback for [“"](.+?)[”"]:\s*/);
    return match
      ? { title: match[1], message: message.slice(match[0].length) }
      : { title: null, message };
  };
  const openFeedbackDiscovery = async (feedback) => {
    const { title } = feedbackReference(feedback.message);
    if (!title) return;
    const result = await api(`/api/content?Search=${encodeURIComponent(title)}&pageSize=12`);
    const match =
      (result.items || []).find((content) => content.title === title) || result.items?.[0];
    if (match) open(contentItem(match, db.categories));
  };

  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow purple">YOUR PERSONAL UNIVERSE</div>
          <h1>Welcome back, {user.name.split(' ')[0]}</h1>
          <p>A little inspiration. A new discovery. A place to belong.</p>
        </div>
        <button className="secondary" onClick={() => navigate('Settings')}>
          Edit profile <Edit3 size={15} />
        </button>
      </div>
      <div className="stats-grid">
        {[
          ['Saved discoveries', db.bookmarkTotal || 0, Bookmark],
          ['Favorite fandoms', user.favorites.length, Heart],
          ['Your submissions', db.submissionTotal || 0, FileText],
        ].map(([label, n, Icon]) => (
          <div className="stat" key={label}>
            <Icon size={21} />
            <strong>{n}</strong>
            <span>{label}</span>
          </div>
        ))}
      </div>
      <div className="favorite-tags" aria-label="Your favorite fandoms">
        {[...user.favorites, ...(user.favoriteNames || [])].map((name, i) => (
          <span className="badge" key={`${name}-${i}`}>
            {name}
          </span>
        ))}
      </div>
      <div className="section-heading">
        <h2>Saved discoveries</h2>
        <button className="text-button" onClick={() => navigate('My collection')}>
          View collection <ArrowRight size={14} />
        </button>
      </div>
      {saved.length ? (
        <div className="card-grid">
          {published
            .filter((c) => saved.some((b) => b.contentId === c.id))
            .slice(0, 3)
            .map((c) => (
              <Card
                key={c.id}
                item={c}
                saved={saved}
                bookmark={bookmark}
                open={open}
                mediaActions={mediaActions}
              />
            ))}
        </div>
      ) : (
        <p className="result-count">Save a discovery with its bookmark icon to see it here.</p>
      )}
      <div className="section-heading">
        <h2>Made for your universe</h2>
        <button className="text-button" onClick={() => navigate('Settings')}>
          Manage interests <ArrowRight size={14} />
        </button>
      </div>
      <div className="card-grid">
        {(db.recommendations || []).slice(0, 3).map((c) => (
          <Card
            key={c.id}
            item={c}
            saved={saved}
            bookmark={bookmark}
            open={open}
            mediaActions={mediaActions}
          />
        ))}
      </div>
      <section
        className="panel dashboard-account-overview"
        aria-labelledby="account-overview-heading"
      >
        <div className="overview-heading">
          <div>
            <span className="eyebrow purple">YOUR ACCOUNT</span>
            <h2 id="account-overview-heading">Account overview</h2>
            <p>Everything that makes this universe yours.</p>
          </div>
          <button className="secondary" onClick={() => navigate('Settings')}>
            Manage profile <Edit3 size={15} />
          </button>
        </div>
        <div className="overview-profile">
          <span className="overview-avatar" aria-hidden="true">
            {user.name?.[0] || 'F'}
          </span>
          <div>
            <strong>{user.name}</strong>
            <span>{user.email}</span>
          </div>
          <span className="overview-role">
            <ShieldCheck size={15} /> {user.role === 'admin' ? 'Administrator' : 'Member'}
          </span>
        </div>
        <div className="overview-stats">
          <div>
            <BadgeCheck size={18} />
            <span>Email status</span>
            <strong>{user.emailVerified ? 'Verified' : 'Verification pending'}</strong>
          </div>
          <div>
            <Bookmark size={18} />
            <span>Saved discoveries</span>
            <strong>{db.bookmarkTotal || 0}</strong>
          </div>
          <div>
            <Activity size={18} />
            <span>Recent activity</span>
            <strong>{memberActivity.length} items</strong>
          </div>
        </div>
        <div className="overview-tabs" role="tablist" aria-label="Account overview sections">
          {overviewTabs.map(([id, label]) => (
            <button
              type="button"
              key={id}
              role="tab"
              aria-selected={overviewTab === id}
              className={overviewTab === id ? 'active' : ''}
              onClick={() => setOverviewTab(id)}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="overview-tab-panel" role="tabpanel">
          {overviewTab === 'profile' && (
            <div className="overview-action-grid">
              <div>
                <span className="overview-label">Account details</span>
                <strong>{user.name}</strong>
                <p>{user.email}</p>
                <span className="badge">
                  {user.emailVerified ? 'Email verified' : 'Email verification pending'}
                </span>
              </div>
              <div className="overview-panel-actions">
                <button className="secondary" onClick={() => navigate('Settings')}>
                  <Edit3 size={15} /> Edit profile
                </button>
                <button className="secondary" onClick={() => setModal('password')}>
                  <KeyRound size={15} /> Change password
                </button>
              </div>
            </div>
          )}
          {overviewTab === 'saved' && (
            <div className="overview-list-panel">
              {savedItems.length ? (
                <>
                  <div className="overview-list">
                    {savedItems.slice(0, 4).map((content) => (
                      <button type="button" key={content.id} onClick={() => open(content)}>
                        <span>
                          <strong>{content.title}</strong>
                          <small>
                            {content.category} · {content.type}
                          </small>
                        </span>
                        <ExternalLink size={15} />
                      </button>
                    ))}
                  </div>
                  <button className="text-button" onClick={() => navigate('My collection')}>
                    View all saved discoveries <ArrowRight size={14} />
                  </button>
                </>
              ) : (
                <div className="overview-empty-state">
                  <Bookmark size={18} />
                  <span>Nothing saved yet. Bookmark any discovery to build your collection.</span>
                  <button className="text-button" onClick={() => navigate('Explore')}>
                    Explore discoveries <ArrowRight size={14} />
                  </button>
                </div>
              )}
            </div>
          )}
          {overviewTab === 'activity' && (
            <div className="overview-list-panel">
              {memberActivity.length ? (
                <div className="overview-list">
                  {memberActivity.slice(0, 5).map((item, index) => (
                    <div key={`${item.date}-${index}`}>
                      <span>
                        <strong>{item.title}</strong>
                        <small>{new Date(item.date).toLocaleDateString()}</small>
                      </span>
                      <Eye size={15} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="overview-empty-state">
                  <Activity size={18} />
                  <span>Your browsing activity will appear here.</span>
                </div>
              )}
            </div>
          )}
          {overviewTab === 'interests' && (
            <div className="overview-action-grid">
              <div>
                <span className="overview-label">Favorite fandoms</span>
                <div className="overview-interest-list">
                  {favoriteFandoms.length ? (
                    favoriteFandoms.map((name) => (
                      <span className="badge" key={name}>
                        {name}
                      </span>
                    ))
                  ) : (
                    <p>Choose fandoms to personalize your recommendations.</p>
                  )}
                </div>
              </div>
              <div className="overview-panel-actions">
                <button className="secondary" onClick={() => navigate('Settings')}>
                  <SlidersHorizontal size={15} /> Manage interests
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
      <section className="panel dashboard-feedback">
        <div className="feedback-heading">
          <div>
            <span className="eyebrow purple">YOUR CONVERSATION</span>
            <h2>Your feedback</h2>
            <p>Track each message and revisit the discovery it relates to.</p>
          </div>
          <span className="feedback-total">{(db.myFeedback || []).length} total</span>
        </div>
        <div className="member-feedback-list">
          {(db.myFeedback || []).map((feedback) => {
            const reference = feedbackReference(feedback.message);
            return (
              <article className="member-feedback-row" key={feedback.id}>
                <div className="member-feedback-meta">
                  <span
                    className={`feedback-status-label status-${String(feedback.status).toLowerCase()}`}
                  >
                    {feedback.status}
                  </span>
                  <span className="badge">{feedback.type}</span>
                </div>
                <div className="member-feedback-copy">
                  {reference.title && (
                    <span className="feedback-content-title">About: {reference.title}</span>
                  )}
                  <p>{reference.message}</p>
                  {feedback.adminReply && (
                    <div className="member-feedback-reply">
                      <strong>Admin reply</strong>
                      <p>{feedback.adminReply}</p>
                    </div>
                  )}
                </div>
                {reference.title && (
                  <button
                    className="secondary feedback-open"
                    onClick={() => openFeedbackDiscovery(feedback)}
                  >
                    Open discovery <ExternalLink size={15} />
                  </button>
                )}
              </article>
            );
          })}
        </div>
        {!db.myFeedback?.length && (
          <p className="feedback-empty">
            No feedback sent yet. Open a discovery card and select Feedback to start a conversation.
          </p>
        )}
      </section>
      <Pagination
        page={workspacePage}
        pageSize={12}
        total={db.workspaceTotal}
        onChange={setWorkspacePage}
        label="Submissions and feedback"
      />
      <div className="dashboard-columns">
        <section className="panel">
          <h2>Recent activity</h2>
          {db.activity
            .filter((a) => a.userId === user.id)
            .slice(0, 5)
            .map((a, i) => (
              <div className="activity" key={i}>
                <Eye size={16} />
                <span>
                  {a.title}
                  <small>{new Date(a.date).toLocaleDateString()}</small>
                </span>
              </div>
            ))}
          {!db.activity.some((a) => a.userId === user.id) && (
            <p>Your next discovery will appear here.</p>
          )}
        </section>
        <section className="panel member-submissions">
          <h2>Your submissions</h2>
          {(db.submissions || []).map((c) => (
            <div className="activity submission-row" key={c.id}>
              <FileText size={16} />
              <span className="submission-title">{c.title}</span>
              <div className="submission-status-actions">
                <span className="badge">{c.status}</span>
                <div className="table-actions">
                  <button
                    className="secondary"
                    onClick={() => {
                      setSelected(c);
                      setModal('editor');
                    }}
                  >
                    Edit
                  </button>
                  <button
                    className="secondary"
                    onClick={() => {
                      setSelected({ ...c, deleteType: 'submission' });
                      setModal('delete');
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
          <button
            className="secondary submission-cta"
            onClick={() => {
              setSelected(null);
              setModal('submit');
            }}
          >
            <Plus size={15} /> Share your first / next story
          </button>
        </section>
      </div>
    </>
  );
}
