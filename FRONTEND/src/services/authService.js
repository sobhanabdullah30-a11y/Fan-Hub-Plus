import { send, setSession } from './httpClient.js';

export async function authenticate(mode, fields) {
  if (mode === 'login') {
    const result = await send('/api/auth/login', {
      email: fields.email,
      password: fields.password,
    });
    setSession(result);
    return result;
  }
  const routes = {
    register: [
      'register',
      { email: fields.email, password: fields.password, displayName: fields.name },
    ],
    forgot: ['forgot-password', { email: fields.email }],
    reset: ['reset-password', { token: fields.token, password: fields.password }],
    verify: ['verify-email', { token: fields.token }],
    resend: ['resend-verification', { email: fields.email }],
    password: [
      'change-password',
      { currentPassword: fields.currentPassword, newPassword: fields.password },
    ],
  };
  const [route, body] = routes[mode];
  const result = await send(`/api/auth/${route}`, body);
  if (mode === 'verify') setSession(result);
  return result;
}
