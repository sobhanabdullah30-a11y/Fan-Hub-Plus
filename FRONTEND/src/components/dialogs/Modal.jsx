import { UserAccessForm } from '../../features/admin/UserAccessForm.jsx';
import { FeedbackForm } from '../../features/feedback/FeedbackForm.jsx';
import { ContentEditor } from '../../features/catalog/ContentEditor.jsx';
import { ContentDetails } from '../../features/catalog/ContentDetails.jsx';
import React, { useState, useEffect } from 'react';
import { X, ArrowRight, Trash2 } from 'lucide-react';
import { UniverseArtwork } from '../media/UniverseArtwork.jsx';
import { LoadingImage } from '../media/LoadingImage.jsx';
import { Tour } from '../onboarding/Tour.jsx';
import { AuthForm } from '../../features/auth/AuthForm.jsx';

import { api, send } from '../../services/httpClient.js';

import { icons } from '../../app/navigation.js';

export function Modal({
  modal,
  close,
  user,
  selected,
  db,
  perform,
  open,
  reload,
  busy,
  apiError,
  setModal,
  setSelected,
  setToast,
  navigate,
  saved,
  bookmark,
  requireUser,
}) {
  const [error, setError] = useState('');
  const ref = React.useRef(null);
  useEffect(() => {
    setError('');
    const previous = document.activeElement;
    const old = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    ref.current?.focus();
    function key(e) {
      if (e.key === 'Escape') close();
      if (e.key === 'Tab') {
        const all = ref.current?.querySelectorAll('button,a,input,textarea,select,[tabindex="0"]');
        const items = [...(all || [])].filter((x) => !x.disabled);
        const first = items[0],
          last = items.at(-1);
        if (
          e.shiftKey &&
          (document.activeElement === first || document.activeElement === ref.current)
        ) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    }
    document.addEventListener('keydown', key);
    return () => {
      document.body.style.overflow = old;
      document.removeEventListener('keydown', key);
      previous?.focus();
    };
  }, [modal]);
  const titles = {
    login: 'Welcome to your universe.',
    register: 'Find your people.',
    forgot: 'Let’s get you back in.',
    reset: 'Choose a new password',
    detail: selected?.title,
    submit: 'Your story belongs here.',
    editor: selected ? 'Edit discovery' : 'Create a discovery',
    feedback: 'Help us shape this universe.',
    sitemap: 'Every corner of the universe',
    about: 'Built for the fans.',
    delete: 'Remove this item?',
    tour: 'Your universe starts here.',
    userEdit: 'Manage account access',
    verify: 'Verify your email',
    resend: 'Resend verification',
    password: 'Change your password',
  };
  return (
    <div
      className="modal-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <section
        ref={ref}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={`modal ${modal === 'detail' ? 'detail-modal' : ''}`}
      >
        <button className="modal-close icon-button" aria-label="Close dialog" onClick={close}>
          <X size={20} />
        </button>
        {modal === 'detail' &&
          (/^(\d+|release-\d+)$/.test(selected.id) ? (
            <div className="detail-art">
              <UniverseArtwork category={selected.category} />
            </div>
          ) : (
            <LoadingImage className="detail-image" src={selected.image} alt={selected.title} />
          ))}
        <div className="modal-inner">
          <div className="eyebrow purple">
            {modal === 'detail' ? `${selected.category} / ${selected.type}` : 'FAN HUB PLUS'}
          </div>
          <h2 id="modal-title">{titles[modal]}</h2>
          {busy && <p role="status">Saving changes…</p>}
          {apiError && (
            <p role="alert" className="form-error">
              {apiError}
            </p>
          )}
          {modal === 'tour' && (
            <Tour onDone={close} navigate={navigate} register={() => setModal('register')} />
          )}{' '}
          {['login', 'register', 'forgot', 'reset', 'verify', 'resend', 'password'].includes(
            modal
          ) && (
            <AuthForm
              mode={modal}
              setMode={setModal}
              onAuthenticated={async (session) => {
                await reload();
                close();
                navigate(session?.user?.role === 'Admin' ? 'Admin' : 'My dashboard');
              }}
            />
          )}
          {modal === 'detail' && (
            <ContentDetails
              bookmark={bookmark}
              busy={busy}
              db={db}
              error={error}
              open={open}
              perform={perform}
              requireUser={requireUser}
              saved={saved}
              selected={selected}
              setError={setError}
              setModal={setModal}
              setSelected={setSelected}
              setToast={setToast}
              user={user}
            />
          )}
          {['submit', 'editor'].includes(modal) && (
            <ContentEditor
              busy={busy}
              close={close}
              db={db}
              error={error}
              modal={modal}
              perform={perform}
              selected={selected}
              setError={setError}
              user={user}
            />
          )}
          {modal === 'feedback' && (
            <FeedbackForm
              close={close}
              perform={perform}
              selected={selected}
              setModal={setModal}
              setSelected={setSelected}
              user={user}
            />
          )}
          {modal === 'sitemap' && (
            <div className="sitemap-grid">
              {Object.entries(icons)
                .filter(([p]) => p !== 'Admin' || user?.role === 'admin')
                .map(([p, Icon]) => (
                  <button
                    className="secondary"
                    key={p}
                    onClick={() => {
                      close();
                      if (
                        ['My dashboard', 'My collection', 'Settings', 'Admin'].includes(p) &&
                        !user
                      )
                        setModal('login');
                      else navigate(p);
                    }}
                  >
                    <Icon size={17} />
                    {p}
                    <ArrowRight size={14} />
                  </button>
                ))}
            </div>
          )}
          {modal === 'about' && (
            <>
              <p>
                Fan Hub Plus brings Anime, Gaming, Movies, TV Shows, K-Pop, Comics, Manga, and
                Cosplay into one welcoming space.
              </p>
              <p>
                Fan Hub Plus connects fans through a shared catalog, personal collections and
                community submissions. Accounts and permissions are managed by the server.
              </p>
              <p>Content is provided by community contributors and reviewed by administrators.</p>
              <p>
                Implementation assisted by OpenAI Codex. No merchandise purchases or payment
                processing.
              </p>
            </>
          )}
          {modal === 'userEdit' && (
            <UserAccessForm
              busy={busy}
              close={close}
              error={error}
              perform={perform}
              selected={selected}
              user={user}
            />
          )}{' '}
          {modal === 'delete' && (
            <>
              <p>
                {selected.deleteType === 'account'
                  ? 'This permanently deletes the account and its private data. Published content will remain available under administrator ownership.'
                  : selected.deleteType === 'user'
                    ? 'This account will be deactivated; the API does not support deleting users.'
                    : 'This content will be permanently deleted from the server.'}
              </p>
              <div className="detail-actions">
                <button className="secondary" onClick={close}>
                  Cancel
                </button>
                <button
                  className="primary danger-bg"
                  disabled={busy}
                  onClick={() =>
                    perform(
                      () =>
                        selected.deleteType === 'account'
                          ? api('/api/admin/users/' + selected.id, { method: 'DELETE' })
                          : selected.deleteType !== 'user'
                            ? api(
                                (selected.deleteType === 'submission'
                                  ? '/api/me/submissions/'
                                  : '/api/admin/content/') + selected.id,
                                { method: 'DELETE' }
                              )
                            : send(
                                '/api/admin/users/' + selected.id + '/access',
                                {
                                  role: selected.role === 'admin' ? 'Admin' : 'Member',
                                  isActive: false,
                                },
                                'PUT'
                              ),
                      'Updated successfully.',
                      close
                    )
                  }
                >
                  Remove <Trash2 size={16} />
                </button>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
