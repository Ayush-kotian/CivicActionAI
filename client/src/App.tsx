import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { LandingPage } from './pages/LandingPage';
import { SubmitReport } from './pages/SubmitReport';
import { CitizenTrack } from './pages/CitizenTrack';
import { AdminDashboard } from './pages/AdminDashboard';
import { ReportDetail } from './pages/ReportDetail';
import { HotspotsPage } from './pages/HotspotsPage';
import { MyComplaints } from './pages/MyComplaints';
import { CitizenAuthModal } from './components/CitizenAuthModal';
import { getStoredUser, removeAuthToken } from './services/api';
import type { User } from './types';

export function App() {
  const [currentView, setCurrentView] = useState<string>('home');
  const [viewParam, setViewParam] = useState<string>('');

  // Authentication state
  const [currentUser, setCurrentUser] = useState<User | null>(getStoredUser());
  const [citizenAuthOpen, setCitizenAuthOpen] = useState(false);

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

  const handleSignOut = () => {
    removeAuthToken();
    setCurrentUser(null);
    if (currentView === 'my-complaints' || currentView === 'admin') {
      navigateTo('home');
    }
  };

  const handleAdminLogin = (adminUser: User) => {
    setCurrentUser(adminUser);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-900">
      <Navbar
        currentView={currentView}
        onNavigate={navigateTo}
        currentUser={currentUser}
        onOpenCitizenAuth={() => setCitizenAuthOpen(true)}
        onSignOut={handleSignOut}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
        {currentView === 'home' && <LandingPage onNavigate={navigateTo} />}
        {currentView === 'report' && (
          <SubmitReport
            onNavigate={navigateTo}
            onOpenAuth={() => setCitizenAuthOpen(true)}
            currentUser={currentUser}
          />
        )}
        {currentView === 'track' && (
          <CitizenTrack initialComplaintId={viewParam} onNavigate={navigateTo} />
        )}
        {currentView === 'my-complaints' && (
          <MyComplaints
            onNavigate={navigateTo}
            onOpenAuth={() => setCitizenAuthOpen(true)}
            currentUser={currentUser}
          />
        )}
        {currentView === 'admin' && (
          <AdminDashboard
            onNavigate={navigateTo}
            currentUser={currentUser}
            onAdminLogin={handleAdminLogin}
          />
        )}
        {currentView === 'report-detail' && (
          <ReportDetail complaintId={viewParam} onNavigate={navigateTo} />
        )}
        {currentView === 'hotspots' && <HotspotsPage onNavigate={navigateTo} />}
      </main>

      <Footer />

      {/* Citizen Sign In / Sign Up Modal */}
      <CitizenAuthModal
        isOpen={citizenAuthOpen}
        onClose={() => setCitizenAuthOpen(false)}
        onSuccess={(u) => {
          setCurrentUser(u);
          if (u.role === 'citizen') {
            if (currentView === 'report') {
              navigateTo('report');
            } else {
              navigateTo('my-complaints');
            }
          }
        }}
      />
    </div>
  );
}

export default App;
