import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <header className="border-b" style={{ borderColor: 'var(--line)', background: 'var(--paper-card)' }}>
      <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Logo size={26} variant="dark" />
          <span className="font-display font-semibold text-lg tracking-tight" style={{ color: 'var(--ink)' }}>AutoMed Visa</span>
        </div>
        {user && (
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium leading-none" style={{ color: 'var(--ink)' }}>{user.name}</p>
              <p className="text-xs mt-0.5 capitalize" style={{ color: 'var(--ink-soft)' }}>{user.role}</p>
            </div>
            <button onClick={handleLogout}
              className="text-xs font-medium font-mono uppercase tracking-wide px-3 py-1.5 border rounded"
              style={{ borderColor: 'var(--line)', color: 'var(--ink-soft)' }}>
              Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
