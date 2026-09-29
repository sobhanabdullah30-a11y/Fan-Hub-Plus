import React from 'react';

export function AccessOverview({ user }) {
  return (
    <section className="panel access-overview" aria-label="Account access">
      <h2>
        {user?.role === 'admin'
          ? 'Administrator workspace'
          : user
            ? 'Your member access'
            : 'Explore as a visitor'}
      </h2>
      <p>
        {user
          ? `Signed in as ${user.name}.`
          : 'Browse freely. Sign in when you want to save or contribute.'}
      </p>
      <div className="access-grid">
        <div>
          <h3>Everyone</h3>
          <p>
            Home, categories, search, articles, characters, media, events, showcase and resources.
          </p>
        </div>
        <div>
          <h3>Registered members</h3>
          <p>
            Personal dashboard, bookmarks and private notes, ratings, fan submissions, feedback,
            profile and preferences.
          </p>
        </div>
        {(!user || user.role === 'admin') && (
          <div>
            <h3>Administrators</h3>
            <p>
              All member features plus content, category and user management, submission review,
              feedback replies, FAQs and analytics.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
