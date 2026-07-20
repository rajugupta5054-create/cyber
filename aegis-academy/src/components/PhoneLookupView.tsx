import { useState, FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Phone, Search, CheckCircle, XCircle, AlertTriangle } from "lucide-react";

interface PhoneMeta {
  number_formatted?: string;
  country?: string;
  country_code?: string;
  carrier?: string;
  line_type?: string;
  region?: string;
  error?: string;
}

export default function PhoneLookupView() {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PhoneMeta | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!phone.trim() || loading) return;
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const res = await fetch("/api/phone-metadata", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phone.trim() }),
      });
      const data: PhoneMeta = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Unknown error.");
      } else {
        setResult(data);
      }
    } catch (_) {
      setError("Could not reach the server. Make sure the Flask backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const canItems = [
    "Country code reveals the registered country",
    "Carrier name is publicly linked to the prefix",
    "Number type (mobile/landline) is in the numbering plan",
  ];

  const cannotItems = [
    "Live GPS location — impossible to retrieve",
    "Current city or street — not available",
    "Cell tower data — telecom-only, requires warrant",
  ];

  const metaRows: [string, string | undefined][] = result
    ? [
        ["Formatted Number", result.number_formatted],
        ["Country", result.country],
        ["Country Code", result.country_code ? `+${result.country_code}` : undefined],
        ["Carrier / Network", result.carrier],
        ["Line Type", result.line_type],
        ["Region", result.region],
      ]
    : [];

  return (
    <div className="relative">
      {/* Header */}
      <section className="mb-10">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-secondary/10 border border-secondary/20 text-secondary mb-6">
          <Phone className="w-4 h-4" />
          <span className="font-mono text-[10px] uppercase tracking-widest font-semibold">
            Phone Number Analysis
          </span>
        </div>
        <h1 className="font-display text-4xl md:text-5xl font-extrabold mb-4 glow-text leading-[1.15]">
          What a Phone Number{" "}
          <span className="bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">
            Actually Reveals
          </span>
        </h1>
        <p className="font-sans text-base md:text-lg text-on-surface-variant max-w-2xl opacity-90 leading-relaxed">
          Enter any phone number in any format — with or without country code, spaces, dashes or
          brackets. See what is publicly visible, and what is <strong>not</strong>.
        </p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Input + Results */}
        <div className="lg:col-span-3 space-y-6">
          {/* Form */}
          <div className="glass-panel rounded-2xl p-6 md:p-8">
            <form onSubmit={handleSubmit}>
              <label className="block font-mono text-xs text-on-surface-variant/70 uppercase tracking-widest mb-3">
                Phone number (any format accepted)
              </label>
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/40" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210 / 9876543210 / +1-415-555-2671"
                    maxLength={50}
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3.5 text-sm font-mono text-on-surface placeholder:text-on-surface-variant/30 focus:outline-none focus:border-primary/40 transition-all"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || !phone.trim()}
                  className={`px-6 py-3.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all cursor-pointer ${
                    loading || !phone.trim()
                      ? "opacity-40 cursor-not-allowed bg-primary/20 text-primary"
                      : "bg-gradient-to-r from-secondary to-primary text-on-primary hover:scale-105 shadow-lg shadow-secondary/20"
                  }`}
                >
                  <Search className="w-4 h-4" />
                  {loading ? "Analysing..." : "Analyse"}
                </button>
              </div>
            </form>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 p-4 rounded-xl bg-error/10 border border-error/20 flex items-start gap-3"
                >
                  <AlertTriangle className="w-4 h-4 text-error shrink-0 mt-0.5" />
                  <p className="text-xs text-error/90 font-mono">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Results */}
            <AnimatePresence>
              {result && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-6"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <CheckCircle className="w-5 h-5 text-primary" />
                    <span className="font-mono text-xs text-primary uppercase tracking-widest font-semibold">
                      Analysis Complete
                    </span>
                  </div>

                  <dl className="space-y-3">
                    {metaRows.map(([key, val]) =>
                      val ? (
                        <div key={key} className="flex items-center justify-between py-3 border-b border-white/5">
                          <dt className="font-mono text-xs text-on-surface-variant uppercase tracking-wider">
                            {key}
                          </dt>
                          <dd className="font-mono text-sm font-bold text-primary text-right">{val}</dd>
                        </div>
                      ) : null
                    )}
                  </dl>

                  {/* Big warning: no GPS */}
                  <div className="mt-6 p-5 rounded-xl bg-error/10 border border-error/20">
                    <div className="flex items-center gap-2 mb-2">
                      <XCircle className="w-5 h-5 text-error" />
                      <p className="font-display text-sm font-bold text-error">
                        Live GPS location: IMPOSSIBLE
                      </p>
                    </div>
                    <p className="text-xs text-on-surface-variant/80 leading-relaxed">
                      No matter what you've seen on YouTube or in ads — a phone number{" "}
                      <strong className="text-on-surface">cannot</strong> reveal someone's live
                      location. Any tool claiming this is a scam or requires illegal cell tower
                      access (only available to telecoms under court order).
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* What it reveals / doesn't reveal */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel rounded-2xl p-6">
            <h3 className="font-display text-lg font-semibold mb-6 flex items-center gap-2">
              🔍 Why This Matters
            </h3>

            <div className="space-y-3 mb-6">
              <p className="font-mono text-[10px] text-primary/60 uppercase tracking-widest font-semibold mb-3">
                ✅ What IS visible
              </p>
              {canItems.map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <CheckCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span className="text-xs text-on-surface-variant leading-relaxed">{item}</span>
                </div>
              ))}
            </div>

            <div className="space-y-3 pt-4 border-t border-white/5">
              <p className="font-mono text-[10px] text-error/60 uppercase tracking-widest font-semibold mb-3">
                ❌ What is NOT possible
              </p>
              {cannotItems.map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <XCircle className="w-4 h-4 text-error shrink-0 mt-0.5" />
                  <span className="text-xs text-on-surface-variant leading-relaxed">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Scam Warning */}
          <div className="glass-panel rounded-2xl p-6 border border-error/10">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-tertiary shrink-0" />
              <div>
                <h4 className="font-display text-sm font-bold text-tertiary mb-2">
                  Beware of Scam Tools
                </h4>
                <p className="text-xs text-on-surface-variant/80 leading-relaxed">
                  Websites claiming to "track someone by phone number" are either scams collecting
                  your money, or phishing attempts. Real cell-tower tracking requires a court order
                  and telecom cooperation.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
