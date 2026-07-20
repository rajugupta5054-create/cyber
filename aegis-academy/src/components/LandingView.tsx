import { motion } from "motion/react";
import {
  ArrowRight,
  Radar,
  Phone,
  ShieldCheck,
  Globe,
  Cpu,
  Eye,
  Lock,
} from "lucide-react";
import { AppTab } from "../types";
import Ferrofluid from "./Ferrofluid";

interface LandingViewProps {
  onNavigate: (tab: AppTab) => void;
}

export default function LandingView({ onNavigate }: LandingViewProps) {
  const features = [
    {
      icon: <Globe className="w-8 h-8" />,
      color: "primary",
      title: "Passive Data Collection",
      desc: "IP address, browser fingerprint, OS, screen resolution, and timezone are captured automatically — no permission needed.",
      badge: "Always Active",
      badgeColor: "bg-error/20 text-error border-error/30",
    },
    {
      icon: <Radar className="w-8 h-8" />,
      color: "secondary",
      title: "Live Location Demo",
      desc: "See exactly how a tracking link works. Consent-based geolocation sharing with a real-time live map powered by your browser.",
      badge: "Interactive",
      badgeColor: "bg-primary/20 text-primary border-primary/30",
    },
    {
      icon: <Phone className="w-8 h-8" />,
      color: "tertiary",
      title: "Phone Number Analysis",
      desc: "Discover what a phone number really reveals — country, carrier, line type — and what it absolutely cannot reveal (live GPS location).",
      badge: "Educational",
      badgeColor: "bg-tertiary/20 text-tertiary border-tertiary/30",
    },
    {
      icon: <ShieldCheck className="w-8 h-8" />,
      color: "primary",
      title: "Protection Guide",
      desc: "Actionable defence steps: VPN usage, denying location permissions, link safety, private browsing, and app permission audits.",
      badge: "Action Required",
      badgeColor: "bg-secondary/20 text-secondary border-secondary/30",
    },
  ];

  const threatCards = [
    { icon: "🌐", label: "IP Address", id: "tc-ip" },
    { icon: "🖥️", label: "Browser / OS", id: "tc-browser" },
    { icon: "🗣️", label: "Language", id: "tc-lang" },
    { icon: "🕐", label: "Timezone", id: "tc-tz" },
    { icon: "📐", label: "Screen Size", id: "tc-screen" },
    { icon: "📍", label: "GPS (with consent)", id: "tc-gps" },
  ];

  return (
    <div className="relative min-h-screen">
      <div className="absolute inset-0 z-[-1] overflow-hidden">
        <Ferrofluid
          colors={["#06B6D4", "#8B5CF6", "#0F172A"]}
          speed={0.5}
          scale={1}
          turbulence={1}
          fluidity={0.1}
          rimWidth={0.2}
          sharpness={3}
          shimmer={1}
          glow={2}
          flowDirection="down"
          opacity={1}
          mouseInteraction={true}
          mouseStrength={1}
          mouseRadius={0.3}
        />
      </div>
      {/* Hero Section */}
      <section className="relative max-w-7xl mx-auto text-center pt-8 pb-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-error/10 border border-error/25 text-error font-mono text-xs uppercase tracking-widest mb-10 font-semibold"
        >
          <span className="w-2 h-2 rounded-full bg-error animate-pulse"></span>
          Cybersecurity Education Project
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="font-display text-4xl md:text-7xl font-extrabold leading-[1.1] mb-6 tracking-tight max-w-5xl mx-auto"
        >
          What Can a Website{" "}
          <br className="hidden md:block" />
          <span className="bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent glow-text">
            Know About You?
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="font-sans text-base md:text-lg text-on-surface-variant max-w-2xl mx-auto mb-10 opacity-90 leading-relaxed"
        >
          This tool demonstrates exactly what data your browser exposes when you visit any website.
          Understanding the attack surface is the first step to defending against it.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.45 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <button
            onClick={() => onNavigate("location-demo")}
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-primary to-secondary text-on-primary font-bold text-base shadow-[0_0_25px_rgba(164,201,255,0.25)] hover:scale-105 transition-transform cursor-pointer"
          >
            ▶ Run the Demo
          </button>
          <button
            onClick={() => onNavigate("protection-guide")}
            className="w-full sm:w-auto px-8 py-4 rounded-xl border border-white/10 hover:border-primary/40 text-primary font-bold text-base hover:bg-primary/5 transition-all cursor-pointer"
          >
            How to Protect Myself <ArrowRight className="w-4 h-4 inline ml-1" />
          </button>
        </motion.div>

        {/* Threat Data Cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mt-16"
        >
          {threatCards.map((card, i) => (
            <div
              key={card.id}
              className="glass-card rounded-xl p-4 flex flex-col items-center text-center gap-2"
            >
              <span className="text-2xl">{card.icon}</span>
              <span className="font-mono text-[10px] text-on-surface-variant uppercase tracking-wider leading-tight">
                {card.label}
              </span>
              <span className="font-mono text-[9px] text-primary/70">
                {i < 5 ? "Scanning..." : "Consent-based"}
              </span>
            </div>
          ))}
        </motion.div>
      </section>

      {/* How It Works */}
      <section className="max-w-7xl mx-auto px-0 md:px-0 mb-24">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-4">
          <div>
            <h2 className="font-display text-2xl md:text-3xl font-semibold text-primary mb-2">
              How Tracking Works
            </h2>
            <p className="text-on-surface-variant text-sm md:text-base opacity-80">
              Three categories of data collection — passive, active, and illusory
            </p>
          </div>
          <div className="hidden md:block h-px flex-grow mx-8 bg-gradient-to-r from-white/10 via-white/5 to-transparent"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Passive */}
          <div className="glass-card p-6 md:p-8 rounded-2xl flex flex-col justify-between group">
            <div>
              <div className="w-14 h-14 rounded-xl bg-error/10 flex items-center justify-center text-error mb-6 group-hover:scale-110 transition-transform">
                <Eye className="w-8 h-8" />
              </div>
              <h3 className="font-display text-xl font-semibold text-on-surface mb-3">
                Passive Collection
              </h3>
              <p className="text-on-surface-variant text-sm mb-8 leading-relaxed opacity-85">
                IP address, browser type, OS, screen size and timezone are captured{" "}
                <strong className="text-on-surface">automatically</strong> — no permission needed.
                This happens the moment you load a page.
              </p>
            </div>
            <button
              onClick={() => onNavigate("location-demo")}
              className="inline-flex items-center text-error font-bold text-sm hover:translate-x-2 transition-transform text-left cursor-pointer"
            >
              See Live Demo <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          </div>

          {/* Active */}
          <div className="glass-card p-6 md:p-8 rounded-2xl flex flex-col justify-between group">
            <div>
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                <Radar className="w-8 h-8" />
              </div>
              <h3 className="font-display text-xl font-semibold text-on-surface mb-3">
                Active Permission
              </h3>
              <p className="text-on-surface-variant text-sm mb-8 leading-relaxed opacity-85">
                Precise GPS location requires a{" "}
                <strong className="text-on-surface">browser permission prompt</strong>. Attackers
                disguise requests inside fake delivery or banking pages to trick you into clicking
                "Allow".
              </p>
            </div>
            <button
              onClick={() => onNavigate("location-demo")}
              className="inline-flex items-center text-primary font-bold text-sm hover:translate-x-2 transition-transform text-left cursor-pointer"
            >
              Try the Simulation <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          </div>

          {/* Phone myth */}
          <div className="glass-card p-6 md:p-8 rounded-2xl flex flex-col justify-between group">
            <div>
              <div className="w-14 h-14 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary mb-6 group-hover:scale-110 transition-transform">
                <Phone className="w-8 h-8" />
              </div>
              <h3 className="font-display text-xl font-semibold text-on-surface mb-3">
                Phone Number Myth
              </h3>
              <p className="text-on-surface-variant text-sm mb-8 leading-relaxed opacity-85">
                A phone number reveals only the{" "}
                <strong className="text-on-surface">SIM registration country</strong> and carrier.
                It is <strong className="text-on-surface">impossible</strong> to retrieve a live GPS
                location from a phone number alone.
              </p>
            </div>
            <button
              onClick={() => onNavigate("phone-lookup")}
              className="inline-flex items-center text-secondary font-bold text-sm hover:translate-x-2 transition-transform text-left cursor-pointer"
            >
              Analyse a Number <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          </div>
        </div>
      </section>

      {/* Feature Overview */}
      <section id="modules-catalog" className="max-w-7xl mx-auto mb-28">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-4">
          <div>
            <h2 className="font-display text-2xl md:text-3xl font-semibold text-primary mb-2">
              Explore GeoTrace
            </h2>
            <p className="text-on-surface-variant text-sm md:text-base opacity-80">
              Interactive tools and guides to understand and defend against location tracking
            </p>
          </div>
          <div className="hidden md:block h-px flex-grow mx-8 bg-gradient-to-r from-white/10 via-white/5 to-transparent"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-6 md:p-8 rounded-2xl flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between mb-6">
                  <div
                    className={`w-14 h-14 rounded-xl bg-${f.color}/10 flex items-center justify-center text-${f.color} group-hover:scale-110 transition-transform`}
                  >
                    {f.icon}
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider border font-mono ${f.badgeColor}`}
                  >
                    {f.badge}
                  </span>
                </div>
                <h3 className="font-display text-xl font-semibold text-on-surface mb-3">
                  {f.title}
                </h3>
                <p className="text-on-surface-variant text-sm mb-6 leading-relaxed opacity-85">
                  {f.desc}
                </p>
              </div>
              <div className="flex items-center justify-between border-t border-white/5 pt-4">
                <span className="font-mono text-[10px] text-on-surface-variant/50">
                  Interactive Module
                </span>
                <ArrowRight className="w-5 h-5 text-primary opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Stats Banner */}
      <section className="max-w-7xl mx-auto mb-28">
        <div className="glass-panel rounded-2xl p-8 md:p-12 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { value: "100%", label: "Passive data collected silently", icon: <Eye className="w-5 h-5" /> },
            { value: "0%", label: "Phone GPS — impossible to retrieve", icon: <Phone className="w-5 h-5" /> },
            { value: "6+", label: "Data points exposed per visit", icon: <Cpu className="w-5 h-5" /> },
            { value: "100%", label: "Free & educational tool", icon: <Lock className="w-5 h-5" /> },
          ].map((s, i) => (
            <div key={i} className="text-center">
              <div className="flex justify-center text-primary mb-2 opacity-60">{s.icon}</div>
              <div className="font-display text-3xl md:text-4xl font-extrabold text-primary glow-text mb-1">
                {s.value}
              </div>
              <p className="font-mono text-[10px] text-on-surface-variant/70 uppercase tracking-wide leading-relaxed">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
