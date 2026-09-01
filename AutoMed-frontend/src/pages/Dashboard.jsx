import React, { useEffect, useMemo, useState } from 'react';
import api from '../api';
import Navbar from '../components/Navbar';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell
} from 'recharts';

const RISK_TEXT_VAR = {
  Low: 'var(--risk-low)',
  Medium: 'var(--risk-medium)',
  High: 'var(--risk-high)',
  Critical: 'var(--risk-critical)'
};
const RISK_BG_VAR = {
  Low: 'var(--risk-low-bg)',
  Medium: 'var(--risk-medium-bg)',
  High: 'var(--risk-high-bg)',
  Critical: 'var(--risk-critical-bg)'
};
const RISK_HEX = { Low: '#2f6d4f', Medium: '#a17512', High: '#b5541c', Critical: '#a52323' };

export default function Dashboard() {
  const [records, setRecords] = useState([]);
  const [allRecords, setAllRecords] = useState([]); // unfiltered — powers the charts
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRecords();
  }, [filter]);

  useEffect(() => {
    api.get('/verification').then((res) => setAllRecords(res.data)).catch(() => {});
  }, [records]); // refresh chart data whenever the table refetches (keeps it current)

  async function fetchRecords() {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/verification', { params: filter ? { riskLevel: filter } : {} });
      setRecords(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load records');
    } finally {
      setLoading(false);
    }
  }

  const stats = useMemo(() => {
    const total = records.length;
    const flagged = records.filter((r) => !r.isMatch).length;
    const avgScore = total ? Math.round(records.reduce((s, r) => s + r.riskScore, 0) / total) : 0;
    const critical = records.filter((r) => r.riskLevel === 'Critical').length;
    return { total, flagged, avgScore, critical };
  }, [records]);

  const riskDistData = useMemo(() => {
    const levels = ['Low', 'Medium', 'High', 'Critical'];
    return levels.map((level) => ({
      name: level,
      count: allRecords.filter((r) => r.riskLevel === level).length
    }));
  }, [allRecords]);

  const visaCodeData = useMemo(() => {
    const counts = {};
    allRecords.forEach((r) => { counts[r.visaCode] = (counts[r.visaCode] || 0) + 1; });
    return Object.entries(counts)
      .map(([code, count]) => ({ code, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [allRecords]);

  return (
    <div className="min-h-screen paper-bg">
      <Navbar />

      <div className="texture-bg">
        <div className="max-w-5xl mx-auto px-6 pt-10 pb-16">
          <p className="eyebrow mb-2">Administrator</p>
          <h1 className="font-display text-2xl font-semibold text-[#f6f5f1]">
            Verification register
          </h1>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 -mt-10 pb-10">

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total submissions', value: stats.total },
            { label: 'Flagged mismatches', value: stats.flagged },
            { label: 'Critical risk', value: stats.critical },
            { label: 'Average risk score', value: stats.avgScore }
          ].map((s) => (
            <div key={s.label} className="paper-card p-4">
              <p className="text-xs font-mono uppercase tracking-wide mb-1.5" style={{ color: 'var(--ink-soft)' }}>{s.label}</p>
              <p className="font-display text-2xl font-semibold" style={{ color: 'var(--ink)' }}>{s.value}</p>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <div className="paper-card p-5">
            <p className="text-xs font-mono uppercase tracking-wide mb-3" style={{ color: 'var(--ink-soft)' }}>
              Risk level distribution
            </p>
            {allRecords.length === 0 ? (
              <p className="text-sm py-8 text-center" style={{ color: 'var(--ink-soft)' }}>No data yet</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={riskDistData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid stroke="var(--line)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--ink-soft)' }} axisLine={{ stroke: 'var(--line)' }} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: 'var(--ink-soft)' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: 'var(--paper-card)', border: '1px solid var(--line)', borderRadius: 4, fontSize: 12 }} />
                  <Bar dataKey="count" radius={[3, 3, 0, 0]}>
                    {riskDistData.map((entry) => (
                      <Cell key={entry.name} fill={RISK_HEX[entry.name]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="paper-card p-5">
            <p className="text-xs font-mono uppercase tracking-wide mb-3" style={{ color: 'var(--ink-soft)' }}>
              Top visa categories submitted
            </p>
            {allRecords.length === 0 ? (
              <p className="text-sm py-8 text-center" style={{ color: 'var(--ink-soft)' }}>No data yet</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={visaCodeData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid stroke="var(--line)" vertical={false} />
                  <XAxis dataKey="code" tick={{ fontSize: 10.5, fill: 'var(--ink-soft)' }} axisLine={{ stroke: 'var(--line)' }} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: 'var(--ink-soft)' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: 'var(--paper-card)', border: '1px solid var(--line)', borderRadius: 4, fontSize: 12 }} />
                  <Bar dataKey="count" fill="#c8912f" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="flex gap-2 mb-4">
          {['', 'Low', 'Medium', 'High', 'Critical'].map((level) => (
            <button key={level} onClick={() => setFilter(level)}
              className="px-3 py-1.5 rounded text-xs font-mono uppercase tracking-wide border"
              style={filter === level
                ? { background: 'var(--ink)', color: 'var(--paper)', borderColor: 'var(--ink)' }
                : { background: 'var(--paper-card)', color: 'var(--ink-soft)', borderColor: 'var(--line)' }}>
              {level || 'All'}
            </button>
          ))}
        </div>

        {error && (
          <div className="text-sm rounded px-3.5 py-2.5 mb-4" style={{ background: 'var(--risk-critical-bg)', color: 'var(--risk-critical)' }}>
            {error}
          </div>
        )}

        <div className="paper-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="dotted-rule" style={{ color: 'var(--ink-soft)' }}>
                <th className="text-left px-5 py-2.5 text-xs font-mono uppercase tracking-wide">Worker</th>
                <th className="text-left px-5 py-2.5 text-xs font-mono uppercase tracking-wide">Job title</th>
                <th className="text-left px-5 py-2.5 text-xs font-mono uppercase tracking-wide">Visa code</th>
                <th className="text-left px-5 py-2.5 text-xs font-mono uppercase tracking-wide">Match</th>
                <th className="text-left px-5 py-2.5 text-xs font-mono uppercase tracking-wide">Risk</th>
                <th className="text-left px-5 py-2.5 text-xs font-mono uppercase tracking-wide">Score</th>
                <th className="text-left px-5 py-2.5 text-xs font-mono uppercase tracking-wide">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="px-5 py-8 text-center" style={{ color: 'var(--ink-soft)' }}>Loading…</td></tr>
              ) : records.length === 0 ? (
                <tr><td colSpan={7} className="px-5 py-8 text-center" style={{ color: 'var(--ink-soft)' }}>No records found</td></tr>
              ) : (
                records.map((r) => (
                  <tr key={r._id} className="dotted-rule">
                    <td className="px-5 py-3">{r.worker?.name || '—'}</td>
                    <td className="px-5 py-3">{r.submittedJobTitle}</td>
                    <td className="px-5 py-3 font-mono text-xs">{r.visaCode}</td>
                    <td className="px-5 py-3">{r.isMatch ? '✓' : '✕'}</td>
                    <td className="px-5 py-3">
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full"
                        style={{ background: RISK_BG_VAR[r.riskLevel], color: RISK_TEXT_VAR[r.riskLevel] }}>
                        {r.riskLevel}
                      </span>
                    </td>
                    <td className="px-5 py-3 font-mono">{r.riskScore}</td>
                    <td className="px-5 py-3 capitalize">{r.status}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
