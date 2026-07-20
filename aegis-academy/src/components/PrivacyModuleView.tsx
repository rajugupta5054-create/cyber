import { useState } from "react";
import { 
  EyeOff, 
  RotateCcw, 
  Sliders, 
  MapPin, 
  ShieldAlert, 
  ShieldCheck, 
  CheckCircle, 
  Globe,
  Lock,
  ArrowRight,
  BookOpen
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function PrivacyModuleView() {
  const [simulatorState, setSimulatorState] = useState<"prompt" | "success" | "warning">("prompt");
  const [learningCompleted, setLearningCompleted] = useState(false);

  const handleResponse = (action: "allow" | "deny") => {
    if (action === "deny") {
      setSimulatorState("success");
      setLearningCompleted(true);
    } else {
      setSimulatorState("warning");
    }
  };

  const handleReset = () => {
    setSimulatorState("prompt");
  };

  return (
    <div className="relative">
      {/* Module Title Section */}
      <section className="mb-12 relative flex flex-col xl:flex-row justify-between items-start xl:items-center gap-8">
        <div className="max-w-3xl z-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary mb-6">
            <ShieldCheck className="w-4 h-4" />
            <span className="font-mono text-[10px] uppercase tracking-widest font-semibold">Privacy Module 04</span>
          </div>
          
          <h1 className="font-display text-4xl md:text-5xl font-extrabold mb-4 glow-text leading-[1.15]">
            Privacy Protection: <br/>
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Deny the Data Harvesters
            </span>
          </h1>
          
          <p className="font-sans text-base md:text-lg text-on-surface-variant mb-8 max-w-2xl opacity-90 leading-relaxed">
            In the digital age, your data is the new oil. Companies track your every move, predicting your behavior before you even make a choice. It's time to take control and vanish from the grid.
          </p>
          
          <div className="flex flex-wrap gap-4">
            <button 
              onClick={() => {
                const el = document.getElementById("interactive-demo");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
              className="px-6 py-3 rounded-lg bg-gradient-to-r from-primary to-secondary text-on-primary font-bold shadow-[0_4px_15px_rgba(96,165,250,0.3)] hover:shadow-[0_4px_25px_rgba(96,165,250,0.55)] transition-all cursor-pointer"
            >
              Start Learning
            </button>
            <button className="px-6 py-3 rounded-lg border border-white/10 hover:border-primary/30 hover:bg-white/5 transition-all cursor-pointer">
              View Syllabus
            </button>
          </div>
        </div>

        {/* Floating Graphic */}
        <div className="relative xl:w-[350px] xl:h-[350px] opacity-40 xl:opacity-100 pointer-events-none self-center xl:self-auto">
          <div className="absolute -inset-10 bg-primary/10 blur-[80px] rounded-full"></div>
          <img 
            alt="Cryptographic shield illustration" 
            className="w-48 h-48 xl:w-full xl:h-full object-contain mix-blend-screen drop-shadow-[0_0_35px_rgba(164,201,255,0.3)]" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCy4JHZDoXjgfvCsULtK8VhenSje6_v6PPYIp1SAdEZE5hjQxvXaT0nMC207j3kcOrIuBB2KnXMFJP-JiGiKmy9uOjtFO0iIHAiyxPgqFKy6iHhS0i78nVtmrx1W78l8-omxGkPXsQsKPU7Kg72dl04ULkTI5laJz567-OZwcBCZgEWlXhEzTDBzg3FcV1173x5CQEUg97zKdFNR1SVNMKadsc2MqKxtNboztzo5dEX_38ay2MRfZ_AakqbTeX5tze6MjVfG5WkIhlE"
          />
        </div>
      </section>

      {/* Interactive Bento section */}
      <div id="interactive-demo" className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-16 scroll-mt-24">
        {/* Explained Details Panel */}
        <div className="lg:col-span-5 glass-card p-6 md:p-8 rounded-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 rounded-lg bg-tertiary/10 border border-tertiary/20">
                <MapPin className="w-5 h-5 text-tertiary" />
              </div>
              <h2 className="font-display text-xl md:text-2xl font-semibold">Location Tracking</h2>
            </div>
            
            <p className="text-on-surface-variant text-sm md:text-base leading-relaxed mb-6 opacity-90">
              &quot;Free&quot; apps often monetize your physical presence. By mapping your GPS coordinates against points of interest, advertisers build a psychological profile of your habits, financial status, and personal associations.
            </p>
            
            <ul className="space-y-4">
              <li className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <span className="text-sm md:text-base text-on-surface">IP-based geolocation spoofing controls</span>
              </li>
              <li className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <span className="text-sm md:text-base text-on-surface">WiFi Triangulation defense filters</span>
              </li>
              <li className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <span className="text-sm md:text-base text-on-surface">Granular application permission manager</span>
              </li>
            </ul>
          </div>
          
          <div className="mt-8 pt-6 border-t border-white/5">
            <div className="flex justify-between items-center text-on-surface-variant font-mono text-xs">
              <span>ESTIMATED EXPOSURE REDUCTION</span>
              <span className="text-primary font-bold">98% COMPROMISED</span>
            </div>
            <div className="w-full bg-white/5 h-2 rounded-full mt-2 overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: "98%" }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="bg-primary h-full rounded-full shadow-[0_0_10px_rgba(164,201,255,0.6)]"
              ></motion.div>
            </div>
          </div>
        </div>

        {/* Live Simulator Panel */}
        <div className="lg:col-span-7 glass-card p-6 md:p-8 rounded-2xl overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-xl md:text-2xl font-semibold">Simulated Browser</h2>
            <span className="font-mono text-[10px] uppercase tracking-widest text-on-surface-variant flex items-center bg-white/5 px-2.5 py-1 rounded-full border border-white/10">
              <span className="w-2 h-2 bg-primary rounded-full mr-2 animate-pulse"></span>
              Live Simulator
            </span>
          </div>

          {/* Browser UI Mockup */}
          <div className="rounded-xl overflow-hidden border border-white/10 bg-black shadow-2xl">
            {/* Top Bar controls */}
            <div className="bg-surface-container-high p-2.5 flex items-center space-x-2 border-b border-white/5">
              <div className="flex space-x-1.5 px-2">
                <div className="w-3 h-3 rounded-full bg-error/50"></div>
                <div className="w-3 h-3 rounded-full bg-tertiary/50"></div>
                <div className="w-3 h-3 rounded-full bg-primary/50"></div>
              </div>
              <div className="flex-1 bg-surface-dim rounded px-3 py-1 text-on-surface-variant text-xs flex justify-between items-center border border-white/5">
                <span className="font-mono select-none">https://secure-node.aegis.io/privacy-lab</span>
                <Lock className="w-3 h-3 text-primary" />
              </div>
            </div>

            {/* Simulated Map Area */}
            <div className="relative h-64 overflow-hidden bg-slate-900">
              {/* Grid map pattern background */}
              <div 
                className="absolute inset-0 bg-cover bg-center opacity-30 grayscale filter"
                style={{ 
                  backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuD4-VDOpvcdzexpQd1NcyhgBH6VVaO9M02ULT30_xU89cuCHathrZMvV382riaFrkbwzdxBh03pkFrV97-FWiv7NH-JtXYJ1HiuR6YnvmBqGPeJT8zmcxbb7kXK6myjjB1gheKEJtwPLPtpRydnjD9m-jCD_t1CkEP5PWvPakdDpXGuIcgUu-EF3OwvzC0DxLoWOSkjvT466lNNieIDgiCqKU-r3FKktM1pQi27JyYK7Zq7RfbQk9Bu-L4ECc6CON9zG57aYTttRsf3')`,
                }}
              ></div>

              {/* Grid overlay lines */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px]"></div>

              {/* Animate states */}
              <AnimatePresence mode="wait">
                {simulatorState === "prompt" && (
                  <motion.div 
                    key="prompt"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0 flex items-center justify-center p-4 z-10 bg-black/40 backdrop-blur-sm"
                  >
                    <div className="bg-surface-bright/90 backdrop-blur-md p-5 rounded-xl border border-white/10 shadow-2xl max-w-sm w-full">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center">
                          <MapPin className="w-5 h-5 text-primary" />
                        </div>
                        <p className="font-bold text-sm text-on-surface">Aegis Secure Node</p>
                      </div>
                      
                      <p className="text-xs text-on-surface-variant mb-5 leading-relaxed">
                        This site wants to know your location coordinates to provide customized geo-security logs.
                      </p>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <button 
                          onClick={() => handleResponse("deny")}
                          className="py-2.5 rounded-lg border border-white/15 hover:bg-error/15 hover:border-error/40 transition-all font-bold text-xs text-on-surface hover:text-error cursor-pointer"
                        >
                          Deny Access
                        </button>
                        <button 
                          onClick={() => handleResponse("allow")}
                          className="py-2.5 rounded-lg bg-primary text-on-primary font-bold text-xs shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all cursor-pointer"
                        >
                          Allow Access
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {simulatorState === "success" && (
                  <motion.div 
                    key="success"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-primary-container/10 backdrop-blur-md"
                  >
                    <motion.div 
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      className="w-14 h-14 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center mb-3 shadow-[0_0_15px_rgba(164,201,255,0.4)]"
                    >
                      <ShieldCheck className="w-7 h-7 text-primary" />
                    </motion.div>
                    <p className="font-display text-lg font-bold text-primary">Privacy Lockdown Active</p>
                    <p className="font-mono text-xs text-on-surface-variant mt-1 opacity-70">
                      Data packet redirected to null/dev successfully
                    </p>
                    <button 
                      onClick={handleReset}
                      className="mt-4 text-xs text-primary underline hover:text-primary-container cursor-pointer font-semibold"
                    >
                      Reset Simulator
                    </button>
                  </motion.div>
                )}

                {simulatorState === "warning" && (
                  <motion.div 
                    key="warning"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-error/10 backdrop-blur-md"
                  >
                    <motion.div 
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      className="w-14 h-14 rounded-full bg-error/20 border-2 border-error flex items-center justify-center mb-3 shadow-[0_0_15px_rgba(255,180,171,0.3)]"
                    >
                      <ShieldAlert className="w-7 h-7 text-error" />
                    </motion.div>
                    <p className="font-display text-lg font-bold text-error">Access coordinates Exposed</p>
                    <p className="font-mono text-xs text-on-surface-variant mt-1 opacity-70">
                      Exposed to Tracker Node: <span className="text-error font-semibold">0xf42a...9c</span>
                    </p>
                    <button 
                      onClick={handleReset}
                      className="mt-4 px-4 py-2 bg-error text-on-error hover:bg-error/90 rounded font-semibold text-xs transition-all cursor-pointer shadow-lg shadow-error/10"
                    >
                      Retry Shield Mission
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* 3 Steps section */}
      <section className="mb-8">
        <h2 className="font-display text-xl md:text-2xl font-semibold mb-6 text-primary">Mitigation Guidelines</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card p-6 md:p-8 rounded-2xl relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
            <div className="font-display text-7xl absolute -right-3 -top-5 opacity-10 pointer-events-none select-none font-extrabold text-primary">01</div>
            <div className="mb-5">
              <div className="w-10 h-10 rounded-lg bg-tertiary/10 border border-tertiary/20 flex items-center justify-center text-tertiary">
                <EyeOff className="w-5 h-5" />
              </div>
            </div>
            <h3 className="font-display text-lg font-semibold mb-2">Incognito Browsing</h3>
            <p className="text-on-surface-variant text-sm leading-relaxed opacity-80">
              Use privacy-hardened browsers and secure sandboxed nodes to mask your unique digital fingerprint, preventing automated site trackers.
            </p>
          </div>

          <div className="glass-card p-6 md:p-8 rounded-2xl relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
            <div className="font-display text-7xl absolute -right-3 -top-5 opacity-10 pointer-events-none select-none font-extrabold text-primary">02</div>
            <div className="mb-5">
              <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <RotateCcw className="w-5 h-5" />
              </div>
            </div>
            <h3 className="font-display text-lg font-semibold mb-2">Cookie Hygiene</h3>
            <p className="text-on-surface-variant text-sm leading-relaxed opacity-80">
              Regularly flush persistent local storage states and discard third-party scripts tracking cross-domain navigation.
            </p>
          </div>

          <div className="glass-card p-6 md:p-8 rounded-2xl relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
            <div className="font-display text-7xl absolute -right-3 -top-5 opacity-10 pointer-events-none select-none font-extrabold text-primary">03</div>
            <div className="mb-5">
              <div className="w-10 h-10 rounded-lg bg-secondary/10 border border-secondary/20 flex items-center justify-center text-secondary">
                <Sliders className="w-5 h-5" />
              </div>
            </div>
            <h3 className="font-display text-lg font-semibold mb-2">Privacy Settings</h3>
            <p className="text-on-surface-variant text-sm leading-relaxed opacity-80">
              Audit global user account privileges, minimizing public exposures, telemetry streams, and unrequested network logs.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
