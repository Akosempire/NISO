import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import Logo from '../components/Logo';
import './LoginPage.css';

const DEMO_ACCOUNTS = [
  { label: 'HQ Admin',        email: 'hq@niso.tcn.gov.ng',            password: 'Admin@1234' },
  { label: 'ICT Admin',       email: 'ict@niso.tcn.gov.ng',           password: 'Ict@1234' },
  { label: 'Regional Admin',  email: 'regional@niso.tcn.gov.ng',      password: 'Region@1234' },
  { label: 'Station Admin',   email: 'station-admin@niso.tcn.gov.ng', password: 'Station@1234' },
  { label: 'Supervisor',      email: 'supervisor@niso.tcn.gov.ng',    password: 'Super@1234' },
  { label: 'Operator',        email: 'operator@niso.tcn.gov.ng',      password: 'Oper@1234' },
  { label: 'Knowledge Admin', email: 'knowledge@niso.tcn.gov.ng',     password: 'Knowledge@1234' },
  { label: 'Viewer',          email: 'viewer@niso.tcn.gov.ng',        password: 'View@1234' },
];

export default function LoginPage() {
  const { login, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const result = await login(email, password);
    if (!result.success) {
      setError(result.error || 'Login failed');
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-brand">
          <Logo height={64} />
        </div>
        <p className="subtitle">Nigerian Independent System Operator</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="demo-credentials">
          <p className="small">Demo accounts — click a role to fill the form</p>
          <ul className="small demo-list">
            {DEMO_ACCOUNTS.map((acc) => (
              <li key={acc.email}>
                <button
                  type="button"
                  className="demo-link"
                  onClick={() => {
                    setEmail(acc.email);
                    setPassword(acc.password);
                  }}
                >
                  <span className="demo-role">{acc.label}</span>
                  <span className="demo-email">{acc.email}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
