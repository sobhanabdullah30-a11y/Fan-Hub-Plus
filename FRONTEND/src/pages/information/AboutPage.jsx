import { Compass, Play, ArrowRight, Users, Shield } from 'lucide-react';
import { pageLink } from '../../app/routes.js';
import React from 'react';

export function AboutPage({ startTour, register }) {
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow purple">A UNIVERSE FOR EVERY KIND OF FAN</span>
          <h1>Your passions have a home.</h1>
          <p>Get to know Fan Hub Plus, who it is for, and how to make it yours.</p>
        </div>
      </div>
      <section className="about-intro panel">
        <Compass size={38} className="purple" />
        <div>
          <h2>What is Fan Hub Plus?</h2>
          <p>
            Fan Hub Plus is a fandom discovery and information platform. It brings together Anime,
            Gaming, Movies, TV Shows, K-Pop, Comics, Manga and Cosplay, so you can find stories,
            character profiles, videos, audio, galleries, events and collectibles in one place.
          </p>
          <p>
            Instead of jumping between scattered sources, browse by category, search for a topic,
            refine your results, and keep the discoveries that matter to you.
          </p>
          <div className="detail-actions">
            <button className="primary" onClick={startTour}>
              Show me how it works <Play size={16} />
            </button>
            <a className="secondary" href={pageLink('Explore')}>
              Start exploring <ArrowRight size={16} />
            </a>
          </div>
        </div>
      </section>
      <div className="section-heading">
        <h2>How it works</h2>
      </div>
      <ol className="journey-grid">
        {[
          [
            '01',
            'Discover your world',
            'Choose a category, search a topic, and filter by fandom, genre, year, popularity or content type.',
          ],
          [
            '02',
            'Get closer to the story',
            'Read articles and character profiles, watch videos, listen to audio, and explore image galleries.',
          ],
          [
            '03',
            'Make it personal',
            'Join the community to bookmark discoveries, write private notes, rate content and select your interests.',
          ],
          [
            '04',
            'Connect & contribute',
            'Find events by city, add them to your calendar, or submit a fan story for administrator review.',
          ],
        ].map(([number, title, text]) => (
          <li className="panel" key={number}>
            <span className="journey-number">{number}</span>
            <h3>{title}</h3>
            <p>{text}</p>
          </li>
        ))}
      </ol>
      <div className="section-heading">
        <h2>Choose how you take part</h2>
      </div>
      <div className="role-grid">
        {[
          [
            Compass,
            'Visitor',
            'Browse content, use search and filters, explore media and events, read resources, and send feedback.',
            'No account needed',
          ],
          [
            Users,
            'Registered member',
            'Everything a visitor can do, plus a personal dashboard, interests, bookmarks, private notes, ratings, and fan submissions.',
            'Member account',
          ],
          [
            Shield,
            'Administrator',
            'Curate content and media, approve or reject submissions, manage community members, resolve feedback and review engagement.',
            'Restricted portal',
          ],
        ].map(([Icon, title, text, label]) => (
          <article className="panel" key={title}>
            <Icon className="purple" size={25} />
            <h3>{title}</h3>
            <p>{text}</p>
            <span className="badge">{label}</span>
          </article>
        ))}
      </div>
      <section className="community-banner">
        <div>
          <h2>Start as a visitor. Stay for your community.</h2>
          <p>You can explore without an account. Join whenever you want your own collection.</p>
        </div>
        <button className="primary" onClick={register}>
          Join the community <ArrowRight size={16} />
        </button>
      </section>
      <section className="panel">
        <h2>A few things to know</h2>
        <ul className="readable-list">
          <li>
            Merchandise is a discovery showcase. Fan Hub Plus does not process purchases, orders or
            payments.
          </li>
          <li>
            Fan submissions are reviewed before publication. Share your own work and credit its
            sources.
          </li>
          <li>
            Private notes belong to your personal collection. Location access is optional and is
            used only when you choose “Near me.”
          </li>
          <li>
            Content and account information are supplied by the Fan Hub Plus API. Sign in to save
            discoveries, submit stories and personalize your profile.
          </li>
          <li>
            Images: Unsplash. Fonts: Google Fonts. Sample video: Big Buck Bunny, Blender Foundation.
            Sample audio: SoundHelix. Implementation assisted by OpenAI Codex.
          </li>
        </ul>
      </section>
    </>
  );
}
