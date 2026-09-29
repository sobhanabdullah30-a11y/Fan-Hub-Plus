import { LoadingImage } from '../media/LoadingImage.jsx';
import React from 'react';

export function ArticleBody({ text }) {
  return (
    <div className="article-body">
      {text.split('\n\n').map((block, i) => {
        const image = block.match(/^!\[([^\]]*)\]\((https:\/\/[^\s)]+)\)$/);
        return image ? (
          <figure className="article-figure" key={i}>
            <LoadingImage key={image[2]} src={image[2]} alt={image[1]} />
            <figcaption>{image[1]}</figcaption>
          </figure>
        ) : /^https:\/\/[^\s]+$/.test(block) ? (
          <p key={i}>
            <a href={block} target="_blank" rel="noreferrer">
              Official source
            </a>
          </p>
        ) : block.startsWith('## ') ? (
          <h3 key={i}>{block.slice(3)}</h3>
        ) : block.startsWith('> ') ? (
          <blockquote key={i}>{block.slice(2)}</blockquote>
        ) : block.startsWith('- ') ? (
          <ul key={i}>
            {block.split('\n').map((line, j) => (
              <li key={j}>{line.replace(/^- /, '')}</li>
            ))}
          </ul>
        ) : (
          <p key={i}>
            {block
              .split(/(\*\*[^*]+\*\*)/g)
              .map((part, j) =>
                part.startsWith('**') ? <strong key={j}>{part.slice(2, -2)}</strong> : part
              )}
          </p>
        );
      })}
    </div>
  );
}
