import React, { useState, useRef, useEffect } from 'react';

const FAQS = [
  { keywords: ['risk score', 'score', 'risk'], answer: 'The risk score (0–100) shows how closely your job title matches what your visa category allows. 0–24 is Low, 25–49 Medium, 50–74 High, 75+ Critical.' },
  { keywords: ['visa code', 'code'], answer: 'The visa code comes from your visa document — e.g. UAE-DRV-01 for a Light Motor Vehicle Driver visa. It tells us which job roles are legally allowed under that visa.' },
  { keywords: ['mismatch', 'flagged', 'critical'], answer: "A mismatch means your job offer title doesn't closely match any role your visa category permits. Talk to your agent or employer before travelling — this can cause deportation at the destination." },
  { keywords: ['admin', 'dashboard'], answer: "The admin dashboard lists every worker's submission with its risk level, so an employer or agency can review flagged cases before travel." },
  { keywords: ['email', 'notification'], answer: 'After you submit, we email your verification result and risk score to the address you registered with.' },
  { keywords: ['history', 'past', 'previous'], answer: 'Your past submissions are listed under "Your submission history" on the Submit page.' }
];

const FALLBACK = "I'm a simple FAQ assistant — I can answer questions about risk scores, visa codes, mismatches, and how AutoMed Visa works. Try asking one of those!";

function getAnswer(question) {
  const q = question.toLowerCase();
  const hit = FAQS.find((faq) => faq.keywords.some((k) => q.includes(k)));
  return hit ? hit.answer : FALLBACK;
}

export default function ChatAssistant() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [unread, setUnread] = useState(1);
  const [messages, setMessages] = useState([
    { from: 'bot', text: 'Hi! Ask me about risk scores, visa codes, or how a mismatch is detected.' }
  ]);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  function handleToggle() {
    setOpen((o) => !o);
    setUnread(0);
  }

  function handleSend(e) {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    const answer = getAnswer(text);
    setMessages((m) => [...m, { from: 'user', text }, { from: 'bot', text: answer }]);
    setInput('');
  }

  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 50, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
      <style>{`
        @keyframes vg-pulse {
          0% { transform: scale(1); opacity: 0.5; }
          70% { transform: scale(1.5); opacity: 0; }
          100% { opacity: 0; }
        }
        .vg-chat-btn {
          width: 60px; height: 60px; border-radius: 50%; border: none; cursor: pointer;
          position: relative; display: flex; align-items: center; justify-content: center;
          background: linear-gradient(145deg, #1c2c47, #16233a);
          box-shadow: 0 8px 24px rgba(22,35,58,0.4), inset 0 1px 1px rgba(255,255,255,0.08);
          transition: transform 0.25s cubic-bezier(.34,1.56,.64,1), box-shadow 0.25s ease;
        }
        .vg-chat-btn:hover { transform: translateY(-3px) scale(1.05); box-shadow: 0 14px 28px rgba(22,35,58,0.5); }
        .vg-chat-btn::before {
          content: ""; position: absolute; inset: -5px; border-radius: 50%;
          background: conic-gradient(from 0deg, #c8912f, #16233a, #c8912f);
          opacity: 0; filter: blur(6px); transition: opacity 0.3s ease; z-index: -1;
        }
        .vg-chat-btn:hover::before { opacity: 0.55; }
        .vg-pulse-ring { position: absolute; inset: 0; border-radius: 50%; border: 2px solid #c8912f; opacity: 0; animation: vg-pulse 2.6s ease-out infinite; }
        .vg-badge {
          position: absolute; top: -3px; right: -3px; background: #c8912f; color: #16233a;
          font-size: 10px; font-weight: 700; width: 18px; height: 18px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center; border: 2px solid var(--paper);
        }
        .vg-tooltip {
          position: absolute; right: 70px; top: 50%; transform: translateY(-50%) translateX(6px);
          background: var(--ink); color: var(--paper); padding: 7px 12px; border-radius: 8px;
          font-size: 12px; font-weight: 500; white-space: nowrap; opacity: 0; pointer-events: none;
          transition: opacity 0.2s ease, transform 0.2s ease; box-shadow: 0 6px 16px rgba(0,0,0,0.25);
        }
        .vg-chat-widget:hover .vg-tooltip { opacity: 1; transform: translateY(-50%) translateX(0); }
      `}</style>

      {open && (
        <div className="paper-card mb-3" style={{ width: 300, maxHeight: 380, display: 'flex', flexDirection: 'column' }}>
          <div className="px-4 py-3 dotted-rule flex items-center justify-between" style={{ borderTop: 'none' }}>
            <span className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>AutoMed Visa · Help</span>
            <button onClick={() => setOpen(false)} className="text-sm" style={{ color: 'var(--ink-soft)' }}>✕</button>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {messages.map((m, i) => (
              <div key={i} style={{ alignSelf: m.from === 'bot' ? 'flex-start' : 'flex-end', background: m.from === 'bot' ? 'var(--paper)' : 'var(--ink)', color: m.from === 'bot' ? 'var(--ink)' : 'var(--paper)', borderRadius: 8, padding: '6px 10px', fontSize: 13, maxWidth: '85%' }}>
                {m.text}
              </div>
            ))}
            <div ref={endRef} />
          </div>
          <form onSubmit={handleSend} className="px-3 py-2.5 dotted-rule flex gap-2">
            <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask a question…" className="input-field flex-1 px-2.5 py-1.5 text-xs" />
            <button type="submit" className="btn-primary px-3 py-1.5 text-xs">Send</button>
          </form>
        </div>
      )}

      <div className="vg-chat-widget" style={{ position: 'relative' }}>
        <div className="vg-tooltip">Ask AutoMed Visa</div>
        <button className="vg-chat-btn" onClick={handleToggle} aria-label="Open chat">
          {!open && <span className="vg-pulse-ring" />}
          {open ? (
            <span style={{ color: '#f6f5f1', fontSize: 20 }}>✕</span>
          ) : (
            <svg viewBox="0 0 24 24" width="26" height="26" stroke="#f6f5f1" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
            </svg>
          )}
          {!open && unread > 0 && <span className="vg-badge">{unread}</span>}
        </button>
      </div>
    </div>
  );
}
