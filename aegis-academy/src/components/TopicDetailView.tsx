import { motion } from "motion/react";
import { ArrowLeft, CheckCircle, ShieldAlert } from "lucide-react";
import { AppTab } from "../types";

interface TopicDetailViewProps {
  topicId: string;
  onNavigate: (tab: AppTab, topicId?: string) => void;
}

const detailedTopics: Record<string, any> = {
  "suspicious-links": {
    title: "Never Click Suspicious Links",
    image: "/images/suspicious-links.png",
    whyMatters: "Phishing links are the #1 way attackers compromise devices. A simple tap on a disguised link can secretly capture your IP address, device type, and even prompt for location permissions before you realize it's a fake site.",
    howToFix: [
      "Always verify the sender of unexpected SMS or WhatsApp messages.",
      "Hover over links on desktop to see the actual destination URL.",
      "If a URL is shortened (like bit.ly), use an unshorten service to check it first.",
      "Look for spelling mistakes in domain names (e.g., 'amaz0n.com' instead of 'amazon.com')."
    ]
  },
  "deny-location": {
    title: "Deny Location to Unknown Sites",
    image: "/images/deny-location.png",
    whyMatters: "Web browsers require your explicit permission to share precise GPS coordinates. Attackers often try to trick you into clicking 'Allow' by disguising the prompt on a fake package tracking or banking website.",
    howToFix: [
      "Never click 'Allow' on a location prompt unless you completely trust the website.",
      "If you accidentally allowed a site, go to your browser settings (Site Settings > Location) and revoke it.",
      "Keep in mind that legitimate sites will usually explain exactly why they need your location before asking.",
      "When in doubt, always click 'Block'."
    ]
  },
  "use-vpn": {
    title: "Use a VPN (Virtual Private Network)",
    image: "/images/use-vpn.png",
    whyMatters: "Even if you deny GPS access, websites can still determine your approximate city or region based on your IP address. This happens passively the moment you load a webpage. A VPN masks your real IP address by routing your connection through a secure server.",
    howToFix: [
      "Subscribe to a reputable, paid VPN service (like ProtonVPN, ExpressVPN, or Mullvad).",
      "Avoid 'free' VPNs as they often track and sell your data to third parties.",
      "Keep your VPN turned on especially when connected to public Wi-Fi networks.",
      "You can verify your VPN is working by checking your IP on sites like ipleak.net."
    ]
  },
  "private-browsing": {
    title: "Use Private Browsing Mode",
    image: "/images/private-browsing.png",
    whyMatters: "As you browse the web, sites leave 'cookies' on your device to track your behavior across different pages. Private Browsing (or Incognito) mode prevents these cookies from being saved permanently, making it harder to build a long-term profile on you.",
    howToFix: [
      "Use Incognito mode when clicking links from untrusted sources to isolate them from your logged-in accounts.",
      "Remember that Private Browsing does NOT hide your IP address; you still need a VPN for that.",
      "For extreme privacy, consider using a hardened browser like Firefox with strict tracking protection.",
      "Close the private browsing window immediately after you are done investigating a link."
    ]
  },
  "app-permissions": {
    title: "Review App Location Permissions",
    image: "/images/app-permissions.png",
    whyMatters: "Many apps on your smartphone quietly track your location in the background and sell this data to advertisers. An app that doesn't need your location to function (like a calculator or simple game) should not have location access.",
    howToFix: [
      "On iPhone: Go to Settings > Privacy & Security > Location Services.",
      "On Android: Go to Settings > Location > App location permissions.",
      "Change permissions from 'Always Allow' to 'While Using the App' for apps like Maps or Uber.",
      "Completely revoke location access for apps that have no valid reason to know where you are."
    ]
  },
  "https-only": {
    title: "Enable HTTPS Only Mode",
    image: "/images/https-only.png",
    whyMatters: "HTTP (without the 'S') means your connection to the website is unencrypted. Anyone on your network can see what you are doing. Modern browsers block dangerous APIs (like geolocation and camera access) on non-HTTPS sites to protect you.",
    howToFix: [
      "Always look for the padlock icon in your browser's address bar.",
      "Enable 'HTTPS-Only Mode' in your browser settings (available in Chrome, Firefox, and Safari).",
      "Never enter passwords, credit cards, or personal information on a site that says 'Not Secure'.",
      "If a site fails to load in HTTPS-Only Mode, it is heavily outdated and potentially dangerous."
    ]
  }
};

export default function TopicDetailView({ topicId, onNavigate }: TopicDetailViewProps) {
  const topic = detailedTopics[topicId];

  if (!topic) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-bold text-error">Topic not found</h2>
        <button 
          onClick={() => onNavigate("protection-guide")}
          className="mt-4 px-6 py-2 bg-primary/20 text-primary rounded-lg"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative max-w-5xl mx-auto"
    >
      <button
        onClick={() => onNavigate("protection-guide")}
        className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors mb-8 cursor-pointer"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="font-display font-semibold">Back to Protection Guide</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Left Side - Image */}
        <div className="glass-panel p-2 rounded-3xl overflow-hidden self-start sticky top-28 border border-white/10 shadow-2xl shadow-primary/10">
          <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden bg-surface-dim flex items-center justify-center">
            <img 
              src={topic.image} 
              alt={topic.title}
              className="object-cover w-full h-full"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                target.parentElement!.innerHTML = '<div class="text-on-surface-variant opacity-50 font-mono text-sm">Image loading...</div>';
              }}
            />
            {/* Glossy overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none"></div>
          </div>
        </div>

        {/* Right Side - Content */}
        <div className="space-y-8 pb-10">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary mb-4">
              <ShieldAlert className="w-4 h-4" />
              <span className="font-mono text-[10px] uppercase tracking-widest font-semibold">
                Defence Module
              </span>
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-extrabold glow-text leading-[1.1] mb-6">
              {topic.title}
            </h1>
          </div>

          <div className="glass-panel p-6 rounded-2xl border-l-4 border-l-secondary">
            <h3 className="font-mono text-xs uppercase tracking-widest text-secondary font-bold mb-3">
              Why This Matters
            </h3>
            <p className="text-on-surface-variant leading-relaxed text-sm md:text-base">
              {topic.whyMatters}
            </p>
          </div>

          <div className="glass-card p-6 md:p-8 rounded-2xl">
            <h3 className="font-mono text-xs uppercase tracking-widest text-primary font-bold mb-6">
              How To Protect Yourself
            </h3>
            <ul className="space-y-4">
              {topic.howToFix.map((step: string, index: number) => (
                <motion.li 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + (index * 0.1) }}
                  key={index} 
                  className="flex items-start gap-4"
                >
                  <div className="mt-0.5 shrink-0">
                    <CheckCircle className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-on-surface text-sm leading-relaxed">
                    {step}
                  </span>
                </motion.li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
