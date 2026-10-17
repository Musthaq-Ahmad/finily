import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleSignInButton } from '../components/GoogleSignInButton';
import { Banner } from '../components/ui/Banner';
import { LineArtBackdrop } from '../components/ui/LineArtBackdrop';
import { useAuth } from '../context/AuthContext';

export function LoginPage() {
  const { loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [signingIn, setSigningIn] = useState(false);

  const handleCredential = useCallback(
    async (idToken: string) => {
      setError(null);
      setSigningIn(true);
      try {
        await loginWithGoogle(idToken);
        navigate('/');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not sign in with Google.');
      } finally {
        setSigningIn(false);
      }
    },
    [loginWithGoogle, navigate],
  );

  return (
    <div className="relative isolate min-h-screen bg-finly-surface flex flex-col justify-center px-6">
      <LineArtBackdrop />
      <div className="max-w-[400px] w-full mx-auto">
        <div className="mb-10 text-center">
          <div className="w-14 h-14 rounded-2xl bg-finly-dark text-finly-lime flex items-center justify-center mx-auto mb-4 text-xl font-display font-bold">
            F
          </div>
          <h1 className="text-2xl font-bold font-display text-finly-dark">Welcome to Finly</h1>
          <p className="text-sm text-finly-muted mt-1">Sign in with Google to manage your trip expenses.</p>
        </div>

        {error && <Banner tone="error" icon="fa-solid fa-circle-exclamation" title={error} className="mb-4" />}

        <div className="flex justify-center">
          <GoogleSignInButton onCredential={handleCredential} />
        </div>

        {signingIn && <p className="text-center text-sm text-finly-muted mt-4">Signing in…</p>}

        <p className="text-center text-[11px] text-finly-muted mt-8 max-w-[280px] mx-auto">
          We only use your Google account to identify you — no password is stored.
        </p>
      </div>
    </div>
  );
}
