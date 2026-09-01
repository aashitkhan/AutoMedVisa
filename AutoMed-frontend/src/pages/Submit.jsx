import React, { useEffect, useState } from 'react';
import api from '../api';
import Navbar from '../components/Navbar';
import Seal from '../components/Seal';
import { extractTextFromFile, parseDocumentFields } from '../utils/ocr';

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

export default function Submit() {
  const [form, setForm] = useState({ submittedJobTitle: '', visaCode: '', country: 'UAE' });
  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
  const MAX_SIZE = 5 * 1024 * 1024;

  const [ocrStatus, setOcrStatus] = useState('idle'); // idle | scanning | filled | not-found | error
  const [ocrNote, setOcrNote] = useState('');

  function handleFileChange(e) {
    const selected = e.target.files[0];
    setFileError('');
    setOcrStatus('idle');
    setOcrNote('');
    if (!selected) { setFile(null); return; }
    if (!ALLOWED_TYPES.includes(selected.type)) {
      setFileError('Only PDF, JPG, or PNG files are allowed');
      setFile(null);
      return;
    }
    if (selected.size > MAX_SIZE) {
      setFileError('File must be under 5MB');
      setFile(null);
      return;
    }
    setFile(selected);
    runOcr(selected);
  }

  async function runOcr(selected) {
    setOcrStatus('scanning');
    try {
      const text = await extractTextFromFile(selected);
      const { jobTitle, visaCode } = parseDocumentFields(text);
      if (jobTitle || visaCode) {
        setForm((f) => ({
          ...f,
          submittedJobTitle: jobTitle || f.submittedJobTitle,
          visaCode: visaCode || f.visaCode,
        }));
        setOcrStatus('filled');
        setOcrNote(
          jobTitle && visaCode
            ? 'Job title and visa code auto-filled from the document — please verify.'
            : jobTitle
            ? 'Job title auto-filled from the document — please verify, and enter the visa code manually.'
            : 'Visa code auto-filled from the document — please verify, and enter the job title manually.'
        );
      } else {
        setOcrStatus('not-found');
        setOcrNote("Couldn't confidently read the job title/visa code — please enter them manually.");
      }
    } catch (err) {
      setOcrStatus('error');
      setOcrNote('OCR scan failed — please enter the details manually.');
    }
  }

  useEffect(() => {
    loadHistory();
  }, []);

  async function loadHistory() {
    setHistoryLoading(true);
    try {
      const res = await api.get('/verification/me');
      setHistory(res.data);
    } catch (err) {
      // silent — history is a secondary feature
    } finally {
      setHistoryLoading(false);
    }
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setResult(null);
    setLoading(true);
    try {
      const data = new FormData();
      data.append('submittedJobTitle', form.submittedJobTitle);
      data.append('visaCode', form.visaCode);
      data.append('country', form.country);
      if (file) data.append('document', file);

      const res = await api.post('/verification', data);
      setResult(res.data);
      setFile(null);
      loadHistory();
    } catch (err) {
      setError(err.response?.data?.message || 'Submission failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen paper-bg">
      <Navbar />

      <div className="texture-bg">
        <div className="max-w-3xl mx-auto px-6 pt-10 pb-20">
          <p className="eyebrow mb-2">Document check</p>
          <h1 className="font-display text-2xl font-semibold mb-1 text-[#f6f5f1]">
            Submit for verification
          </h1>
          <p className="text-sm text-[#c3cad9]">
            Enter the job title from your offer letter and the visa code from your visa document.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 -mt-12 pb-10">

        <div className="grid md:grid-cols-5 gap-6">
          <div className="md:col-span-3 paper-card p-6">
            {error && (
              <div className="text-sm rounded px-3.5 py-2.5 mb-4" style={{ background: 'var(--risk-critical-bg)', color: 'var(--risk-critical)' }}>
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="text-xs font-mono uppercase tracking-wide mb-1.5 block" style={{ color: 'var(--ink-soft)' }}>
                  Visa document (optional — PDF, JPG, PNG, max 5MB)
                </label>
                <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileChange}
                  className="w-full text-sm file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-mono file:uppercase file:tracking-wide file:bg-[var(--ink)] file:text-[var(--paper)] file:cursor-pointer cursor-pointer"
                  style={{ color: 'var(--ink-soft)' }} />
                {file && ocrStatus !== 'scanning' && <p className="text-xs mt-1" style={{ color: 'var(--risk-low)' }}>✓ {file.name}</p>}
                {fileError && <p className="text-xs mt-1" style={{ color: 'var(--risk-critical)' }}>{fileError}</p>}
                {ocrStatus === 'scanning' && (
                  <p className="text-xs mt-1.5 flex items-center gap-1.5" style={{ color: 'var(--gold, #c8912f)' }}>
                    <span className="inline-block w-2.5 h-2.5 rounded-full animate-pulse" style={{ background: '#c8912f' }} />
                    Scanning document with OCR…
                  </p>
                )}
                {ocrStatus === 'filled' && (
                  <p className="text-xs mt-1.5" style={{ color: 'var(--risk-low)' }}>✓ {ocrNote}</p>
                )}
                {(ocrStatus === 'not-found' || ocrStatus === 'error') && (
                  <p className="text-xs mt-1.5" style={{ color: 'var(--risk-medium)' }}>{ocrNote}</p>
                )}
              </div>
              <div>
                <label className="text-xs font-mono uppercase tracking-wide mb-1.5 block" style={{ color: 'var(--ink-soft)' }}>
                  Job title (offer letter)
                </label>
                <input name="submittedJobTitle" placeholder="e.g. Auto Mechanic" value={form.submittedJobTitle}
                  onChange={handleChange} required className="input-field w-full px-3.5 py-2.5 text-sm" />
              </div>
              <div>
                <label className="text-xs font-mono uppercase tracking-wide mb-1.5 block" style={{ color: 'var(--ink-soft)' }}>
                  Visa code (visa document)
                </label>
                <input name="visaCode" placeholder="e.g. UAE-DRV-01" value={form.visaCode}
                  onChange={handleChange} required className="input-field w-full px-3.5 py-2.5 text-sm font-mono" />
              </div>
              <div>
                <label className="text-xs font-mono uppercase tracking-wide mb-1.5 block" style={{ color: 'var(--ink-soft)' }}>
                  Destination country
                </label>
                <select name="country" value={form.country} onChange={handleChange}
                  className="input-field w-full px-3.5 py-2.5 text-sm">
                  <option value="UAE">UAE</option>
                  <option value="Saudi Arabia">Saudi Arabia</option>
                  <option value="Qatar">Qatar</option>
                </select>
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full py-2.5 text-sm mt-2">
                {loading ? 'Verifying…' : 'Verify my documents'}
              </button>
            </form>
          </div>

          <div className="md:col-span-2">
            {loading ? (
              <div className="paper-card p-6 h-full flex flex-col items-center text-center justify-center gap-4">
                <Seal scanning />
                <p className="text-sm" style={{ color: 'var(--ink-soft)' }}>Cross-checking job title against visa category…</p>
              </div>
            ) : result ? (
              <div className="paper-card p-6 h-full flex flex-col items-center text-center justify-center gap-4">
                <Seal score={result.riskScore} level={result.riskLevel} />
                <div>
                  <p className="font-display font-semibold" style={{ color: RISK_TEXT_VAR[result.riskLevel] }}>
                    {result.isMatch ? 'Match verified' : 'Mismatch detected'}
                  </p>
                  {result.matchedVisaCategory && (
                    <p className="text-xs mt-1" style={{ color: 'var(--ink-soft)' }}>{result.matchedVisaCategory}</p>
                  )}
                </div>
                {result.mismatchReasons?.length > 0 && (
                  <ul className="text-xs text-left space-y-1.5 w-full dotted-rule pt-3" style={{ color: 'var(--ink-soft)' }}>
                    {result.mismatchReasons.map((r, i) => <li key={i}>· {r}</li>)}
                  </ul>
                )}
              </div>
            ) : (
              <div className="paper-card p-6 h-full flex items-center justify-center text-center">
                <p className="text-sm" style={{ color: 'var(--ink-soft)' }}>
                  Your verification seal will appear here once submitted.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-10">
          <p className="eyebrow mb-3">Your submission history</p>
          <div className="paper-card overflow-hidden">
            {historyLoading ? (
              <p className="text-sm p-5" style={{ color: 'var(--ink-soft)' }}>Loading…</p>
            ) : history.length === 0 ? (
              <p className="text-sm p-5" style={{ color: 'var(--ink-soft)' }}>No submissions yet.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="dotted-rule" style={{ color: 'var(--ink-soft)' }}>
                    <th className="text-left font-medium px-5 py-2.5 text-xs font-mono uppercase tracking-wide">Job title</th>
                    <th className="text-left font-medium px-5 py-2.5 text-xs font-mono uppercase tracking-wide">Visa code</th>
                    <th className="text-left font-medium px-5 py-2.5 text-xs font-mono uppercase tracking-wide">Risk</th>
                    <th className="text-left font-medium px-5 py-2.5 text-xs font-mono uppercase tracking-wide">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((h) => (
                    <tr key={h._id} className="dotted-rule">
                      <td className="px-5 py-3">{h.submittedJobTitle}</td>
                      <td className="px-5 py-3 font-mono text-xs">{h.visaCode}</td>
                      <td className="px-5 py-3">
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full"
                          style={{ background: RISK_BG_VAR[h.riskLevel], color: RISK_TEXT_VAR[h.riskLevel] }}>
                          {h.riskLevel}
                        </span>
                      </td>
                      <td className="px-5 py-3 font-mono">{h.riskScore}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
