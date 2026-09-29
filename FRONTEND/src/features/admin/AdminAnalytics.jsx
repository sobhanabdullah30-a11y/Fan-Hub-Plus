import React from 'react';

export function AdminAnalytics({ analytics, categories }) {
  if (!analytics) return <p role="status">Analytics are unavailable. Please reload the page.</p>;
  const categoryName = (id) =>
    categories.find((category) => category.id === id)?.name || 'Uncategorized';
  const counts = [
    ['Total members', analytics.users],
    ['Active members � last 30 days', analytics.activeUsersLast30Days],
    ['Submissions awaiting review', analytics.pendingSubmissions],
    ['Open feedback', analytics.openFeedback],
    ['Assistant interactions', analytics.chatbotInteractions],
  ];
  return (
    <section className="admin-analytics">
      <h2>Platform analytics</h2>
      <p>Activity and published content totals from the database.</p>
      <div className="stats-grid">
        {counts.map(([label, value]) => (
          <div className="stat" key={label}>
            <span>{label}</span>
            <strong>{(value ?? 0).toLocaleString()}</strong>
          </div>
        ))}
      </div>
      <h3>Category performance</h3>
      <div className="table-wrap admin-table analytics-table">
        <table>
          <thead>
            <tr>
              <th scope="col">Category</th>
              <th scope="col">Published content</th>
              <th scope="col">Views</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => {
              const data = analytics.popularCategories?.find(
                (row) => row.categoryId === category.id
              );
              return (
                <tr key={category.id}>
                  <td>{category.name}</td>
                  <td>{(data?.items ?? 0).toLocaleString()}</td>
                  <td>{(data?.views ?? 0).toLocaleString()}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <h3>Most viewed content</h3>
      <div className="table-wrap admin-table analytics-table">
        <table>
          <thead>
            <tr>
              <th scope="col">Title</th>
              <th scope="col">Category</th>
              <th scope="col">Type</th>
              <th scope="col">Views</th>
            </tr>
          </thead>
          <tbody>
            {(analytics.popularContent || []).map((item) => (
              <tr key={item.id}>
                <td>
                  <strong>{item.title}</strong>
                </td>
                <td>{categoryName(item.categoryId)}</td>
                <td>{item.type}</td>
                <td>{(item.views ?? 0).toLocaleString()}</td>
              </tr>
            ))}
            {!analytics.popularContent?.length && (
              <tr>
                <td colSpan={4}>No published content yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
