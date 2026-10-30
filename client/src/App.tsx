import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { LandingPage } from './pages/LandingPage';
import { SubmitReport } from './pages/SubmitReport';
import { CitizenTrack } from './pages/CitizenTrack';
import { AdminDashboard } from './pages/AdminDashboard';
import { ReportDetail } from './pages/ReportDetail';
import { HotspotsPage } from './pages/HotspotsPage';

export function App() {
  const [currentView, setCurrentView] = useState<string>('home');
  const [viewParam, setViewParam] = useState<string>('');

  // Synchronize with URL hash on initial mount and popstate
  useEffect(() => {
    const parseHash = () => {
      const hash = window.location.hash.replace('#', '') || 'home';
      const parts = hash.split('/');
      const view = parts[0] || 'home';
      const param = parts[1] || '';
      setCurrentView(view);
      setViewParam(param);
    };

    parseHash();
    window.addEventListener('popstate', parseHash);
    return () => window.removeEventListener('popstate', parseHash);
  }, []);

  const navigateTo = (view: string, param: string = '') => {
    setCurrentView(view);
    setViewParam(param);
    const newHash = param ? `#${view}/${param}` : `#${view}`;
    window.location.hash = newHash;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-900">
      <Navbar currentView={currentView} onNavigate={navigateTo} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
        {currentView === 'home' && <LandingPage onNavigate={navigateTo} />}
        {currentView === 'report' && <SubmitReport onNavigate={navigateTo} />}
        {currentView === 'track' && (
          <CitizenTrack initialComplaintId={viewParam} onNavigate={navigateTo} />
        )}
        {currentView === 'admin' && <AdminDashboard onNavigate={navigateTo} />}
        {currentView === 'report-detail' && (
          <ReportDetail complaintId={viewParam} onNavigate={navigateTo} />
        )}
        {currentView === 'hotspots' && <HotspotsPage onNavigate={navigateTo} />}
      </main>

      <Footer />
    </div>
  );
}

export default App;
