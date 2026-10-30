import React, { useState } from 'react';
import {
  Building2,
  FilePlus2,
  Search,
  LayoutDashboard,
  Flame,
  Menu,
  X,
  Sparkles
} from 'lucide-react';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string, param?: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { key: 'home', label: 'Home', icon: Building2 },
    { key: 'report', label: 'Report Issue', icon: FilePlus2, highlight: true },
    { key: 'track', label: 'Track Status', icon: Search },
    { key: 'admin', label: 'Authority Desk', icon: LayoutDashboard },
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
          <nav className="hidden md:flex items-center gap-1.5" aria-label="Main Navigation">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = currentView === link.key;
              if (link.highlight) {
                return (
                  <button
                    key={link.key}
                    type="button"
                    onClick={() => handleLinkClick(link.key)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition ml-2 hover:shadow"
                  >
                    <Icon className="w-4 h-4" />
                    <span>{link.label}</span>
                  </button>
                );
              }
              return (
                <button
                  key={link.key}
                  type="button"
                  onClick={() => handleLinkClick(link.key)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition ${
                    isActive
                      ? 'bg-slate-100 text-blue-700 border border-slate-300/60'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
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
