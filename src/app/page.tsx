'use client';

import GameShell from '../components/GameShell';
import ErrorBoundary from '../components/ErrorBoundary';

export default function Home() {
  return (
    <main className="min-h-screen w-full flex items-center justify-center bg-[#020202] md:py-8 overflow-hidden select-none">
      {/* Immersive background decoration */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] rounded-full bg-[#B1FA63]/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-[#B1FA63]/3 blur-[120px] pointer-events-none" />

      {/* Main Game Frame */}
      <ErrorBoundary>
        <GameShell />
      </ErrorBoundary>
    </main>
  );
}
