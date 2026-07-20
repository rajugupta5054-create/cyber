import { useState } from "react";
import {
  Shield,
  Bell,
  Menu,
  X,
  Radar,
  Globe,
  Phone,
  Lock,
  LayoutDashboard,
  ShieldCheck,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import LightPillar from "./components/LightPillar";
import LandingView from "./components/LandingView";
import LocationDemoView from "./components/LocationDemoView";
import PhoneLookupView from "./components/PhoneLookupView";
import ProtectionGuideView from "./components/ProtectionGuideView";
import DashboardView from "./components/DashboardView";
import TopicDetailView from "./components/TopicDetailView";
import { AppTab } from "./types";

export default function App() {
  const [activeTab, setActiveTab] = useState<AppTab>("landing");
  const [activeTopicId, setActiveTopicId] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavigate = (tab: AppTab, topicId?: string) => {
    setActiveTab(tab);
    if (topicId) {
      setActiveTopicId(topicId);
    } else if (tab !== "topic-detail") {
      setActiveTopicId(null);
    }
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const navLinks: { tab: AppTab; label: string; icon: React.ReactNode }[] = [
    { tab: "location-demo", label: "Live Demo", icon: <Radar className="w-4 h-4" /> },
    { tab: "phone-lookup", label: "Phone Lookup", icon: <Phone className="w-4 h-4" /> },
    { tab: "protection-guide", label: "Protect Yourself", icon: <ShieldCheck className="w-4 h-4" /> },
    { tab: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
  ];

  const hasSidebar = activeTab !== "landing";

  const sidebarItems: { tab: AppTab; label: string; icon: React.ReactNode }[] = [
    { tab: "location-demo", label: "Live Demo", icon: <Radar className="w-4 h-4" /> },
    { tab: "phone-lookup", label: "Phone Lookup", icon: <Phone className="w-4 h-4" /> },
    { tab: "protection-guide", label: "Protect Yourself", icon: <Lock className="w-4 h-4" /> },
    { tab: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
  ];

  return (
    <div className="relative min-h-screen flex flex-col bg-background text-on-surface select-none overflow-hidden font-sans">
      {/* Background */}
      <div className="fixed inset-0 z-0 pointer-events-none bg-background">
        <LightPillar
          topColor="#5227FF"
          bottomColor="#FF9FFC"
          intensity={1}
          rotationSpeed={0.3}
          glowAmount={0.002}
          pillarWidth={3}
          pillarHeight={0.4}
          noiseIntensity={0.5}
          pillarRotation={25}
          interactive={false}
          mixBlendMode="normal"
          quality="high"
        />
        {/* Subtle overlay gradient to ensure text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/60 to-background/90 mix-blend-multiply"></div>
      </div>

      {/* Top Header Navigation */}
      <header className="fixed top-0 left-0 right-0 h-20 z-50 bg-surface/30 backdrop-blur-md border-b border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.2)]">
        <div className="flex justify-between items-center h-full px-6 md:px-12 max-w-7xl mx-auto">

          {/* Logo */}
          <div
            onClick={() => handleNavigate("landing")}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="relative">
              <div className="absolute -inset-1.5 bg-primary/20 blur-md rounded-full group-hover:bg-primary/45 transition-all"></div>
              <Shield className="w-8 h-8 text-primary relative drop-shadow-[0_0_8px_rgba(164,201,255,0.45)]" />
            </div>
            <div className="flex flex-col">
              <span className="font-display text-xl md:text-2xl font-bold tracking-tighter text-primary leading-none">
                GeoTrace
              </span>
              <span className="font-mono text-[9px] text-on-surface-variant/60 uppercase tracking-widest hidden md:block">
                Security Awareness Tool
              </span>
            </div>
          </div>

          {/* Desktop Nav links */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map(({ tab, label }) => (
              <button
                key={tab}
                onClick={() => handleNavigate(tab)}
                className={`font-display text-sm font-semibold tracking-wide transition-all cursor-pointer pb-1 border-b-2 ${
                  activeTab === tab
                    ? "text-primary border-primary"
                    : "text-on-surface-variant hover:text-on-surface border-transparent"
                }`}
              >
                {label}
              </button>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[10px] font-mono text-on-surface-variant">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              <span>SYSTEM ACTIVE</span>
            </div>
            <button className="p-2 text-on-surface-variant hover:text-primary hover:bg-white/5 rounded-full transition-all cursor-pointer">
              <Bell className="w-5 h-5" />
            </button>
            <button className="p-2 text-on-surface-variant hover:text-primary hover:bg-white/5 rounded-full transition-all cursor-pointer">
              <Globe className="w-5 h-5" />
            </button>

            {/* Mobile Menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-on-surface-variant hover:text-on-surface"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-x-0 top-20 z-40 bg-surface-dim border-b border-white/10 p-6 flex flex-col gap-4 shadow-2xl backdrop-blur-xl md:hidden"
          >
            {navLinks.map(({ tab, label, icon }) => (
              <button
                key={tab}
                onClick={() => handleNavigate(tab)}
                className={`w-full py-2.5 text-left font-display font-semibold flex items-center gap-3 ${
                  activeTab === tab ? "text-primary" : "text-on-surface-variant"
                }`}
              >
                {icon}
                {label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Body Content & Sidebar Layout */}
      <div className="flex-grow flex pt-20 relative z-10">

        {/* Dynamic Sidebar */}
        {hasSidebar && (
          <aside className="hidden lg:flex flex-col w-64 fixed left-0 top-20 bottom-0 bg-surface-dim/40 backdrop-blur-xl border-r border-white/10 p-6 flex-shrink-0 justify-between">
            <div className="space-y-6">
              {/* GeoTrace Brand mini */}
              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 border border-white/5">
                <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                  <Shield className="w-5 h-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="font-display font-bold text-primary text-sm truncate leading-tight">GeoTrace</p>
                  <p className="font-mono text-[9px] text-on-surface-variant opacity-70 leading-none mt-0.5">Security Awareness</p>
                </div>
              </div>

              {/* Sidenav navigation */}
              <nav className="space-y-1">
                {sidebarItems.map(({ tab, label, icon }) => (
                  <button
                    key={tab}
                    onClick={() => handleNavigate(tab)}
                    className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                      activeTab === tab
                        ? "bg-primary/10 text-primary border-r-4 border-primary font-bold"
                        : "text-on-surface-variant hover:bg-white/5 hover:text-on-surface"
                    }`}
                  >
                    {icon}
                    <span>{label}</span>
                  </button>
                ))}
              </nav>
            </div>

            {/* Bottom links */}
            <div className="space-y-1 border-t border-white/5 pt-4">
              <button
                onClick={() => handleNavigate("landing")}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-semibold text-on-surface-variant hover:text-primary transition-all cursor-pointer"
              >
                <Shield className="w-4 h-4" />
                <span>Back to Home</span>
              </button>
            </div>
          </aside>
        )}

        {/* Main content */}
        <main
          className={`flex-grow px-6 py-10 md:px-12 max-w-7xl mx-auto w-full transition-all duration-300 ${
            hasSidebar ? "lg:ml-64" : ""
          }`}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35, ease: "easeInOut" }}
            >
              {activeTab === "landing" && <LandingView onNavigate={handleNavigate} />}
              {activeTab === "location-demo" && <LocationDemoView />}
              {activeTab === "phone-lookup" && <PhoneLookupView />}
              {activeTab === "protection-guide" && <ProtectionGuideView onNavigate={handleNavigate} />}
              {activeTab === "dashboard" && <DashboardView onNavigate={handleNavigate} />}
              {activeTab === "topic-detail" && activeTopicId && (
                <TopicDetailView topicId={activeTopicId} onNavigate={handleNavigate} />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Global Footer */}
      <footer
        className={`w-full relative z-10 bg-surface-container-lowest/80 backdrop-blur-md mt-auto border-t border-white/5 transition-all duration-300 ${
          hasSidebar ? "lg:pl-64" : ""
        }`}
      >
        <div className="flex flex-col md:flex-row justify-between items-center px-6 md:px-12 py-8 max-w-7xl mx-auto gap-4">
          <div className="flex flex-col md:flex-row items-center gap-4 text-center md:text-left">
            <span className="font-mono text-xs text-primary font-semibold tracking-wider">GEOTRACE — DEFENSIVE SECURITY AWARENESS</span>
            <span className="hidden md:block text-on-surface-variant opacity-30">|</span>
            <span className="font-mono text-[11px] text-on-surface-variant opacity-60">
              © 2026 GeoTrace. For educational purposes only. System Status: Nominal
            </span>
          </div>
          <div className="flex flex-wrap justify-center gap-6 text-[11px] font-mono uppercase tracking-wider">
            <a href="#" className="text-on-surface-variant hover:text-primary transition-colors">Privacy Policy</a>
            <a href="#" className="text-on-surface-variant hover:text-primary transition-colors">About</a>
            <a href="#" className="text-on-surface-variant hover:text-primary transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
