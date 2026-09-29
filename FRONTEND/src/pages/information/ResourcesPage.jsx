import { resources } from '../../content/resourceGuides.js';
import { BookOpen, ArrowRight } from 'lucide-react';
import { pageLink } from '../../app/routes.js';
import React from 'react';

export function ResourcesPage() {
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow purple">A LITTLE KNOWLEDGE. A BIGGER UNIVERSE.</span>
          <h1>The resource library.</h1>
          <p>Practical starting points for discovering, creating and participating.</p>
        </div>
      </div>
      <div className="resource-grid">
        {resources.map(([title, text, page, category]) => (
          <article className="panel" key={title}>
            <BookOpen size={24} className="purple" />
            <h2>{title}</h2>
            <p>{text}</p>
            <a className="text-button" href={pageLink(page, category)}>
              Explore this topic <ArrowRight size={15} />
            </a>
          </article>
        ))}
      </div>
    </>
  );
}
