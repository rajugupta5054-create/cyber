import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import Ferrofluid from "./Ferrofluid";
import {
  MapPin,
  Play,
  StopCircle,
  Copy,
  CheckCircle,
  Clock,
  Globe,
  Monitor,
  Languages,
  Maximize,
  AlertTriangle,
  ShieldCheck,
} from "lucide-react";

interface BrowserInfo {
  ip: string | null;
  browser: string;
  language: string;
  timezone: string;
  screen: string;
}

interface GpsCoords {
  lat: number;
  lng: number;
  accuracy: number;
}

interface ShareInfo {
  shareUrl: string;
  expiresAt: string;
  shareId: string;
}

export default function LocationDemoView() {
  const [browserInfo, setBrowserInfo] = useState<BrowserInfo>({
    ip: null,
    browser: "",
    language: "",
    timezone: "",
    screen: "",
  });
  const [consent, setConsent] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [gps, setGps] = useState<GpsCoords | null>(null);
  const [shareInfo, setShareInfo] = useState<ShareInfo | null>(null);
  const [statusMsg, setStatusMsg] = useState("Location sharing is off.");
  const [copied, setCopied] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const shareIdRef = useRef<string | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  // Collect passive browser data
  useEffect(() => {
    setBrowserInfo({
      ip: null,
      browser: (() => {
        const ua = navigator.userAgent;
        if (ua.includes("Chrome") && !ua.includes("Edg")) return "Chrome / " + navigator.platform;
        if (ua.includes("Firefox")) return "Firefox / " + navigator.platform;
        if (ua.includes("Safari") && !ua.includes("Chrome")) return "Safari / " + navigator.platform;
        if (ua.includes("Edg")) return "Edge / " + navigator.platform;
        return navigator.userAgent.substring(0, 40);
      })(),
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      screen: `${screen.width} × ${screen.height}`,
    });

    // Fetch IP
    fetch("https://api.ipify.org?format=json")
      .then((r) => r.json())
      .then((d) => setBrowserInfo((prev) => ({ ...prev, ip: d.ip })))
      .catch(() => setBrowserInfo((prev) => ({ ...prev, ip: "Unavailable" })));
  }, []);

  // Init Leaflet map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    const L = (window as any).L;
    if (!L || leafletMapRef.current) return;

    const map = L.map(mapContainerRef.current, { zoomControl: true }).setView([20, 0], 2);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    }).addTo(map);
    leafletMapRef.current = map;
  }, []);

  const updateMap = (lat: number, lng: number) => {
    const L = (window as any).L;
    if (!L || !leafletMapRef.current) return;

    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
    } else {
      const icon = L.divIcon({
        className: "",
        html: `<div style="width:18px;height:18px;background:#a4c9ff;border:3px solid #fff;border-radius:50%;box-shadow:0 0 12px #a4c9ff80;"></div>`,
        iconSize: [18, 18],
        iconAnchor: [9, 9],
      });
      markerRef.current = L.marker([lat, lng], { icon }).addTo(leafletMapRef.current);
    }
    leafletMapRef.current.setView([lat, lng], 14);
  };

  const handleStart = async () => {
    if (!consent) {
      setStatusMsg("⚠️ Please tick the consent checkbox first.");
      return;
    }
    if (sharing) return;

    setLocationError(null);
    setStatusMsg("Requesting location access...");

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng, accuracy } = pos.coords;
        const coords: GpsCoords = { lat, lng, accuracy };
        setGps(coords);
        setSharing(true);
        setStatusMsg("📡 Location sharing active — updating every 15 seconds.");
        updateMap(lat, lng);

        // Create share on backend
        try {
          const res = await fetch("/api/location-shares", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ latitude: lat, longitude: lng, accuracy, consent: true }),
          });
          if (res.ok) {
            const data = await res.json();
            shareIdRef.current = data.share_id;
            setShareInfo({
              shareId: data.share_id,
              shareUrl: `${window.location.origin}${data.share_path}`,
              expiresAt: data.expires_at,
            });
          }
        } catch (_) {}

        // Watch position
        const wid = navigator.geolocation.watchPosition(
          async (p) => {
            const { latitude: la, longitude: lo, accuracy: ac } = p.coords;
            setGps({ lat: la, lng: lo, accuracy: ac });
            updateMap(la, lo);
            if (shareIdRef.current) {
              try {
                await fetch(`/api/location-shares/${shareIdRef.current}`, {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ latitude: la, longitude: lo, accuracy: ac, consent: true }),
                });
              } catch (_) {}
            }
          },
          () => {},
          { enableHighAccuracy: true, maximumAge: 15000 }
        );
        watchIdRef.current = wid;
      },
      (err) => {
        setLocationError(
          err.code === 1
            ? "Location access denied. Please allow location in your browser."
            : "Unable to retrieve location."
        );
        setStatusMsg("Location sharing is off.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleStop = async () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (shareIdRef.current) {
      try {
        await fetch(`/api/location-shares/${shareIdRef.current}`, { method: "DELETE" });
      } catch (_) {}
      shareIdRef.current = null;
    }
    setSharing(false);
    setGps(null);
    setShareInfo(null);
    setStatusMsg("Location sharing stopped & revoked.");
  };

  const handleCopy = () => {
    if (shareInfo) {
      navigator.clipboard.writeText(shareInfo.shareUrl).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  const infoCards = [
    { icon: <Globe className="w-5 h-5" />, label: "IP Address", value: browserInfo.ip ?? "Scanning..." },
    { icon: <Monitor className="w-5 h-5" />, label: "Browser / OS", value: browserInfo.browser || "Scanning..." },
    { icon: <Languages className="w-5 h-5" />, label: "Language", value: browserInfo.language || "Scanning..." },
    { icon: <Clock className="w-5 h-5" />, label: "Timezone", value: browserInfo.timezone || "Scanning..." },
    { icon: <Maximize className="w-5 h-5" />, label: "Screen Resolution", value: browserInfo.screen || "Scanning..." },
    {
      icon: <MapPin className="w-5 h-5" />,
      label: "GPS Location",
      value: gps ? `${gps.lat.toFixed(4)}, ${gps.lng.toFixed(4)} (±${Math.round(gps.accuracy)}m)` : "Not shared yet",
    },
  ];

  return (
    <div className="relative">
      {/* Background specific to this view */}
      <div className="fixed inset-0 z-[-1] pointer-events-none opacity-60">
        <Ferrofluid
          colors={['#4F46E5', '#06B6D4', '#E0F2FE']}
          speed={0.5}
          scale={1.6}
          turbulence={1}
          fluidity={0.1}
          rimWidth={0.2}
          sharpness={2.5}
          shimmer={1.5}
          glow={2}
          flowDirection="down"
          opacity={1}
          mouseInteraction={false}
        />
        <div className="absolute inset-0 bg-background/60 mix-blend-multiply"></div>
      </div>

      {/* Page Header */}
      <section className="mb-10">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary mb-6">
          <MapPin className="w-4 h-4" />
          <span className="font-mono text-[10px] uppercase tracking-widest font-semibold">
            Interactive Demo
          </span>
        </div>
        <h1 className="font-display text-4xl md:text-5xl font-extrabold mb-4 glow-text leading-[1.15]">
          Consent-Based{" "}
          <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Live Location Share
          </span>
        </h1>
        <p className="font-sans text-base md:text-lg text-on-surface-variant max-w-2xl opacity-90 leading-relaxed">
          This demo replicates exactly what a tracking link does. Your passive browser data is
          captured immediately. GPS location is only collected with your explicit consent.
        </p>
      </section>

      {/* Passive data banner */}
      <section className="mb-8">
        <h2 className="font-mono text-xs text-on-surface-variant/70 uppercase tracking-widest mb-4 font-semibold">
          📡 Passive Data — Captured Right Now
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {infoCards.map((c, i) => (
            <motion.div
              key={c.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`glass-card rounded-xl p-4 flex flex-col gap-2 ${
                i === 5 && !gps ? "border-white/5" : i === 5 && gps ? "border-primary/30" : ""
              }`}
            >
              <div className="text-primary/60">{c.icon}</div>
              <span className="font-mono text-[9px] text-on-surface-variant uppercase tracking-wider">
                {c.label}
              </span>
              <span
                className={`font-mono text-xs font-semibold break-all leading-tight ${
                  c.value === "Scanning..." || c.value === "Not shared yet"
                    ? "text-on-surface-variant/40 italic"
                    : "text-primary"
                }`}
              >
                {c.value}
              </span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Demo Layout */}
      <section className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-12">
        {/* Controls */}
        <div className="lg:col-span-2 space-y-4">
          {/* Step 1: How the attack works */}
          <div className="glass-panel rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-error/10 border border-error/20 flex items-center justify-center font-mono text-xs font-bold text-error">
                01
              </div>
              <h3 className="font-display text-base font-bold">How the Attack Works</h3>
            </div>
            <p className="text-sm text-on-surface-variant mb-3 opacity-85">
              An attacker sends a link disguised as:
            </p>
            <ul className="space-y-2 text-sm text-on-surface-variant mb-4">
              {["📦 A parcel delivery notification", "🏦 A bank verification page", "🎁 A prize claim form", "🔗 A shortened URL from a stranger"].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className="bg-error/10 border border-error/20 rounded-lg p-3 text-xs text-error/90 leading-relaxed">
              <AlertTriangle className="w-4 h-4 inline mr-1.5 shrink-0 align-text-top" />
              When you visit the link, your IP, browser, and timezone are captured{" "}
              <em>instantly</em>. If you click "Allow" on the location prompt, your GPS coordinates
              are sent too.
            </div>
          </div>

          {/* Step 2: Consent */}
          <div className="glass-panel rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-mono text-xs font-bold text-primary">
                02
              </div>
              <h3 className="font-display text-base font-bold">Your Consent Controls</h3>
            </div>
            <p className="text-sm text-on-surface-variant mb-4 opacity-85">
              This demo only collects your location with explicit permission — exactly as responsible
              apps should work.
            </p>
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-0.5 w-4 h-4 accent-primary cursor-pointer"
              />
              <span className="text-xs text-on-surface-variant group-hover:text-on-surface transition-colors leading-relaxed">
                I understand this is a demonstration and I am sharing my own location voluntarily.
              </span>
            </label>
          </div>

          {/* Step 3: Start */}
          <div className="glass-panel rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-secondary/10 border border-secondary/20 flex items-center justify-center font-mono text-xs font-bold text-secondary">
                03
              </div>
              <h3 className="font-display text-base font-bold">Start the Live Demo</h3>
            </div>
            <p className="text-sm text-on-surface-variant mb-4 opacity-85">
              Click Start to simulate what happens when someone clicks a tracking link and grants
              location access.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleStart}
                disabled={sharing || !consent}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer ${
                  sharing || !consent
                    ? "opacity-40 cursor-not-allowed bg-primary/20 text-primary"
                    : "bg-gradient-to-r from-primary to-secondary text-on-primary hover:scale-105 shadow-lg shadow-primary/20"
                }`}
              >
                <Play className="w-4 h-4 fill-current" />
                {sharing ? "Active" : "Start"}
              </button>
              <button
                onClick={handleStop}
                disabled={!sharing}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer ${
                  !sharing
                    ? "opacity-40 cursor-not-allowed bg-error/10 text-error/50"
                    : "bg-error text-on-error hover:bg-error/90"
                }`}
              >
                <StopCircle className="w-4 h-4" />
                Stop
              </button>
            </div>

            <AnimatePresence>
              {locationError && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-3 text-xs text-error/90 bg-error/10 border border-error/20 rounded-lg p-2"
                >
                  {locationError}
                </motion.p>
              )}
            </AnimatePresence>

            <p className="mt-3 text-xs font-mono text-on-surface-variant/60 italic">{statusMsg}</p>

            {/* Share URL */}
            <AnimatePresence>
              {shareInfo && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 p-4 rounded-xl bg-primary/5 border border-primary/20"
                >
                  <p className="font-mono text-[10px] text-primary/70 uppercase tracking-widest mb-2">
                    🔗 Shareable Link (simulates attacker's link)
                  </p>
                  <div className="flex gap-2">
                    <input
                      readOnly
                      value={shareInfo.shareUrl}
                      className="flex-1 bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-xs font-mono text-on-surface-variant focus:outline-none"
                    />
                    <button
                      onClick={handleCopy}
                      className="px-3 py-2 rounded-lg border border-primary/30 text-primary hover:bg-primary/10 transition-all cursor-pointer"
                    >
                      {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="mt-2 text-[10px] font-mono text-on-surface-variant/50">
                    Expires: {new Date(shareInfo.expiresAt).toLocaleTimeString()}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Map */}
        <div className="lg:col-span-3 glass-panel rounded-2xl overflow-hidden flex flex-col min-h-[500px]">
          <div className="flex items-center justify-between p-4 border-b border-white/5">
            <div className="flex items-center gap-2 font-mono text-sm text-on-surface-variant font-semibold">
              <MapPin className="w-4 h-4 text-primary" />
              📡 Live Location Map
            </div>
            <div
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border ${
                sharing
                  ? "bg-primary/10 text-primary border-primary/30 animate-pulse"
                  : "bg-white/5 text-on-surface-variant border-white/10"
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${sharing ? "bg-primary" : "bg-on-surface-variant/30"}`}></span>
              {sharing ? "Live" : "Waiting..."}
            </div>
          </div>

          <div ref={mapContainerRef} className="flex-1 min-h-[400px]" style={{ zIndex: 1 }}></div>

          <div className="p-4 border-t border-white/5">
            <p className="font-mono text-xs text-on-surface-variant/60">
              {gps
                ? `📍 ${gps.lat.toFixed(5)}, ${gps.lng.toFixed(5)} — Accuracy ±${Math.round(gps.accuracy)}m`
                : "No coordinates yet"}
            </p>
            <p className="font-mono text-[10px] text-on-surface-variant/40 mt-1">
              ⚡ Updates every 15 seconds while sharing is active
            </p>
          </div>
        </div>
      </section>

      {/* Info Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {[
          {
            icon: "⚡",
            title: "Passive Collection",
            desc: "IP, browser, OS, screen size and timezone are captured automatically — no permission needed.",
          },
          {
            icon: "🔔",
            title: "Active Permission",
            desc: "Precise GPS location requires a browser permission prompt. You must click 'Allow'.",
          },
          {
            icon: "📵",
            title: "Phone Numbers Cannot Be Located",
            desc: "A phone number only reveals the SIM registration country — never the live device location.",
          },
        ].map((item) => (
          <div key={item.title} className="glass-card rounded-xl p-5 flex items-start gap-4">
            <div className="text-2xl shrink-0">{item.icon}</div>
            <div>
              <h3 className="font-display text-sm font-bold mb-1">{item.title}</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed opacity-80">{item.desc}</p>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
