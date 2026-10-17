import { useLocation, useNavigate } from 'react-router-dom';

const TABS = [
  { path: '/', label: 'Trips', icon: 'fa-solid fa-suitcase-rolling' },
  { path: '/insights', label: 'Insights', icon: 'fa-solid fa-chart-pie' },
];

export function BottomTabBar() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 bg-finly-cardBg/95 backdrop-blur-sm border-t border-finly-hairline pb-[env(safe-area-inset-bottom)]">
      <div className="max-w-[480px] mx-auto flex items-stretch">
        {TABS.map((tab) => {
          const active = location.pathname === tab.path;
          return (
            <button
              key={tab.path}
              type="button"
              onClick={() => navigate(tab.path)}
              aria-current={active ? 'page' : undefined}
              className={`flex-1 flex flex-col items-center gap-1 py-2.5 transition-colors ${
                active ? 'text-finly-dark' : 'text-finly-muted'
              }`}
            >
              <i className={`${tab.icon} text-lg`} aria-hidden="true" />
              <span className={`text-[11px] ${active ? 'font-bold' : 'font-semibold'}`}>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
