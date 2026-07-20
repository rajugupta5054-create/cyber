import { motion } from "motion/react";
import {
  ShieldCheck,
  Link,
  Map,
  Globe,
  EyeOff,
  Smartphone,
  Lock,
  ArrowRight,
} from "lucide-react";
import { AppTab } from "../types";

interface ProtectionGuideViewProps {
  onNavigate: (tab: AppTab, topicId?: string) => void;
}

const topics = [
  {
    id: "suspicious-links",
    icon: <Link className="w-8 h-8" />,
    color: "primary",
    title: "Never Click Suspicious Links",
    summary:
      "Hover over any link to see the real URL before clicking. If it's a short link (bit.ly, tinyurl), expand it first using a service like checkshorturl.com.",
    steps: [
      "Hover over links in email before clicking — look at the status bar.",
      "Use checkshorturl.com to expand shortened URLs.",
      "Never click links in WhatsApp or SMS from unknown senders.",
      "Look for HTTPS and verify the domain spelling carefully.",
    ],
  },
  {
    id: "deny-location",
    icon: <Map className="w-8 h-8" />,
    color: "secondary",
    title: "Deny Location to Unknown Sites",
    summary:
      'When an unfamiliar website asks for your location, always click "Block" or "Never Allow". Legitimate services explain why they need it first.',
    steps: [
      'Click "Block" or "Never Allow" by default on unfamiliar sites.',
      "Legitimate apps always explain why they need location access.",
      "Go to browser settings → Site Permissions → Location → review all.",
      "On mobile: Settings → Apps → Permissions → Location.",
    ],
  },
  {
    id: "use-vpn",
    icon: <Globe className="w-8 h-8" />,
    color: "tertiary",
    title: "Use a VPN",
    summary:
      "A VPN masks your real IP address, preventing passive IP-based geolocation. Your approximate city is derived from your IP without you knowing.",
    steps: [
      "Install a trusted VPN (ProtonVPN, Mullvad, or ExpressVPN).",
      "Enable VPN before browsing unfamiliar sites.",
      "Avoid free VPNs — they often log and sell your data.",
      "Verify your VPN works at ipleak.net.",
    ],
  },
  {
    id: "private-browsing",
    icon: <EyeOff className="w-8 h-8" />,
    color: "primary",
    title: "Use Private Browsing",
    summary:
      "Private/Incognito mode prevents tracking cookies from persisting. Combine with Firefox for enhanced fingerprint resistance.",
    steps: [
      "Open Incognito / Private window before visiting suspicious links.",
      "Use Firefox with uBlock Origin for fingerprint protection.",
      "Private mode does NOT hide your IP — combine with VPN.",
      "Consider Tor Browser for high-risk situations.",
    ],
  },
  {
    id: "app-permissions",
    icon: <Smartphone className="w-8 h-8" />,
    color: "secondary",
    title: "Review App Permissions",
    summary:
      "Go to your phone's Settings → App Permissions and revoke location access from apps that don't genuinely need it.",
    steps: [
      "Android: Settings → Privacy → Permission Manager → Location.",
      "iOS: Settings → Privacy & Security → Location Services.",
      "Set location permission to 'While Using' — never 'Always'.",
      "Revoke location from games, news, and social apps.",
    ],
  },
  {
    id: "https-only",
    icon: <Lock className="w-8 h-8" />,
    color: "tertiary",
    title: "Enable HTTPS Only Mode",
    summary:
      "Browsers like Firefox have an HTTPS-Only Mode. Geolocation APIs are blocked on non-HTTPS pages, reducing risk.",
    steps: [
      "Firefox: Settings → Privacy → Enable HTTPS-Only Mode.",
      "Chrome: has built-in HTTPS upgrades in recent versions.",
      "Never enter personal data on HTTP sites.",
      "Install HTTPS Everywhere browser extension as a backup.",
    ],
  },
];

export default function ProtectionGuideView({ onNavigate }: ProtectionGuideViewProps) {
  return (
    <div className="relative">
      {/* Header */}
      <section className="mb-12 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-8">
        <div className="max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary mb-6">
            <ShieldCheck className="w-4 h-4" />
            <span className="font-mono text-[10px] uppercase tracking-widest font-semibold">
              Defence Guide
            </span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-extrabold mb-4 glow-text leading-[1.15]">
            How to Protect{" "}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Yourself
            </span>
          </h1>
          <p className="font-sans text-base md:text-lg text-on-surface-variant max-w-2xl opacity-90 leading-relaxed">
            Simple, actionable steps anyone can take to prevent location tracking, browser
            fingerprinting, and IP-based geolocation.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 shrink-0">
          {[
            { value: "6", label: "Defence Modules" },
            { value: "24+", label: "Actionable Steps" },
            { value: "Free", label: "Always" },
          ].map((s) => (
            <div key={s.label} className="glass-card rounded-xl p-4 text-center">
              <div className="font-display text-2xl font-extrabold text-primary glow-text">
                {s.value}
              </div>
              <div className="font-mono text-[9px] text-on-surface-variant/60 uppercase tracking-wide mt-1">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Topic Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-16">
        {topics.map((topic, i) => (
          <motion.div
            key={topic.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.07 }}
            onClick={() => onNavigate("topic-detail", topic.id)}
            className="glass-card p-6 md:p-8 rounded-2xl flex flex-col justify-between group hover:-translate-y-1 transition-transform duration-300 cursor-pointer"
          >
            <div>
              {/* Icon */}
              <div
                className={`w-14 h-14 rounded-xl bg-${topic.color}/10 flex items-center justify-center text-${topic.color} mb-6 group-hover:scale-110 transition-transform`}
              >
                {topic.icon}
              </div>

              <h3 className="font-display text-lg font-semibold text-on-surface mb-3">
                {topic.title}
              </h3>
              <p className="text-on-surface-variant text-sm mb-6 leading-relaxed opacity-85">
                {topic.summary}
              </p>

              {/* Steps */}
              <ul className="space-y-2">
                {topic.steps.map((step) => (
                  <li key={step} className="flex items-start gap-2 text-xs text-on-surface-variant/80">
                    <span className="text-primary/60 mt-0.5 shrink-0">→</span>
                    {step}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
              <span className="font-mono text-[9px] text-on-surface-variant/40 uppercase tracking-wider">
                Protection Guide
              </span>
              <ArrowRight className="w-4 h-4 text-primary opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </div>
          </motion.div>
        ))}
      </section>

      {/* CTA to demo */}
      <section className="glass-panel rounded-2xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
        <div>
          <h2 className="font-display text-2xl font-bold mb-2">See It in Action</h2>
          <p className="text-on-surface-variant text-sm opacity-80 max-w-lg">
            Run our interactive demo to see exactly what data your browser exposes right now — and
            then put these protection steps into practice.
          </p>
        </div>
        <div className="flex gap-4 shrink-0">
          <button
            onClick={() => onNavigate("location-demo")}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-on-primary font-bold text-sm hover:scale-105 transition-transform cursor-pointer shadow-lg shadow-primary/20"
          >
            ▶ Live Demo
          </button>
          <button
            onClick={() => onNavigate("phone-lookup")}
            className="px-6 py-3 rounded-xl border border-white/10 hover:border-primary/30 text-primary font-bold text-sm hover:bg-primary/5 transition-all cursor-pointer"
          >
            Phone Lookup
          </button>
        </div>
      </section>
    </div>
  );
}
