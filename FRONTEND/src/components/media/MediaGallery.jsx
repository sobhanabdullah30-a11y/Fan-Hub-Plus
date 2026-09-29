import React, { useState } from 'react';
import { LoadingImage } from './LoadingImage.jsx';

export function MediaGallery({ items }) {
  const [index, setIndex] = useState(0);
  if (!items.length) return <p>No images supplied for this discovery.</p>;
  return (
    <section className="media-gallery">
      <h3>Visual inspiration gallery</h3>
      <LoadingImage className="gallery-main" src={items[index]?.image} alt={items[index]?.title} />
      <div className="gallery-thumbnails">
        {items.map((item, i) => (
          <button
            key={item.id}
            aria-label={`View image: ${item.title}`}
            aria-pressed={i === index}
            onClick={() => setIndex(i)}
          >
            <img src={item.image} alt="" />
          </button>
        ))}
      </div>
      <p>{items[index]?.title}</p>
    </section>
  );
}
