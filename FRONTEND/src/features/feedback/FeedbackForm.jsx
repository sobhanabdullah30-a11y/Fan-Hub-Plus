import { send } from '../../services/httpClient.js';
import { Send } from 'lucide-react';
import React from 'react';

export function FeedbackForm({ close, perform, selected, setModal, setSelected, user }) {
  const mediaContext = selected?.feedbackContext ? `Feedback for “${selected.title}”: ` : '';
  const closeFeedback = () => {
    if (selected?.feedbackContext) setSelected({ ...selected, feedbackContext: false });
    close();
  };
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        const f = Object.fromEntries(new FormData(e.currentTarget));
        if (!user) {
          setModal('login');
          return;
        }
        await perform(
          () =>
            send('/api/me/feedback', {
              type: f.type[0].toUpperCase() + f.type.slice(1),
              message: mediaContext + f.message,
            }),
          'Feedback sent.',
          closeFeedback
        );
      }}
    >
      <p>
        {mediaContext
          ? `Tell us about your experience with ${selected.title}.`
          : 'Found a bug or have a bright idea? We’re listening.'}
      </p>
      <label>
        Feedback type
        <select name="type">
          <option value="suggestion">Suggestion</option>
          <option value="bug">Bug report</option>
          <option value="query">Question</option>
        </select>
      </label>
      <label>
        Your message
        <textarea
          name="message"
          minLength="5"
          maxLength="3000"
          required
          rows="5"
          placeholder={mediaContext || 'Share your feedback'}
        />
      </label>
      <button className="primary">
        Send feedback <Send size={16} />
      </button>
    </form>
  );
}
