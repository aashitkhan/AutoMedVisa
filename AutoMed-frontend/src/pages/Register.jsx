import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'worker', phone: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/register', form);
      login(res.data.user, res.data.token);
      navigate(res.data.user.role === 'admin' ? '/dashboard' : '/submit');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex w-5/12 texture-bg flex-col justify-between p-12">
        <div className="flex items-center gap-2.5">
          <Logo size={50} variant="light" />
          <span className="font-display font-semibold text-lg text-[#f6f5f1]">AutoMed Visa</span>
        </div>
        <div>
          <p className="eyebrow mb-3">Three roles, one register</p>
          <h1 className="font-display text-4xl leading-tight text-[#f6f5f1] mb-4">
            Workers, employers,<br />and administrators<br />on one ledger.
          </h1>
          <p className="text-[#c3cad9] text-sm max-w-sm leading-relaxed">
            Register once with AutoMed Visa. Workers submit their documents, employers track their hires,
            and administrators review every flagged mismatch.
          </p>
        </div>
        <p className="font-mono text-xs text-[#8b93a5]">Designed & Developed by Aashit Khan · 2026</p>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <p className="eyebrow mb-2">Create account</p>
          <h2 className="font-display text-2xl font-semibold mb-1" style={{ color: 'var(--ink)' }}>Get started</h2>
          <p className="text-sm mb-7" style={{ color: 'var(--ink-soft)' }}>Join AutoMed Visa as a worker or employer</p>

          {error && (
            <div className="text-sm rounded px-3.5 py-2.5 mb-4" style={{ background: 'var(--risk-critical-bg)', color: 'var(--risk-critical)' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="text-xs font-mono uppercase tracking-wide mb-1.5 block" style={{ color: 'var(--ink-soft)' }}>Full name</label>
              <input name="name" value={form.name} onChange={handleChange} required
                className="input-field w-full px-3.5 py-2.5 text-sm" />
            </div>
            <div>
              <label className="text-xs font-mono uppercase tracking-wide mb-1.5 block" style={{ color: 'var(--ink-soft)' }}>Email</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} required
                className="input-field w-full px-3.5 py-2.5 text-sm" />
            </div>
            <div>
              <label className="text-xs font-mono uppercase tracking-wide mb-1.5 block" style={{ color: 'var(--ink-soft)' }}>Phone (optional)</label>
              <input name="phone" value={form.phone} onChange={handleChange}
                className="input-field w-full px-3.5 py-2.5 text-sm" />
            </div>
            <div>
              <label className="text-xs font-mono uppercase tracking-wide mb-1.5 block" style={{ color: 'var(--ink-soft)' }}>Password</label>
              <input name="password" type="password" value={form.password} onChange={handleChange} required minLength={6}
                className="input-field w-full px-3.5 py-2.5 text-sm" />
            </div>
            <div>
              <label className="text-xs font-mono uppercase tracking-wide mb-1.5 block" style={{ color: 'var(--ink-soft)' }}>I am a</label>
              <select name="role" value={form.role} onChange={handleChange}
                className="input-field w-full px-3.5 py-2.5 text-sm">
                <option value="worker">Worker</option>
                <option value="employer">Employer</option>
              </select>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-2.5 text-sm mt-2">
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <p className="text-sm mt-7" style={{ color: 'var(--ink-soft)' }}>
            Already registered? <Link to="/login" className="font-medium" style={{ color: 'var(--gold)' }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
