import { BrowserRouter, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { refreshExpiredPerks } from './db/helpers';
import Dashboard from './pages/Dashboard';
import MyCards from './pages/MyCards';
import CardDetail from './pages/CardDetail';
import Perks from './pages/Perks';
import Churning from './pages/Churning';
import CardCatalog from './pages/CardCatalog';

function BottomNav() {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path || (path !== '/' && location.pathname.startsWith(path));

  return (
    <nav className="bottom-nav">
      <div className="bottom-nav-inner">
        <NavLink to="/" className={`nav-item ${isActive('/') && location.pathname === '/' ? 'active' : ''}`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
          Home
        </NavLink>
        <NavLink to="/cards" className={`nav-item ${isActive('/cards') ? 'active' : ''}`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
            <line x1="1" y1="10" x2="23" y2="10"/>
          </svg>
          Cards
        </NavLink>
        <NavLink to="/perks" className={`nav-item ${isActive('/perks') ? 'active' : ''}`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 12 20 22 4 22 4 12"/>
            <rect x="2" y="7" width="20" height="5"/>
            <line x1="12" y1="22" x2="12" y2="7"/>
            <path d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z"/>
            <path d="M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z"/>
          </svg>
          Perks
        </NavLink>
        <NavLink to="/churning" className={`nav-item ${isActive('/churning') ? 'active' : ''}`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
          Churning
        </NavLink>
        <NavLink to="/catalog" className={`nav-item ${isActive('/catalog') ? 'active' : ''}`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          Catalog
        </NavLink>
      </div>
    </nav>
  );
}

function AppContent() {
  useEffect(() => {
    // Auto-refresh expired perks on app load
    refreshExpiredPerks().then(count => {
      if (count > 0) console.log(`Refreshed ${count} expired perks`);
    });
  }, []);

  return (
    <div className="app-layout">
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/cards" element={<MyCards />} />
        <Route path="/card/:id" element={<CardDetail />} />
        <Route path="/perks" element={<Perks />} />
        <Route path="/churning" element={<Churning />} />
        <Route path="/catalog" element={<CardCatalog />} />
      </Routes>
      <BottomNav />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
