import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export function AccountMenu() {
  const { session, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [imgError, setImgError] = useState(false);

  if (!session) return null;

  const initials = (session.name ?? session.email).trim().charAt(0).toUpperCase();
  const showPhoto = Boolean(session.picture) && !imgError;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Account menu"
        aria-expanded={open}
        className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center bg-finly-dark text-finly-lime font-bold text-sm shadow-pill active:scale-95 transition-transform flex-shrink-0"
      >
        {showPhoto ? (
          <img
            src={session.picture ?? undefined}
            alt=""
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          initials
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} aria-hidden="true" />
          <div className="absolute right-0 top-12 z-50 w-56 rounded-2xl bg-finly-cardBg shadow-level3 border border-finly-hairline overflow-hidden">
            <div className="px-4 py-3 border-b border-finly-hairline">
              <p className="text-sm font-bold text-finly-dark truncate">{session.name ?? 'Signed in'}</p>
              <p className="text-xs text-finly-muted truncate mt-0.5">{session.email}</p>
            </div>
            <button
              type="button"
              onClick={logout}
              className="w-full flex items-center gap-2.5 px-4 py-3 text-sm font-semibold text-finly-error hover:bg-finly-surface transition-colors"
            >
              <i className="fa-solid fa-arrow-right-from-bracket" aria-hidden="true" />
              Log out
            </button>
          </div>
        </>
      )}
    </div>
  );
}
