import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '../components/Logo';

export default function Welcome() {
  return (
    <div className="min-h-screen texture-bg flex flex-col">
      <header className="px-6 py-6 flex items-center gap-2.5">
        <Logo size={50} variant="light" />
        <span className="font-display font-semibold text-lg text-[#f6f5f1]">AutoMed Visa</span>
      </header>

      <main className="flex-1 flex items-center px-6">
        <div className="max-w-2xl mx-auto text-center">
          <p className="eyebrow mb-4">Automobile sector · migrant worker verification</p>
          <h1 className="font-display text-4xl sm:text-5xl leading-tight text-[#f6f5f1] mb-6">
            Make sure the visa<br />matches the job.
          </h1>
          <p className="text-[#c3cad9] text-base max-w-lg mx-auto leading-relaxed mb-10">
            AutoMed Visa cross-checks a migrant worker's job offer against their visa category
            before they travel, flagging mismatches with a weighted risk score — before it becomes
            a deportation, a lost wage, or a legal problem.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link to="/register"
              className="px-6 py-2.5 rounded text-sm font-medium"
              style={{ background: '#c8912f', color: '#16233a' }}>
              Get started
            </Link>
            <Link to="/login"
              className="px-6 py-2.5 rounded text-sm font-medium border"
              style={{ borderColor: 'rgba(246,245,241,0.3)', color: '#f6f5f1' }}>
              Sign in
            </Link>
          </div>
        </div>
      </main>

      <footer className="px-6 py-6 text-center">
        <p className="font-mono text-xs text-[#8b93a5]">Designed & Developed by Aashit Khan · 2026</p>
      </footer>
    </div>
  );
}
