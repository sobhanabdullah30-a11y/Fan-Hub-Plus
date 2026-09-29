import { Pagination } from '../components/common/Pagination.jsx';
import { Plus, Check, X, Edit3, Trash2, Search } from 'lucide-react';
import { UniverseArtwork } from '../components/media/UniverseArtwork.jsx';
import { LoadingImage } from '../components/media/LoadingImage.jsx';
import { send, api } from '../services/httpClient.js';
import { Empty } from '../components/common/EmptyState.jsx';
import { AdminLibrary } from '../features/admin/AdminLibrary.jsx';
import { AdminAnalytics } from '../features/admin/AdminAnalytics.jsx';
import React from 'react';

export function Admin({
  workspacePage,
  setWorkspacePage,
  adminTab,
  busy,
  db,
  perform,
  published,
  setAdminTab,
  setModal,
  setSelected,
  user,
}) {
  const [adminQuery, setAdminQuery] = React.useState('');
  const [roleFilter, setRoleFilter] = React.useState('all');
  const [statusFilter, setStatusFilter] = React.useState('all');
  const pending = db.content.filter((c) => c.status === 'pending');
  const normalizedQuery = adminQuery.trim().toLowerCase();
  const matches = (...values) =>
    !normalizedQuery || values.filter(Boolean).join(' ').toLowerCase().includes(normalizedQuery);
  const contactDetails = (message = '') => {
    const lines = message
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
    const from = lines.find((line) => line.startsWith('From: '));
    const email = lines.find((line) => line.startsWith('Email: '));
    if (!from) return null;
    return {
      name: from.slice(6).trim() || 'Member',
      email: email?.slice(7).trim() || '',
      message: lines
        .filter((line) => !line.startsWith('From: ') && !line.startsWith('Email: '))
        .join('\n'),
    };
  };
  const contentRows = db.content
    .filter((c) => adminTab === 'Content' || c.status === 'pending')
    .filter((c) => matches(c.title, c.category, c.type, c.status))
    .filter((c) => statusFilter === 'all' || c.status === statusFilter);
  const userRows = (db.adminUsers || db.users)
    .filter((u) => matches(u.name, u.email, u.role, u.isActive ? 'active' : 'inactive'))
    .filter((u) => roleFilter === 'all' || u.role === roleFilter)
    .filter((u) => statusFilter === 'all' || (u.isActive ? 'active' : 'inactive') === statusFilter);
  const feedbackRows = db.feedback
    .map((feedback) => ({ ...feedback, contact: contactDetails(feedback.message) }))
    .filter((f) =>
      matches(f.contact?.name, f.contact?.email, f.name, f.email, f.message, f.type, f.status)
    )
    .filter((f) => statusFilter === 'all' || f.status === statusFilter);
  const hasActiveFilters = adminQuery || roleFilter !== 'all' || statusFilter !== 'all';
  const changeTab = (tab) => {
    setAdminQuery('');
    setRoleFilter('all');
    setStatusFilter('all');
    setAdminTab(tab);
  };
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow purple">ADMIN WORKSPACE</div>
          <h1>Behind the universe.</h1>
          <p>Curate great stories. Support your community.</p>
        </div>
        <button
          className="primary"
          onClick={() => {
            setSelected(null);
            setModal('editor');
          }}
        >
          <Plus size={16} /> Add content
        </button>
      </div>
      <div className="stats-grid">
        {[
          ['Community members', db.analytics?.users || 0],

          [
            'Published stories',
            (db.analytics?.popularCategories || []).reduce((sum, c) => sum + c.items, 0),
          ],
          ['Awaiting review', db.analytics?.pendingSubmissions || 0],
          [
            'Content views',
            (db.analytics?.popularCategories || []).reduce((sum, c) => sum + c.views, 0),
          ],
        ].map(([label, n]) => (
          <div className="stat" key={label}>
            <span>{label}</span>
            <strong>{n}</strong>
            <small>Server records</small>
          </div>
        ))}
      </div>
      <div className="category-tabs">
        {['Content', 'Submissions', 'Users', 'Feedback', 'Analytics', 'Categories', 'FAQs'].map(
          (t) => (
            <button key={t} className={adminTab === t ? 'active' : ''} onClick={() => changeTab(t)}>
              {t}
              {t === 'Submissions' &&
                db.analytics?.pendingSubmissions > 0 &&
                ` (${db.analytics.pendingSubmissions})`}
            </button>
          )
        )}
      </div>
      {['Content', 'Submissions', 'Users', 'Feedback'].includes(adminTab) && (
        <div className="admin-filter-bar" role="search" aria-label={`${adminTab} filters`}>
          <label className="inline-search">
            <Search size={16} />
            <input
              aria-label={`Search ${adminTab.toLowerCase()}`}
              value={adminQuery}
              onChange={(event) => setAdminQuery(event.target.value)}
              placeholder={
                adminTab === 'Users'
                  ? 'Search name or email'
                  : adminTab === 'Feedback'
                    ? 'Search feedback'
                    : 'Search title, category or type'
              }
            />
          </label>
          {adminTab === 'Users' && (
            <select
              aria-label="Filter users by role"
              value={roleFilter}
              onChange={(event) => setRoleFilter(event.target.value)}
            >
              <option value="all">All roles</option>
              <option value="admin">Administrators</option>
              <option value="user">Members</option>
            </select>
          )}
          <select
            aria-label={`Filter ${adminTab.toLowerCase()} by status`}
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value="all">All {adminTab === 'Users' ? 'accounts' : 'statuses'}</option>
            {adminTab === 'Users' ? (
              <>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </>
            ) : adminTab === 'Feedback' ? (
              <>
                <option value="open">Open</option>
                <option value="inprogress">In progress</option>
                <option value="resolved">Resolved</option>
              </>
            ) : (
              <>
                <option value="published">Published</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </>
            )}
          </select>
          {hasActiveFilters && (
            <button
              className="text-button"
              type="button"
              onClick={() => {
                setAdminQuery('');
                setRoleFilter('all');
                setStatusFilter('all');
              }}
            >
              Clear filters
            </button>
          )}
        </div>
      )}
      {['Content', 'Submissions', 'Users', 'Feedback'].includes(adminTab) && (
        <Pagination
          page={workspacePage}
          pageSize={20}
          total={db.workspaceTotal}
          onChange={setWorkspacePage}
          label={adminTab}
        />
      )}
      {['Content', 'Submissions'].includes(adminTab) && (
        <div className="table-wrap admin-table">
          <table>
            <thead>
              <tr>
                <th scope="col">Content</th>
                <th scope="col">Category</th>
                <th scope="col">Type / status</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {contentRows.map((c) => (
                <tr key={c.id}>
                  <td>
                    <div className="table-title">
                      <span className="admin-content-thumb">
                        {/^(\d+|release-\d+)$/.test(c.id) ? (
                          <UniverseArtwork category={c.category} />
                        ) : (
                          <LoadingImage src={c.image} alt="" />
                        )}
                      </span>
                      <span>{c.title}</span>
                    </div>
                  </td>
                  <td>{c.category}</td>
                  <td>
                    {c.type}
                    <small>{c.status}</small>
                  </td>
                  <td>
                    <div className="table-actions">
                      {c.status === 'pending' && (
                        <button
                          className="icon-button"
                          aria-label={`Approve ${c.title}`}
                          onClick={() => {
                            perform(
                              () =>
                                send(
                                  '/api/admin/content/' + c.id + '/moderation',
                                  { approve: true, note: null },
                                  'PUT'
                                ),
                              'Submission approved.'
                            );
                          }}
                        >
                          <Check size={17} />
                        </button>
                      )}
                      {c.status === 'pending' && (
                        <button
                          className="icon-button danger"
                          aria-label={`Reject ${c.title}`}
                          onClick={() => {
                            perform(
                              () =>
                                send(
                                  '/api/admin/content/' + c.id + '/moderation',
                                  { approve: false, note: null },
                                  'PUT'
                                ),
                              'Submission rejected.'
                            );
                          }}
                        >
                          <X size={17} />
                        </button>
                      )}
                      <button
                        className="icon-button"
                        aria-label={`Edit ${c.title}`}
                        onClick={() => {
                          setSelected(c);
                          setModal('editor');
                        }}
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        className="icon-button danger"
                        aria-label={`Delete ${c.title}`}
                        onClick={() => {
                          setSelected({ ...c, deleteType: 'content' });
                          setModal('delete');
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!contentRows.length && (
                <tr>
                  <td colSpan={4}>No matching content found.</td>
                </tr>
              )}
            </tbody>
          </table>
          {adminTab === 'Submissions' && !pending.length && (
            <Empty
              title="All caught up"
              text="New fan submissions will appear here for your review."
            />
          )}
        </div>
      )}
      {adminTab === 'Users' && (
        <div className="table-wrap admin-table">
          <table className="users-table">
            <caption className="sr-only">Community account management</caption>
            <thead>
              <tr>
                <th scope="col">Member</th>
                <th scope="col">Email</th>
                <th scope="col">Role</th>
                <th scope="col">Account</th>
                <th scope="col">Email verification</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {userRows.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div className="table-title">
                      <span className="avatar">{u.name[0]}</span>
                      <strong>
                        {u.name}
                        {u.id === user.id && <small>Your account</small>}
                      </strong>
                    </div>
                  </td>
                  <td className="table-email">{u.email}</td>
                  <td>
                    <span className="badge">{u.role === 'admin' ? 'Administrator' : 'Member'}</span>
                  </td>
                  <td>
                    <span className="badge">{u.isActive ? 'Active' : 'Inactive'}</span>
                  </td>
                  <td>{u.emailVerified ? 'Verified' : 'Unverified'}</td>
                  <td>
                    <div className="table-actions">
                      <button
                        className="secondary"
                        disabled={busy}
                        aria-label={`Edit member ${u.name}`}
                        onClick={() => {
                          setSelected(u);
                          setModal('userEdit');
                        }}
                      >
                        <Edit3 size={15} /> Edit
                      </button>
                      {u.id !== user.id && u.isActive && (
                        <button
                          className="secondary danger"
                          disabled={busy}
                          aria-label={`Deactivate ${u.name}`}
                          onClick={() => {
                            setSelected({ ...u, deleteType: 'user' });
                            setModal('delete');
                          }}
                        >
                          Deactivate
                        </button>
                      )}
                      {u.id !== user.id && (
                        <button
                          className="secondary danger"
                          disabled={busy}
                          aria-label={`Delete ${u.name}`}
                          onClick={() => {
                            setSelected({ ...u, deleteType: 'account' });
                            setModal('delete');
                          }}
                        >
                          <Trash2 size={15} /> Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {!userRows.length && (
                <tr>
                  <td colSpan={6}>No matching accounts found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      {adminTab === 'Feedback' && (
        <div className="table-wrap admin-table feedback-table-wrap">
          <table className="feedback-table">
            <caption className="sr-only">Community feedback</caption>
            <thead>
              <tr>
                <th scope="col">Sender</th>
                <th scope="col">Message / reply</th>
                <th scope="col">Type / status</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {feedbackRows.map((f) => (
                <tr key={f.id}>
                  <td>
                    <div className="feedback-member">
                      <span aria-hidden="true">
                        {(f.contact?.name || f.name || 'Member').trim().charAt(0)}
                      </span>
                      <div>
                        <strong>{f.contact ? 'Contact Us' : f.name || 'Member'}</strong>
                        <small>
                          {f.contact ? 'Member message' : f.email || 'Community feedback'}
                        </small>
                      </div>
                    </div>
                  </td>
                  <td className="table-copy feedback-message-cell">
                    {f.contact && (
                      <div className="contact-message-header">
                        <strong>{f.contact.name}</strong>
                        {f.contact.email && (
                          <a href={`mailto:${f.contact.email}`}>{f.contact.email}</a>
                        )}
                      </div>
                    )}
                    <p className="feedback-message">{f.contact?.message || f.message}</p>
                    {f.adminReply && (
                      <div className="feedback-latest-reply">
                        <span>Latest admin reply</span>
                        <p>{f.adminReply}</p>
                      </div>
                    )}
                    <details className="feedback-reply">
                      <summary>
                        {f.adminReply ? 'Update reply or status' : 'Reply and update status'}
                      </summary>
                      <form
                        className="feedback-reply-form"
                        id={`feedback-${f.id}`}
                        onSubmit={(e) => {
                          e.preventDefault();
                          const fields = new FormData(e.currentTarget);
                          perform(
                            () =>
                              send(
                                '/api/admin/feedback/' + f.id,
                                {
                                  status: fields.get('status'),
                                  adminReply: fields.get('reply') || null,
                                },
                                'PUT'
                              ),
                            'Feedback updated.'
                          );
                        }}
                      >
                        <label>
                          Reply
                          <textarea
                            name="reply"
                            rows={3}
                            defaultValue={f.adminReply || ''}
                            maxLength="4000"
                          />
                        </label>
                        <label>
                          Status
                          <select
                            name="status"
                            defaultValue={
                              f.status === 'resolved'
                                ? 'Resolved'
                                : f.status === 'inprogress'
                                  ? 'InProgress'
                                  : 'Open'
                            }
                          >
                            <option>Open</option>
                            <option value="InProgress">In progress</option>
                            <option>Resolved</option>
                          </select>
                        </label>
                      </form>
                    </details>
                  </td>
                  <td>
                    <div className="feedback-status">
                      <span className="badge">{f.type}</span>
                      <span className={`feedback-status-label status-${f.status}`}>
                        {f.status === 'inprogress' ? 'In progress' : f.status}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div className="table-actions feedback-actions">
                      <button
                        className="secondary"
                        type="submit"
                        form={`feedback-${f.id}`}
                        disabled={busy}
                      >
                        Save changes
                      </button>
                      <button
                        className="secondary danger"
                        disabled={busy}
                        onClick={() => {
                          if (window.confirm('Permanently delete this feedback?'))
                            perform(
                              () => api('/api/admin/feedback/' + f.id, { method: 'DELETE' }),
                              'Feedback deleted.'
                            );
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!feedbackRows.length && (
                <tr>
                  <td colSpan={4}>No matching feedback found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      {['Categories', 'FAQs'].includes(adminTab) && (
        <AdminLibrary key={adminTab} kind={adminTab} rows={db.categories} perform={perform} />
      )}
      {adminTab === 'Analytics' && (
        <AdminAnalytics analytics={db.analytics} categories={db.categories} />
      )}
    </>
  );
}
