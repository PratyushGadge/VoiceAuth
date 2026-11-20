import { useState } from 'react';

const API_URL = 'http://localhost:5001';

export default function LoginPage({ onLogin }) {
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();

    const response = await fetch(`${API_URL}/${mode}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await response.json();

    if (!response.ok) {
      setMessage(data.error);
    } else if (mode === 'register') {
      setMessage(data.message);
      setMode('login');
    } else {
      onLogin(data);
    }
  }

  return (
    <main className="login-page">
      <form className="login-card" onSubmit={handleSubmit}>
        <div className="brand">Voice<span>Auth</span></div>
        <h1>{mode === 'login' ? 'Welcome back' : 'Create your account'}</h1>
        <p className="muted">Student delivery portal</p>

        <div className="mode-switch">
          <button type="button" className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>
            Log in
          </button>
          <button type="button" className={mode === 'register' ? 'active' : ''} onClick={() => setMode('register')}>
            Register
          </button>
        </div>

        {mode === 'register' && (
          <label>
            Full name
            <input value={name} onChange={e => setName(e.target.value)} required />
          </label>
        )}
        <label>
          Student email
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        </label>
        <label>
          Password
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} minLength={6} required />
        </label>

        <button className="button" type="submit">
          {mode === 'login' ? 'Log in' : 'Create account'}
        </button>
        {message && <p className="message">{message}</p>}
      </form>
    </main>
  );
}
