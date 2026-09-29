import React, { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Heart, Play } from 'lucide-react';
import { UniverseArtwork } from '../../components/media/UniverseArtwork.jsx';

const chapters = [
  {
    label: 'DISCOVER',
    word: 'universe.',
    world: 'Anime',
    color: '#b19aff',
    description:
      'The stories that stay with you. The worlds you get lost in. The people who just get it. Find them all here.',
    action: 'Find your universe',
    page: 'Explore',
  },
  {
    label: 'CONNECT',
    word: 'community.',
    world: 'Cosplay',
    color: '#89dfc3',
    description:
      'Take your passion beyond the screen. Discover conventions, creative meetups, and your next unforgettable fan moment.',
    action: 'Meet your people',
    page: 'Events',
  },
  {
    label: 'CREATE',
    word: 'story.',
    world: 'Comics',
    color: '#efb281',
    description:
      'Every great universe begins with imagination. Share your perspective, celebrate your craft, and make your mark.',
    action: 'Share your story',
    page: 'submit',
  },
];

function Stars({ motion }) {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let frame = 0,
      width = 1,
      height = 1,
      visible = true,
      last = 0,
      time = 0;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const stars = Array.from({ length: 75 }, (_, i) => ({
      x: ((i * 137.5) % 1000) / 1000,
      y: ((i * 83.7) % 1000) / 1000,
      radius: i % 8 === 0 ? 1.3 : 0.6,
    }));
    function paint() {
      ctx.clearRect(0, 0, width, height);
      for (const star of stars) {
        ctx.fillStyle = `rgba(226,215,255,${0.22 + (Math.sin(time * 0.012 + star.x * 60) + 1) * 0.2})`;
        ctx.beginPath();
        ctx.arc(
          star.x * width,
          (star.y * height - time * 0.03 + height * 100) % height,
          star.radius,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }
    }
    function resize() {
      const rect = canvas.getBoundingClientRect(),
        ratio = Math.min(devicePixelRatio || 1, 1.5);
      width = rect.width;
      height = rect.height;
      canvas.width = width * ratio;
      canvas.height = height * ratio;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      paint();
    }
    function loop(now) {
      frame = 0;
      if (!motion || reduced || !visible || document.hidden) return;
      if (now - last >= 33) {
        time++;
        paint();
        last = now;
      }
      frame = requestAnimationFrame(loop);
    }
    function resume() {
      if (!frame && visible && !document.hidden && motion && !reduced)
        frame = requestAnimationFrame(loop);
    }
    const size = new ResizeObserver(resize);
    const view = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      resume();
    });
    size.observe(canvas);
    view.observe(canvas);
    document.addEventListener('visibilitychange', resume);
    resize();
    resume();
    return () => {
      cancelAnimationFrame(frame);
      size.disconnect();
      view.disconnect();
      document.removeEventListener('visibilitychange', resume);
    };
  }, [motion]);
  return <canvas ref={ref} className="universe-stars" aria-hidden="true" />;
}

export function UniverseHero({ navigate, setModal, submit, motion }) {
  const [chapter, setChapter] = useState(0);
  const scene = chapters[chapter];
  return (
    <section
      className="universe-hero"
      data-spotlight
      style={{ '--scene-accent': scene.color }}
      aria-label="Welcome to the fandom universe"
    >
      <Stars motion={motion} />
      <div className="universe-aurora" aria-hidden="true" />
      <div className="universe-copy" key={chapter}>
        <span className="universe-kicker">
          <i /> THE FANDOM COLLECTIVE <span className="hero-est">EST. 2026</span>
        </span>
        <h1>
          Not just a fan.
          <br />
          Part of a<br />
          <em>{scene.word}</em>
        </h1>
        <p>{scene.description}</p>
        <div className="universe-actions">
          <button
            className="primary"
            onClick={() => (scene.page === 'submit' ? submit() : navigate(scene.page))}
          >
            {scene.action}
            <span>
              <ArrowUpRight size={21} />
            </span>
          </button>
          <button className="universe-tour" onClick={() => setModal('tour')}>
            <span>
              <Play size={13} fill="currentColor" />
            </span>
            Take the tour
          </button>
        </div>
        <div className="universe-footnote">
          <span className="universe-avatars">
            <i>AK</i>
            <i>JL</i>
            <i>MR</i>
          </span>
          <span>
            Different worlds.<strong>One shared obsession.</strong>
          </span>
          <span className="universe-count">
            <b>08</b>
            <small>
              FANDOMS.
              <br />
              ZERO LIMITS.
            </small>
          </span>
        </div>
      </div>
      <div className="universe-portal" aria-hidden="true">
        <span className="universe-coordinate">FHP / UNIVERSE 00{chapter + 1}</span>
        <div className="universe-halo" />
        <div className="universe-ring ring-a" />
        <div className="universe-ring ring-b" />
        <div className="universe-core">
          <div className="orbit-petals">
            {Array.from({ length: 7 }, (_, i) => (
              <i key={i} style={{ '--petal': i }} />
            ))}
          </div>
          <UniverseArtwork category={scene.world} />
          <span className="universe-core-label">
            ENTER SOMETHING<strong>extraordinary.</strong>
          </span>
        </div>
        <i className="universe-satellite" />
        <div className="universe-float float-top">
          <UniverseArtwork category="Gaming" />
          <span>
            <small>LEVEL UP YOUR WORLD</small>
            <strong>Play beyond limits.</strong>
          </span>
          <ArrowUpRight size={15} />
        </div>
        <div className="universe-float float-bottom">
          <UniverseArtwork category="K-Pop" />
          <span>
            <small>FIND YOUR FREQUENCY</small>
            <strong>Feel every moment.</strong>
          </span>
          <Heart size={15} />
        </div>
      </div>
      <div className="universe-chapters" aria-label="Featured themes">
        {chapters.map((item, index) => (
          <button
            key={item.label}
            aria-pressed={index === chapter}
            onClick={() => setChapter(index)}
          >
            <span>0{index + 1}</span> {item.label}
          </button>
        ))}
      </div>
    </section>
  );
}
