import { Outlet, NavLink } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';

const navItems = [
  { to: '/', label: '홈', icon: '🏠' },
  { to: '/archive', label: '아카이브', icon: '📚' },
  { to: '/settings', label: '설정', icon: '⚙️' },
];

export default function Layout() {
  const { theme, toggle } = useTheme();

  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <header
        className="bg-bg-card border-b border-border px-4 py-3 flex items-center gap-3"
        style={{
          flexShrink: 0,
          paddingTop: 'calc(0.75rem + env(safe-area-inset-top, 0px))',
        }}
      >
        <span className="text-2xl">🇯🇵</span>
        <h1 className="text-lg font-bold">日本語 Study</h1>
        <div className="ml-auto flex items-center gap-3">
          <button
            onClick={toggle}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-bg-hover transition-colors text-lg"
            title={theme === 'dark' ? '라이트 모드' : '다크 모드'}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          <span className="text-xs text-text-muted">JLPT N3~N4</span>
        </div>
      </header>

      {/* Main Content */}
      <main
        className="bg-bg"
        style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}
      >
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <nav
        className="bg-bg-card border-t border-border"
        style={{
          flexShrink: 0,
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
      >
        <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
          {navItems.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'text-primary'
                    : 'text-text-muted hover:text-text'
                }`
              }
            >
              <span className="text-xl">{icon}</span>
              <span className="text-xs">{label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
