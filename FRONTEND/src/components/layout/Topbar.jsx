import {
  Menu,
  ChevronRight,
  Search,
  Pause,
  Play,
  Sun,
  Moon,
  ArrowUpRight,
  Settings,
  LogOut,
} from 'lucide-react';
import { pageLink } from '../../app/routes.js';
import React, { useEffect, useRef, useState } from 'react';
import { UserAvatar } from '../common/UserAvatar.jsx';

export function Topbar({
  category,
  motion,
  navigate,
  onSignOut,
  page,
  query,
  searchCatalog,
  setMobile,
  setModal,
  setMotion,
  setTheme,
  theme,
  user,
}) {
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const accountMenu = useRef(null);

  useEffect(() => {
    if (!accountMenuOpen) return undefined;
    const closeMenu = (event) => {
      if (!accountMenu.current?.contains(event.target)) setAccountMenuOpen(false);
    };
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setAccountMenuOpen(false);
    };
    document.addEventListener('pointerdown', closeMenu);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('pointerdown', closeMenu);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [accountMenuOpen]);

  return (
    <header className="topbar">
      <button
        className="icon-button mobile-menu"
        aria-label="Open navigation"
        onClick={() => setMobile(true)}
      >
        <Menu />
      </button>
      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <a href={pageLink('Discover')}>Home</a>
        <ChevronRight size={12} />
        <strong>{page === 'Discover' ? 'Home' : page}</strong>
        {category !== 'All fandoms' && (
          <>
            <ChevronRight size={12} />
            <span>{category}</span>
          </>
        )}
      </nav>
      <div className="topbar-right">
        <form
          className="global-search"
          onSubmit={(e) => {
            e.preventDefault();
            searchCatalog(query);
          }}
        >
          <Search size={16} />
          <input
            aria-label="Search the universe"
            placeholder="Search the universe…"
            value={query}
            onChange={(e) => {
              searchCatalog(e.target.value);
            }}
          />
          <kbd>↵</kbd>
        </form>
        <button
          className="motion-toggle"
          aria-label={motion ? 'Pause visual effects' : 'Enable visual effects'}
          aria-pressed={motion}
          onClick={() => setMotion(!motion)}
        >
          {motion ? <Pause size={14} /> : <Play size={14} />}
          <span>{motion ? 'Effects on' : 'Effects off'}</span>
        </button>
        <button
          className="icon-button theme-button"
          aria-label="Toggle color theme"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          {theme === 'dark' ? <Sun size={19} /> : <Moon size={19} />}
        </button>
        <span className="header-divider" />
        <div className="header-account-menu" ref={accountMenu}>
          <button
            className="header-account"
            aria-expanded={user ? accountMenuOpen : undefined}
            aria-haspopup={user ? 'menu' : undefined}
            onClick={() => (user ? setAccountMenuOpen((open) => !open) : setModal('login'))}
          >
            {user ? (
              <>
                <UserAvatar key={user.avatarUrl} user={user} small />
                <span className="header-account-name" title={user.name}>
                  {user.name}
                </span>
              </>
            ) : (
              <>
                Sign in <ArrowUpRight size={14} />
              </>
            )}
          </button>
          {user && accountMenuOpen && (
            <div className="account-menu" role="menu" aria-label="Account options">
              <button
                role="menuitem"
                onClick={() => {
                  setAccountMenuOpen(false);
                  navigate('Settings');
                }}
              >
                <Settings size={15} /> Profile & settings
              </button>
              <button
                className="account-menu-logout"
                role="menuitem"
                onClick={async () => {
                  setAccountMenuOpen(false);
                  await onSignOut();
                }}
              >
                <LogOut size={15} /> Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
