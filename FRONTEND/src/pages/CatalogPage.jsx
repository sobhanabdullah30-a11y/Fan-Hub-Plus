import { Plus, Search, SlidersHorizontal } from 'lucide-react';
import { ContentCard as Card } from '../features/catalog/ContentCard.jsx';
import { Empty } from '../components/common/EmptyState.jsx';
import { LoadingState } from '../components/common/LoadingState.jsx';
import React from 'react';

export function Catalog({
  bookmark,
  catalogBusy,
  catalogPage,
  catalogTotal,
  category,
  db,
  fandom,
  filters,
  genre,
  navigate,
  open,
  page,
  popularity,
  query,
  requireUser,
  results,
  saved,
  setCatalogPage,
  setCategory,
  setFandom,
  setFilters,
  setGenre,
  setModal,
  setPopularity,
  setQuery,
  setSelected,
  setSort,
  setType,
  setYear,
  sort,
  type,
  year,
  mediaActions,
}) {
  const catalogStartRef = React.useRef(null);
  const hasActiveFilters =
    category !== 'All fandoms' ||
    fandom !== 'All universes' ||
    type !== 'All types' ||
    genre !== 'All genres' ||
    year !== 'All years' ||
    popularity !== 'Any popularity' ||
    Boolean(query);

  function changeCatalogPage(nextPage) {
    setCatalogPage(nextPage);
    window.requestAnimationFrame(() => {
      catalogStartRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  return (
    <>
      <div ref={catalogStartRef} className="page-heading">
        <div>
          <div className="eyebrow purple">YOUR NEXT OBSESSION IS HERE</div>
          <h1>
            {page === 'Explore'
              ? category === 'All fandoms'
                ? 'Explore the multiverse'
                : `${category} discoveries`
              : page}
          </h1>
          <p>
            {page === 'My collection'
              ? 'All your favorites, in your own little universe.'
              : page === 'Showcase'
                ? 'Collectibles to discover. New worlds to look forward to.'
                : category === 'All fandoms'
                  ? 'Stories, characters, and creations from the worlds you love.'
                  : `Showing every published discovery in ${category}. Use search and filters to refine the results.`}
          </p>
        </div>
        {page === 'Explore' && (
          <button
            className="primary"
            onClick={() =>
              requireUser(() => {
                setSelected(null);
                setModal('submit');
              })
            }
          >
            <Plus size={16} /> Share a story
          </button>
        )}
      </div>
      <div className="category-tabs">
        <button
          className={category === 'All fandoms' ? 'active' : ''}
          onClick={() => setCategory('All fandoms')}
        >
          All fandoms
        </button>
        {db.categories.map((item) => (
          <button
            key={item.id}
            className={category === item.name ? 'active' : ''}
            onClick={() => setCategory(item.name)}
          >
            {item.name}
          </button>
        ))}
      </div>
      <div className="filter-bar">
        <div className="inline-search">
          <Search size={17} />
          <input
            aria-label="Search content"
            placeholder="Search this universe…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <button
          className={filters ? 'secondary active' : 'secondary'}
          onClick={() => setFilters(!filters)}
        >
          <SlidersHorizontal size={16} /> Filters
        </button>
        <select aria-label="Sort content" value={sort} onChange={(e) => setSort(e.target.value)}>
          <option>Popular</option>
          <option>Latest</option>
          <option>A–Z</option>
        </select>
      </div>
      {filters && (
        <div className="filter-options">
          {[
            [
              fandom,
              setFandom,
              ['All universes', ...(db.filters?.fandoms || [])],
              'Fandom / universe',
            ],
            [
              type,
              setType,
              [
                'All types',
                'article',
                'character',
                'video',
                'audio',
                'image',
                'merchandise',
                'release',
              ],
              'Content type',
            ],
            [genre, setGenre, ['All genres', ...(db.filters?.genres || [])], 'Genre'],
            [
              year,
              setYear,
              ['All years', ...(db.filters?.releaseYears || []).map(String)],
              'Release year',
            ],
            [popularity, setPopularity, ['Any popularity', '70+ popularity'], 'Popularity'],
          ].map(([v, set, opts, label]) => (
            <label key={label}>
              {label}
              <select value={v} onChange={(e) => set(e.target.value)}>
                {opts.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </label>
          ))}
          <button
            className="text-button"
            onClick={() => {
              setType('All types');
              setGenre('All genres');
              setYear('All years');
              setPopularity('Any popularity');
              setFandom('All universes');
              setQuery('');
            }}
          >
            Clear filters
          </button>
        </div>
      )}
      <p className="result-count">
        {catalogBusy ? 'Loading current discoveries…' : catalogTotal + ' discoveries'}{' '}
        {page === 'Showcase' && ' · Display only — no purchases'}
      </p>
      {catalogBusy ? (
        <LoadingState label="Loading current discoveries…" />
      ) : (
        <div className="card-grid">
          {results.map((c) => (
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
      )}
      {catalogTotal > 12 && (
        <div className="detail-actions">
          <button
            className="secondary"
            disabled={catalogPage === 1}
            onClick={() => changeCatalogPage(catalogPage - 1)}
          >
            Previous
          </button>
          <span>
            Page {catalogPage} of {Math.ceil(catalogTotal / 12)}
          </span>
          <button
            className="secondary"
            disabled={catalogPage * 12 >= catalogTotal}
            onClick={() => changeCatalogPage(catalogPage + 1)}
          >
            Next
          </button>
        </div>
      )}
      {!catalogBusy && !results.length && (
        <Empty
          title={
            page === 'My collection' ? 'Your collection starts with a spark' : 'No discoveries yet'
          }
          text={
            page === 'My collection'
              ? 'Tap the bookmark on any story to save it here.'
              : hasActiveFilters
                ? 'No discoveries match these filters. Clear a filter or try another search.'
                : 'Try another category or clear your filters.'
          }
          action={() => {
            setCategory('All fandoms');
            setFandom('All universes');
            setType('All types');
            setGenre('All genres');
            setYear('All years');
            setPopularity('Any popularity');
            setQuery('');
            navigate('Explore');
          }}
          actionLabel={hasActiveFilters ? 'Clear filters' : 'Explore discoveries'}
        />
      )}
    </>
  );
}
