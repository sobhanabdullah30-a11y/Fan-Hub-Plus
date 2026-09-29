import React, { useState } from 'react';
import { ArrowUpRight, MessageSquare, Shield, CalendarDays, Check, Send } from 'lucide-react';
import { pageLink } from '../../app/routes.js';
export function ContactSection({ onContact, user, standalone = false }) {
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  const lock = React.useRef(false);
  async function submit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    const fields = Object.fromEntries(new FormData(form));
    if (!fields.message.trim() || !fields.name.trim()) return;
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError('');
    try {
      await onContact({ ...fields, name: fields.name.trim(), message: fields.message.trim() });
      form.reset();
      setSent(true);
    } catch (e) {
      setError(e.message);
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  return (
    <section
      className={`landing-contact ${standalone ? 'standalone-contact' : ''}`}
      id="landing-contact"
      tabIndex="-1"
      aria-labelledby="contact-title"
    >
      <div className="contact-copy">
        <span className="section-index">CONTACT US / OPEN CHANNEL</span>
        <h2 id="contact-title">
          Talk to <em>us.</em>
        </h2>
        <p>
          Ask a question, report an issue, or suggest something you would like to see on Fan Hub
          Plus.
        </p>
        <div className="contact-topics">
          <span>
            <MessageSquare size={17} /> Questions & suggestions
          </span>
          <span>
            <Shield size={17} /> Content & community concerns
          </span>
          <span>
            <CalendarDays size={17} /> Event information
          </span>
        </div>
        <a href={pageLink('Help')}>
          Need a quick answer? Visit our Help & FAQ <ArrowUpRight size={16} />
        </a>
        <div className="contact-orbit" aria-hidden="true">
          <i />
          <i />
          <i />
          <span>↗</span>
        </div>
      </div>
      <div className="contact-form-panel">
        {sent ? (
          <div className="contact-success" role="status">
            <span>
              <Check size={30} />
            </span>
            <h3>Message saved.</h3>
            <p>Your message has been received by Fan Hub Plus.</p>
            <button className="secondary" onClick={() => setSent(false)}>
              Write another message <ArrowUpRight size={16} />
            </button>
          </div>
        ) : (
          <form onSubmit={submit}>
            <div className="contact-form-row">
              <label>
                Your name
                <input
                  name="name"
                  placeholder="What should we call you?"
                  defaultValue={user?.name || ''}
                  required
                  minLength="2"
                  maxLength="100"
                  autoComplete="name"
                />
              </label>
              <label>
                Email address
                <input
                  name="email"
                  type="email"
                  defaultValue={user?.email || ''}
                  placeholder="you@example.com"
                  required
                  maxLength="254"
                  autoComplete="email"
                />
              </label>
            </div>
            <label>
              What’s on your mind?
              <select name="type">
                <option value="query">A question</option>
                <option value="suggestion">An idea or suggestion</option>
                <option value="bug">Report a bug</option>
                <option value="content">Content or community concern</option>
              </select>
            </label>
            <label>
              Your message
              <textarea
                name="message"
                placeholder="Tell us a little more…"
                required
                minLength="5"
                maxLength="3000"
                rows="5"
              />
            </label>
            <div className="contact-form-bottom">
              <p>
                Messages are sent to Fan Hub Plus.
                <br />
                Sign in to submit your message.
              </p>
              {error && <p role="alert">{error}</p>}
              <button disabled={busy} className="primary" type="submit">
                Send message <Send size={16} />
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
