import React, { useState } from 'react';
import {
  Building2,
  FilePlus2,
  Search,
  LayoutDashboard,
  Flame,
  Menu,
  X,
  Sparkles,
  FileText,
  User as UserIcon,
  ShieldCheck,
  LogOut,
  LogIn
} from 'lucide-react';
import type { User } from '../types';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string, param?: string) => void;
  currentUser: User | null;
  onOpenCitizenAuth: () => void;
  onSignOut: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  currentUser,
  onOpenCitizenAuth,
  onSignOut
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { key: 'home', label: 'Home', icon: Building2 },
    { key: 'report', label: 'Report Issue', icon: FilePlus2, highlight: true },
    { key: 'track', label: 'Track Status', icon: Search },
    ...(currentUser?.role === 'citizen'
      ? [{ key: 'my-complaints', label: 'My Dashboard', icon: FileText }]
      : []),
    ...(currentUser?.role !== 'citizen'
      ? [{ key: 'admin', label: 'Authority Desk', icon: LayoutDashboard }]
      : []),
    { key: 'hotspots', label: 'Hotspots', icon: Flame }
  ];

  const handleLinkClick = (key: string) => {
    onNavigate(key);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Tagline */}
          <button
            type="button"
            onClick={() => handleLinkClick('home')}
            className="flex items-center gap-3 text-left focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg p-1"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center text-white shadow-sm">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900 tracking-tight text-lg sm:text-xl font-sans">
                  CivicAction<span className="text-blue-600">AI</span>
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-semibold bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200">
                  <Sparkles className="w-2.5 h-2.5" /> Civic Tech
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium tracking-tight -mt-0.5 hidden xs:block">
                From Complaints to Action
              </p>
            </div>
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            <nav className="flex items-center gap-1" aria-label="Main Navigation">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = currentView === link.key;
                if (link.highlight) {
                  return (
                    <button
                      key={link.key}
                      type="button"
                      onClick={() => handleLinkClick(link.key)}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition hover:shadow mr-1"
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{link.label}</span>
                    </button>
                  );
                }
                return (
                  <button
                    key={link.key}
                    type="button"
                    onClick={() => handleLinkClick(link.key)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      isActive
                        ? 'bg-slate-100 text-blue-700 border border-slate-300/60'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{link.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* User Session status / Login button */}
            <div className="pl-2 border-l border-slate-200 flex items-center gap-2">
              {currentUser ? (
                <div className="flex items-center gap-2">
                  {currentUser.role === 'admin' ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-50 text-purple-800 border border-purple-200 rounded-lg text-xs font-bold">
                      <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                      <span>Authority: {currentUser.name}</span>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleLinkClick('my-complaints')}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 rounded-lg text-xs font-semibold transition"
                      title="View My Complaints"
                    >
                      <UserIcon className="w-3.5 h-3.5 text-blue-600" />
                      <span>{currentUser.name}</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={onSignOut}
                    className="p-1.5 text-slate-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={onOpenCitizenAuth}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold border border-slate-200 transition"
                >
                  <LogIn className="w-3.5 h-3.5 text-slate-600" />
                  <span>Citizen Sign In</span>
                </button>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            {!currentUser && (
              <button
                type="button"
                onClick={onOpenCitizenAuth}
                className="px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-xs font-bold"
              >
                Sign In
              </button>
            )}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-2 shadow-lg animate-fade-in">
          {currentUser && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs mb-2">
              <div>
                <span className="font-bold text-slate-900 block">{currentUser.name}</span>
                <span className="text-[11px] text-slate-500 font-mono">
                  {currentUser.role === 'admin' ? 'Municipal Admin' : 'Citizen'} &bull; {currentUser.email}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  onSignOut();
                  setMobileMenuOpen(false);
                }}
                className="text-red-600 font-bold hover:underline"
              >
                Sign Out
              </button>
            </div>
          )}

          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = currentView === link.key;
            return (
              <button
                key={link.key}
                type="button"
                onClick={() => handleLinkClick(link.key)}
                className={`w-full flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-sm font-semibold transition ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-4 h-4 text-blue-600" />
                <span>{link.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
