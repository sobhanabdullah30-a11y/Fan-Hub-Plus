import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { api, send } from '../../services/httpClient.js';

export function AdminLibrary({ kind, rows, perform }) {
  const [items, setItems] = useState(rows || []),
    [edit, setEdit] = useState(null),
    [error, setError] = useState(''),
    [pending, setPending] = useState(false),
    [search, setSearch] = useState('');
  const path = kind === 'Categories' ? '/api/admin/categories' : '/api/admin/faqs';
  const visibleItems = items.filter((item) =>
    [item.name, item.description, item.question, item.answer]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
      .includes(search.trim().toLowerCase())
  );
  async function refresh() {
    if (kind === 'FAQs') setItems(await api(path));
    else setItems(await api('/api/categories'));
  }
  useEffect(() => {
    refresh().catch((e) => setError(e.message));
  }, [kind, rows]);
  async function save(e) {
    e.preventDefault();
    if (pending) return;
    const f = Object.fromEntries(new FormData(e.currentTarget));
    setPending(true);
    setError('');
    const body =
      kind === 'Categories'
        ? { name: f.name, description: f.description }
        : { question: f.question, answer: f.answer, published: f.published === 'on' };
    try {
      const ok = await perform(
        () => send(path + (edit?.id ? '/' + edit.id : ''), body, edit?.id ? 'PUT' : 'POST'),
        'Saved successfully.'
      );
      if (ok) {
        setEdit(null);
        await refresh();
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setPending(false);
    }
  }
  return (
    <section className="panel admin-library">
      <h2>{kind}</h2>
      {error && <p role="alert">{error}</p>}
      {edit ? (
        <form className="library-editor" onSubmit={save} key={edit.id || 'new'}>
          {(kind === 'Categories' ? ['name', 'description'] : ['question', 'answer']).map(
            (field) => (
              <label key={field}>
                {field[0].toUpperCase() + field.slice(1)}
                {field === 'name' || field === 'question' ? (
                  <input
                    name={field}
                    required
                    maxLength={field === 'name' ? 80 : 500}
                    defaultValue={edit[field] || ''}
                  />
                ) : (
                  <textarea
                    name={field}
                    rows={4}
                    required={field !== 'description'}
                    maxLength={field === 'description' ? 2000 : 8000}
                    defaultValue={edit[field] || ''}
                  />
                )}
              </label>
            )
          )}
          {kind === 'FAQs' && (
            <label>
              <input name="published" type="checkbox" defaultChecked={edit.published ?? true} />{' '}
              Published
            </label>
          )}
          <div className="form-actions">
            <button disabled={pending} className="primary">
              Save
            </button>
            <button className="secondary" type="button" onClick={() => setEdit(null)}>
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button className="primary" onClick={() => setEdit({})}>
          Add {kind === 'Categories' ? 'category' : 'FAQ'}
        </button>
      )}
      <div className="admin-filter-bar library-filter" role="search">
        <label className="inline-search">
          <Search size={16} />
          <input
            aria-label={`Search ${kind.toLowerCase()}`}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={`Search ${kind.toLowerCase()}`}
          />
        </label>
        {search && (
          <button className="text-button" type="button" onClick={() => setSearch('')}>
            Clear search
          </button>
        )}
      </div>
      <div className="table-wrap admin-table">
        <table>
          <caption className="sr-only">{kind} management</caption>
          <thead>
            <tr>
              <th scope="col">{kind === 'Categories' ? 'Name' : 'Question'}</th>
              <th scope="col">{kind === 'Categories' ? 'Description' : 'Answer'}</th>
              {kind === 'FAQs' && <th scope="col">Visibility</th>}
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {visibleItems.map((item) => (
              <tr key={item.id}>
                <td>
                  <strong>{item.name || item.question}</strong>
                </td>
                <td className="table-copy">{item.description || item.answer || '�'}</td>
                {kind === 'FAQs' && (
                  <td>
                    <span className="badge">{item.published ? 'Published' : 'Draft'}</span>
                  </td>
                )}
                <td>
                  <div className="table-actions">
                    <button
                      className="secondary"
                      disabled={pending}
                      onClick={() => setEdit(item)}
                      aria-label={`Edit ${item.name || item.question}`}
                    >
                      Edit
                    </button>
                    <button
                      className="secondary danger"
                      disabled={pending}
                      onClick={async () => {
                        if (
                          !window.confirm(
                            'Permanently delete this ' +
                              (kind === 'Categories' ? 'category' : 'FAQ') +
                              '?'
                          )
                        )
                          return;
                        setPending(true);
                        try {
                          const ok = await perform(
                            () => api(path + '/' + item.id, { method: 'DELETE' }),
                            'Deleted.'
                          );
                          if (ok) {
                            if (edit?.id === item.id) setEdit(null);
                            await refresh();
                          }
                        } catch (e) {
                          setError(e.message);
                        } finally {
                          setPending(false);
                        }
                      }}
                      aria-label={`Delete ${item.name || item.question}`}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!visibleItems.length && (
              <tr>
                <td colSpan={kind === 'FAQs' ? 4 : 3}>
                  {items.length ? 'No matching records found.' : 'No records yet.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
