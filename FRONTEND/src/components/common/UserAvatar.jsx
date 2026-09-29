import React, { useState } from 'react';

export function UserAvatar({ user, small = false }) {
  const [failed, setFailed] = useState(false);
  return (
    <span className={`avatar${small ? ' small' : ''}`}>
      {user?.avatarUrl?.startsWith('https://') && !failed ? (
        <img src={user.avatarUrl} alt="" onError={() => setFailed(true)} />
      ) : (
        user?.name?.[0] || 'U'
      )}
    </span>
  );
}
