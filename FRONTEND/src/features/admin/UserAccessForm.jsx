import { send } from '../../services/httpClient.js';
import { Check } from 'lucide-react';
import React from 'react';

export function UserAccessForm({ busy, close, error, perform, selected, user }) {
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        await perform(
          () =>
            send(
              '/api/admin/users/' + selected.id + '/access',
              {
                role:
                  selected.id === user.id
                    ? 'Admin'
                    : f.get('role') === 'admin'
                      ? 'Admin'
                      : 'Member',
                isActive: selected.id === user.id ? true : f.get('isActive') === 'on',
              },
              'PUT'
            ),
          'Account access updated.',
          close
        );
      }}
    >
      <label>
        Display name
        <input value={selected.name} disabled readOnly />
      </label>
      <label>
        Email
        <input value={selected.email} disabled readOnly />
      </label>
      <label>
        Role
        <select name="role" defaultValue={selected.role} disabled={selected.id === user.id}>
          <option value="user">Member</option>
          <option value="admin">Administrator</option>
        </select>
      </label>
      <p className="review-note">
        Access changes are enforced by the server. Names and email cannot be changed through this
        endpoint.
      </p>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <label>
        <input
          name="isActive"
          type="checkbox"
          disabled={selected.id === user.id}
          defaultChecked={selected.isActive}
        />{' '}
        Account active
      </label>
      <button disabled={busy} className="primary">
        Save member <Check size={16} />
      </button>
    </form>
  );
}
