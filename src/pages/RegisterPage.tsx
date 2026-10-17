import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Banner } from '../components/ui/Banner';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setSubmitting(true);
    try {
      await register(email, password);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create account.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-finly-surface flex flex-col justify-center px-6">
      <div className="max-w-[400px] w-full mx-auto">
        <div className="mb-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-finly-dark text-finly-lime flex items-center justify-center mx-auto mb-4 text-xl font-display font-bold">
            F
          </div>
          <h1 className="text-2xl font-bold font-display text-finly-dark">Create your account</h1>
          <p className="text-sm text-finly-muted mt-1">Start capturing trip expenses in Finly.</p>
        </div>

        {error && <Banner tone="error" icon="fa-solid fa-circle-exclamation" title={error} className="mb-4" />}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-finly-dark mb-1.5" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="w-full rounded-2xl border border-finly-hairline bg-finly-cardBg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-finly-lime"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-finly-dark mb-1.5" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              className="w-full rounded-2xl border border-finly-hairline bg-finly-cardBg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-finly-lime"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-finly-dark mb-1.5" htmlFor="confirm-password">
              Confirm password
            </label>
            <input
              id="confirm-password"
              type="password"
              required
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-2xl border border-finly-hairline bg-finly-cardBg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-finly-lime"
            />
          </div>
          <Button type="submit" fullWidth size="lg" disabled={submitting}>
            {submitting ? 'Creating account…' : 'Create account'}
          </Button>
        </form>

        <p className="text-center text-sm text-finly-muted mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-finly-dark font-semibold underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
