import { icons } from '../../app/navigation.js';
import { pageLink } from '../../app/routes.js';
import { ArrowUpRight, ChevronRight, LogOut } from 'lucide-react';
import React from 'react';
import { UserAvatar } from '../common/UserAvatar.jsx';
import { BrandMark } from '../common/BrandMark.jsx';

export function Sidebar({
  mobile,
  navigate,
  onSignOut,
  page,
  requireUser,
  saved,
  setModal,
  setSelected,
  user,
}) {
  return (
    <aside className={`sidebar ${mobile ? 'open' : ''}`}>
      <button className="brand" aria-label="Fan Hub Plus home" onClick={() => navigate('Discover')}>
        <BrandMark />
      </button>
      <span className="nav-label">YOUR UNIVERSE</span>
      <nav>
        {['Discover', 'Explore', 'Media room', 'Characters', 'Events', 'Showcase', 'Resources'].map(
          (p) => {
            const Icon = icons[p];
            return (
              <button
                key={p}
                className={page === p ? 'nav-item active' : 'nav-item'}
                onClick={() => navigate(p)}
              >
                <Icon size={19} />
                <span>{p === 'Discover' ? 'Home' : p}</span>
                {p === 'Discover' && <span className="nav-dot" />}
              </button>
            );
          }
        )}
      </nav>
      {user && (
        <>
          <span className="nav-label">MEMBER SPACE</span>
          <nav>
            {['My dashboard', 'My collection', 'Settings'].map((p) => {
              const Icon = icons[p];
              return (
                <button
                  key={p}
                  className={page === p ? 'nav-item active' : 'nav-item'}
                  onClick={() => requireUser(() => navigate(p))}
                >
                  <Icon size={18} />
                  <span>{p === 'Discover' ? 'Home' : p}</span>
                  {p === 'My collection' && saved.length > 0 && (
                    <span className="nav-count">{saved.length}</span>
                  )}
                </button>
              );
            })}
          </nav>
        </>
      )}
      {user?.role === 'admin' && (
        <>
          <span className="nav-label">ADMINISTRATION</span>
          <nav aria-label="Administration">
            <button
              className={page === 'Admin' ? 'nav-item active' : 'nav-item'}
              onClick={() => navigate('Admin')}
            >
              Admin
            </button>
          </nav>
        </>
      )}
      <nav className="nav-help" aria-label="Learn about Fan Hub Plus">
        {['About', 'Contact', 'Help', 'Sitemap'].map((p) => {
          const Icon = icons[p];
          return (
            <a className={`nav-item ${page === p ? 'active' : ''}`} key={p} href={pageLink(p)}>
              <Icon size={17} />
              {p === 'About'
                ? 'About & how it works'
                : p === 'Help'
                  ? 'Help & FAQ'
                  : p === 'Contact'
                    ? 'Contact us'
                    : p}
            </a>
          );
        })}
      </nav>
      <div className="sidebar-bottom">
        <div className="join-card">
          <span>A world of possibilities</span>
          <h3>
            Your people.
            <br />
            Your passions.
          </h3>
          <p>There’s a universe for everyone.</p>
          <button
            onClick={() => {
              setSelected(null);
              user ? setModal('submit') : setModal('register');
            }}
          >
            {user ? 'Share your story' : 'Join the community'} <ArrowUpRight size={16} />
          </button>
        </div>
        <button
          className="profile-button"
          onClick={() => (user ? navigate('Settings') : setModal('login'))}
        >
          <UserAvatar key={user?.avatarUrl} user={user} />
          <span>
            <strong>{user ? user.name : 'Hello, explorer'}</strong>
            <small>
              {user
                ? `${user.role === 'admin' ? 'Administrator' : 'Registered member'}`
                : 'Your journey starts here'}
            </small>
          </span>
          <ChevronRight size={16} />
        </button>
        {user && (
          <button className="logout" onClick={onSignOut}>
            <LogOut size={14} /> Sign out
          </button>
        )}
      </div>
    </aside>
  );
}
