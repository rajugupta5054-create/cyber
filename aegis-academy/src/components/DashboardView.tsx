import { useState, useEffect } from "react";
import {
  TrendingUp,
  Star,
  Globe,
  MapPin,
  Phone,
  ShieldCheck,
  Eye,
  Activity,
  Clock,
  CheckCircle2,
  Info,
  AlertTriangle,
  Lock,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { AppTab } from "../types";

interface DashboardViewProps {
  onNavigate: (tab: AppTab) => void;
}

export default function DashboardView({ onNavigate }: DashboardViewProps) {
  const [systemTime, setSystemTime] = useState("");
  const [ipInfo, setIpInfo] = useState<{ ip: string; country: string } | null>(null);
  const [loadingIp, setLoadingIp] = useState(true);
  const [scanCount, setScanCount] = useState(0);
  const [lookupCount, setLookupCount] = useState(0);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setSystemTime(now.toISOString().split("T")[1].split(".")[0] + " UTC");
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetch("https://api.ipify.org?format=json")
      .then((r) => r.json())
      .then((d) => {
        setIpInfo({ ip: d.ip, country: "Your Network" });
        setLoadingIp(false);
      })
      .catch(() => {
        setIpInfo({ ip: "Unavailable", country: "Unknown" });
        setLoadingIp(false);
      });
  }, []);

  const browserInfo = {
    browser: (() => {
      const ua = navigator.userAgent;
      if (ua.includes("Chrome") && !ua.includes("Edg")) return "Chrome";
      if (ua.includes("Firefox")) return "Firefox";
      if (ua.includes("Safari") && !ua.includes("Chrome")) return "Safari";
      if (ua.includes("Edg")) return "Edge";
      return "Unknown";
    })(),
    os: navigator.platform,
    language: navigator.language,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    screen: `${screen.width}×${screen.height}`,
    cookiesEnabled: navigator.cookieEnabled,
    doNotTrack: navigator.doNotTrack === "1",
  };

  const passiveDataItems = [
    { label: "IP Address", value: loadingIp ? "Scanning..." : (ipInfo?.ip ?? "—"), icon: <Globe className="w-4 h-4" />, status: "exposed" },
    { label: "Browser", value: browserInfo.browser, icon: <Eye className="w-4 h-4" />, status: "exposed" },
    { label: "OS / Platform", value: browserInfo.os, icon: <Activity className="w-4 h-4" />, status: "exposed" },
    { label: "Language", value: browserInfo.language, icon: <Globe className="w-4 h-4" />, status: "exposed" },
    { label: "Timezone", value: browserInfo.timezone, icon: <Clock className="w-4 h-4" />, status: "exposed" },
    { label: "Screen Size", value: browserInfo.screen, icon: <MapPin className="w-4 h-4" />, status: "exposed" },
    { label: "Cookies", value: browserInfo.cookiesEnabled ? "Enabled" : "Disabled", icon: <Lock className="w-4 h-4" />, status: browserInfo.cookiesEnabled ? "warning" : "safe" },
    { label: "Do Not Track", value: browserInfo.doNotTrack ? "On" : "Off", icon: <ShieldCheck className="w-4 h-4" />, status: browserInfo.doNotTrack ? "safe" : "warning" },
  ];

  const alerts = [
    {
      type: "info" as const,
      title: "Passive data collected",
      desc: "Your IP, browser, language, timezone, and screen size were captured the moment you loaded this page.",
      time: "Just now",
    },
    {
      type: "warning" as const,
      title: "GPS not shared",
      desc: 'Your precise location has NOT been collected. It requires your explicit "Allow" in the browser prompt.',
      time: "Just now",
    },
    {
      type: "info" as const,
      title: "Phone number tracking myth",
      desc: "Remember: a phone number cannot reveal live location. Avoid scam tracker websites.",
      time: "Educational",
    },
  ];

  const quickActions = [
    {
      label: "Run Live Demo",
      desc: "Simulate a tracking link with GPS",
      icon: <MapPin className="w-5 h-5" />,
      tab: "location-demo" as AppTab,
      color: "primary",
    },
    {
      label: "Phone Lookup",
      desc: "Analyse a phone number",
      icon: <Phone className="w-5 h-5" />,
      tab: "phone-lookup" as AppTab,
      color: "secondary",
    },
    {
      label: "Protection Guide",
      desc: "6 steps to secure yourself",
      icon: <ShieldCheck className="w-5 h-5" />,
      tab: "protection-guide" as AppTab,
      color: "tertiary",
    },
  ];

  return (
    <div className="relative">
      {/* Header */}
      <section className="mb-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="font-display text-4xl font-extrabold tracking-tight mb-2">
              Security Dashboard
            </h1>
            <div className="flex flex-wrap items-center gap-4">
              <span className="bg-primary/10 border border-primary/30 text-primary px-3 py-1 rounded-full font-mono text-[10px] uppercase tracking-[0.2em] flex items-center gap-2 font-semibold">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                GeoTrace Active
              </span>
              <span className="font-mono text-xs text-on-surface-variant/85">
                All data shown below was collected passively from your browser
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-on-surface-variant bg-surface-container/40 px-3 py-2 rounded-lg border border-white/5 font-mono text-xs">
            <Clock className="w-4 h-4 text-primary" />
            <span>System Time: {systemTime || "Loading..."}</span>
          </div>
        </div>
      </section>

      {/* Passive Data Bento Grid */}
      <section className="mb-12">
        <h2 className="font-mono text-xs text-on-surface-variant/70 uppercase tracking-widest mb-4 font-semibold">
          📡 Your Exposed Data — Collected Silently Right Now
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {passiveDataItems.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`glass-panel rounded-xl p-5 flex flex-col gap-3 ${
                item.status === "exposed"
                  ? "border-l-2 border-l-error/60"
                  : item.status === "warning"
                  ? "border-l-2 border-l-tertiary/60"
                  : "border-l-2 border-l-primary/60"
              }`}
            >
              <div
                className={`${
                  item.status === "exposed"
                    ? "text-error/60"
                    : item.status === "warning"
                    ? "text-tertiary/60"
                    : "text-primary/60"
                }`}
              >
                {item.icon}
              </div>
              <div>
                <p className="font-mono text-[9px] text-on-surface-variant/60 uppercase tracking-wider mb-1">
                  {item.label}
                </p>
                <p className="font-mono text-xs font-bold text-on-surface break-all leading-tight">
                  {item.value}
                </p>
              </div>
              <div
                className={`text-[9px] font-mono font-bold uppercase tracking-widest ${
                  item.status === "exposed"
                    ? "text-error/70"
                    : item.status === "warning"
                    ? "text-tertiary/70"
                    : "text-primary/70"
                }`}
              >
                {item.status === "exposed" ? "⚠ Exposed" : item.status === "warning" ? "⚡ Check" : "✓ Safe"}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Main Grid: Alerts + Quick Actions + Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
        {/* Intel Alerts Feed */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-semibold">Security Alerts</h2>
          </div>

          {alerts.map((alert, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`glass-panel p-5 rounded-xl flex items-start gap-4 border-l-4 ${
                alert.type === "info"
                  ? "border-l-primary"
                  : alert.type === "warning"
                  ? "border-l-tertiary"
                  : "border-l-error"
              }`}
            >
              <div
                className={`shrink-0 mt-0.5 ${
                  alert.type === "info" ? "text-primary" : "text-tertiary"
                }`}
              >
                {alert.type === "info" ? (
                  <Info className="w-5 h-5" />
                ) : (
                  <AlertTriangle className="w-5 h-5" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-bold text-on-surface">{alert.title}</p>
                  <span className="font-mono text-[9px] text-on-surface-variant/50">{alert.time}</span>
                </div>
                <p className="text-xs text-on-surface-variant/80 leading-relaxed">{alert.desc}</p>
              </div>
            </motion.div>
          ))}

          {/* Privacy score */}
          <div className="glass-panel rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="font-mono text-xs text-on-surface-variant/70 uppercase tracking-wider font-semibold">
                Your Privacy Score
              </p>
              <span className="font-display text-2xl font-bold text-tertiary">
                {browserInfo.doNotTrack ? "65" : "40"}
                <span className="text-sm text-on-surface-variant/50">/100</span>
              </span>
            </div>
            <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: browserInfo.doNotTrack ? "65%" : "40%" }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-error via-tertiary to-primary rounded-full"
              ></motion.div>
            </div>
            <p className="font-mono text-[10px] text-on-surface-variant/50 mt-2">
              Improve your score by enabling Do Not Track, using a VPN, and enabling HTTPS-only mode.
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <h2 className="font-display text-xl font-semibold">Quick Actions</h2>
          {quickActions.map((action) => (
            <button
              key={action.tab}
              onClick={() => onNavigate(action.tab)}
              className={`w-full glass-panel p-5 rounded-xl flex items-center gap-4 hover:bg-white/[0.04] transition-all border-l-4 border-l-${action.color} group cursor-pointer text-left`}
            >
              <div
                className={`w-12 h-12 rounded-xl bg-${action.color}/10 flex items-center justify-center text-${action.color} group-hover:scale-110 transition-transform shrink-0`}
              >
                {action.icon}
              </div>
              <div>
                <p className="font-display text-sm font-bold text-on-surface">{action.label}</p>
                <p className="text-xs text-on-surface-variant/70 mt-0.5">{action.desc}</p>
              </div>
            </button>
          ))}

          {/* Threat level card */}
          <div className="glass-panel rounded-xl p-5">
            <p className="font-mono text-xs text-on-surface-variant/70 uppercase tracking-wider mb-3 font-semibold">
              Current Threat Level
            </p>
            <div className="flex items-center gap-3 mb-3">
              <div className="text-3xl font-display font-extrabold text-tertiary glow-text">LOW</div>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <div
                    key={n}
                    className={`w-4 h-1.5 rounded-full ${
                      n <= 2 ? "bg-primary" : "bg-white/10"
                    }`}
                  ></div>
                ))}
              </div>
            </div>
            <p className="text-[10px] font-mono text-on-surface-variant/50 leading-relaxed">
              Your GPS location has not been shared. Passive data exposure is normal for all browsers.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom stats */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Data Points Exposed", value: "5+", trend: "Always", icon: <Eye className="w-5 h-5" />, color: "error" },
          { label: "GPS Shared", value: "0", trend: "Protected", icon: <MapPin className="w-5 h-5" />, color: "primary" },
          { label: "Phone Trackable", value: "No", trend: "Myth busted", icon: <Phone className="w-5 h-5" />, color: "secondary" },
          { label: "Protection Steps", value: "6", trend: "Available", icon: <ShieldCheck className="w-5 h-5" />, color: "tertiary" },
        ].map((s) => (
          <div key={s.label} className="glass-panel rounded-xl p-5 flex flex-col justify-between">
            <div className={`text-${s.color}/60 mb-3`}>{s.icon}</div>
            <div>
              <div className={`font-display text-3xl font-extrabold text-${s.color} glow-text`}>
                {s.value}
              </div>
              <p className="font-mono text-[9px] text-on-surface-variant/60 uppercase tracking-wider mt-1">
                {s.label}
              </p>
              <p className={`font-mono text-[9px] text-${s.color}/60 font-semibold mt-1 flex items-center gap-1`}>
                <TrendingUp className="w-3 h-3" /> {s.trend}
              </p>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
