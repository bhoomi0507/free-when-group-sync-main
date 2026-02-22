import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams } from "react-router-dom";
import { CheckCircle2, Send, Users, Sparkles } from "lucide-react";
import Navbar from "@/components/layout/Navbar";

const DAYS  = ["Mon 17", "Tue 18", "Wed 19", "Thu 20", "Fri 21", "Sat 22", "Sun 23"];
const TIMES = ["10 AM", "11 AM", "12 PM", "1 PM", "2 PM", "3 PM", "4 PM", "5 PM", "6 PM", "7 PM", "8 PM"];

const TOTAL_PEOPLE = 7;
const RESPONDED    = 3;


const existingSlots: Record<string, number> = {
  "Sat 22-6 PM": 4, "Sat 22-7 PM": 4, "Sat 22-8 PM": 3,
  "Fri 21-7 PM": 3, "Fri 21-8 PM": 2,
  "Sun 23-3 PM": 2, "Sun 23-4 PM": 2,
  "Thu 20-6 PM": 1, "Thu 20-7 PM": 1,
};

/* Ghost hint slots — shown before first interaction */
const GHOST_SLOTS = new Set([
  "Fri 21-5 PM","Fri 21-6 PM","Fri 21-7 PM",
  "Sat 22-5 PM","Sat 22-6 PM","Sat 22-7 PM",
]);

const statusTexts = [
  "waiting for humans…",
  "reading schedules…",
  "coordination happening…",
  "calculating social harmony…",
  "almost everyone's in…",
];

const heatColor = (count: number, isSelected: boolean, isGhost: boolean) => {
  if (isGhost)    return "bg-accent/8 border-accent/20 border";
  if (isSelected && count >= 3) return "bg-highlight/50 shadow-glow-accent border border-highlight/30";
  if (isSelected) return "bg-accent/25 border border-accent/25";
  if (count >= 4) return "bg-highlight/40";
  if (count >= 3) return "bg-highlight/25";
  if (count >= 2) return "bg-highlight/12";
  if (count >= 1) return "bg-highlight/[0.06]";
  return "bg-muted/40 hover:bg-muted/70";
};

/* ─── Blinking dot ──────────────────────────────────────────── */
const LiveDot = () => (
  <span className="relative inline-flex h-2 w-2 ml-2">
    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-highlight opacity-60" />
    <span className="relative inline-flex rounded-full h-2 w-2 bg-highlight" />
  </span>
);

const Availability = () => {
  const { planId } = useParams();
  const [plan, setPlan] = useState<any>(null);
  const isDemo     = planId === "demo";

  /* state */
  const [name, setName]                 = useState(() => localStorage.getItem("linkup-name") || "");
  const [nameSubmitted, setNameSubmitted] = useState(false);
  const [selected, setSelected]         = useState<Set<string>>(new Set());
  const [submitted, setSubmitted]       = useState(false);
  const [isDragging, setIsDragging]     = useState(false);
  const [dragMode, setDragMode]         = useState<"add"|"remove">("add");
  const [statusIndex, setStatusIndex]   = useState(0);
  const [responded, setResponded]       = useState(RESPONDED);
  const [showGhost, setShowGhost]       = useState(true);
  const nameRef = useRef<HTMLInputElement>(null);

  /* rotate status text */
  useEffect(() => {
    const t = setInterval(() => setStatusIndex(i => (i + 1) % statusTexts.length), 3000);
    return () => clearInterval(t);
  }, []);

  /* simulate one more person responding after submit */
  useEffect(() => {
    if (!submitted) return;
    const t = setTimeout(() => setResponded(r => Math.min(r + 1, TOTAL_PEOPLE)), 4000);
    return () => clearTimeout(t);
  }, [submitted]);

  /* auto-focus name input */
  useEffect(() => {
    if (!nameSubmitted) setTimeout(() => nameRef.current?.focus(), 400);
  }, [nameSubmitted]);
  useEffect(() => {
  const fetchPlan = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/plans/${planId}`);
      const data = await res.json();
      setPlan(data);
    } catch (err) {
      console.error("Failed to fetch plan", err);
    }
  };

  if (planId) fetchPlan();
}, [planId]);
console.log("PLAN:", plan);

  const handleNameSubmit = () => {
    if (!name.trim()) return;
    localStorage.setItem("linkup-name", name.trim());
    setNameSubmitted(true);
  };

  /* drag handlers */
  const handleMouseDown = (key: string) => {
    setIsDragging(true);
    const mode = selected.has(key) ? "remove" : "add";
    setDragMode(mode);
    toggleSlot(key, mode);
    if (showGhost) setShowGhost(false);
  };
  const handleMouseEnter = (key: string) => { if (isDragging) toggleSlot(key, dragMode); };
  const handleMouseUp    = () => setIsDragging(false);

  const toggleSlot = useCallback((key: string, mode: "add"|"remove") => {
    setSelected(prev => {
      const next = new Set(prev);
      mode === "remove" ? next.delete(key) : next.add(key);
      return next;
    });
  }, []);

  const progressPct   = Math.round((responded / TOTAL_PEOPLE) * 100);
  const isAllResponded = responded >= TOTAL_PEOPLE;
  const isNoneYet     = responded === 0;

  /* ── Name gate ──────────────────────────────────────────────── */
  if (!nameSubmitted) {
    const stored = localStorage.getItem("linkup-name");
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
            className="w-full max-w-md"
          >
            {/* Context strip */}
            <div className="bg-card border border-border rounded-3xl p-6 mb-4 shadow-soft card-tinted">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-base font-heading text-foreground">
                  {isDemo ? "Weekend Hangout" : "Your Plan"}
                </span>
                <LiveDot />
              </div>
              <p className="text-sm text-muted-foreground font-ui">
                {isDemo ? "Arjun" : "Someone"} invited you · takes ~10 seconds
              </p>
            </div>

            {/* Name input card */}
            <div className="bg-card border border-border rounded-3xl p-6 shadow-card card-tinted">
              <p className="text-sm text-muted-foreground mb-1 font-ui">
                {stored ? `welcome back, ${stored} 👋` : "what's your name?"}
              </p>
              <p className="text-xs text-muted-foreground/50 font-mono mb-4">
                so people know who marked what
              </p>
              <div className="flex gap-2">
                <input
                  ref={nameRef}
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleNameSubmit()}
                  placeholder={stored ? stored : "your name…"}
                  className="flex-1 h-11 px-4 rounded-2xl bg-muted/50 border border-border text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent/30 transition-all font-ui text-sm caret-accent"
                />
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleNameSubmit}
                  disabled={!name.trim()}
                  className="h-11 px-5 rounded-2xl bg-foreground text-background font-medium text-sm font-ui disabled:opacity-30"
                >
                  <Send className="h-4 w-4" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  /* ── Main grid view ─────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-background" onMouseUp={handleMouseUp}>
      <Navbar />

      {/* ── Sticky participation bar ── */}
      <div className="fixed top-0 left-0 right-0 z-50 pt-[4.5rem]">
        <div className="bg-card/80 backdrop-blur-xl border-b border-border px-6 py-2.5">
          <div className="container mx-auto max-w-5xl flex items-center gap-4">
            <div className="flex items-center gap-2 shrink-0">
              <Users className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs font-mono font-semibold text-foreground">
                {responded}/{TOTAL_PEOPLE}
              </span>
              <span className="text-xs text-muted-foreground font-ui">people responded</span>
            </div>

            <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
              <motion.div
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="h-full rounded-full"
                style={{ background: "linear-gradient(90deg, hsl(var(--accent)), hsl(var(--highlight)))" }}
              />
            </div>

            <AnimatePresence mode="wait">
              {isAllResponded ? (
                <motion.span key="done" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs font-mono text-highlight shrink-0">
                  rare achievement unlocked ✨
                </motion.span>
              ) : isNoneYet ? (
                <motion.span key="none" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs font-mono text-muted-foreground/50 shrink-0">
                  you're the responsible one
                </motion.span>
              ) : (
                <motion.span
                  key={statusIndex}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.3 }}
                  className="text-xs font-mono text-muted-foreground/50 shrink-0"
                >
                  {statusTexts[statusIndex]}
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="pt-36 pb-32">
        <div className="container mx-auto px-6 max-w-5xl">

          {/* Plan header */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="font-heading text-3xl text-foreground">
                {plan ? plan.title : "Loading..."}
              </h1>
              <LiveDot />
            </div>
            <p className="text-sm text-muted-foreground font-ui">
              {isDemo ? "Arjun" : "Someone"} invited you · mark all times you could come
            </p>
          </motion.div>

          {/* Ghost hint overlay text */}
          <AnimatePresence>
            {showGhost && selected.size === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.4 } }}
                className="mb-3 flex items-center gap-2"
              >
                <Sparkles className="h-3.5 w-3.5 text-accent/60" />
                <span className="text-xs font-ui text-accent/70 italic">
                  mark ALL times you could come — not just the perfect one
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-card rounded-3xl border border-border shadow-card p-4 md:p-6 select-none card-tinted"
          >
            <div className="overflow-x-auto">
              <div className="min-w-[640px]">
                <div className="grid grid-cols-8 gap-1.5 mb-2">
                  <div />
                  {DAYS.map(d => (
                    <div key={d} className="text-center text-xs font-mono font-semibold text-muted-foreground py-2">{d}</div>
                  ))}
                </div>

                {TIMES.map(time => (
                  <div key={time} className="grid grid-cols-8 gap-1.5 mb-1.5">
                    <div className="text-xs font-mono text-muted-foreground flex items-center justify-end pr-2 whitespace-nowrap">{time}</div>
                    {DAYS.map(day => {
                      const key     = `${day}-${time}`;
                      const count   = existingSlots[key] || 0;
                      const isSel   = selected.has(key);
                      const isGhost = showGhost && GHOST_SLOTS.has(key) && !isSel;
                      return (
                        <motion.button
                          key={key}
                          onMouseDown={() => handleMouseDown(key)}
                          onMouseEnter={() => handleMouseEnter(key)}
                          whileTap={{ scale: 0.88 }}
                          animate={isSel ? { scale: [1, 1.06, 1] } : { scale: 1 }}
                          transition={{ duration: 0.25, ease: [0.34, 1.56, 0.64, 1] }}
                          className={`h-10 rounded-xl transition-all duration-150 cursor-pointer relative group ${heatColor(count, isSel, isGhost)}`}
                        >
                          {isGhost && (
                            <span className="absolute inset-0 flex items-center justify-center text-[9px] font-mono text-accent/40">
                              tap
                            </span>
                          )}
                          {count > 0 && !isGhost && (
                            <span className="absolute inset-0 flex items-center justify-center text-[10px] font-mono font-bold text-foreground/30 group-hover:text-foreground/50 transition-colors">
                              {count}
                            </span>
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground font-ui flex-wrap">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-muted/40 inline-block" /> No one</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-highlight/12 inline-block" /> 1–2 people</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-highlight/40 inline-block" /> 4+</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-accent/25 inline-block" /> your free time</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Bottom bar ─────────────────────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 glass-panel-strong border-t border-border">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between max-w-5xl">
          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div
                key="submitted"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2"
              >
                <CheckCircle2 className="h-4 w-4 text-highlight" />
                <span className="text-sm font-ui font-medium text-highlight">You're in</span>
                <LiveDot />
              </motion.div>
            ) : (
              <motion.p key="slots" className="text-sm text-muted-foreground font-ui">
                <span className="font-semibold text-foreground">{selected.size}</span> slots marked
              </motion.p>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.p
                key="waiting"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-muted-foreground font-mono"
              >
                this page updates automatically
              </motion.p>
            ) : (
              <motion.button
                key="submit"
                whileTap={{ scale: 0.97 }}
                onClick={() => { if (selected.size > 0) setSubmitted(true); }}
                disabled={selected.size === 0}
                className="bg-foreground text-background px-6 py-3 rounded-2xl font-semibold font-ui flex items-center gap-2 hover:opacity-90 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <CheckCircle2 className="h-4 w-4" /> I'm free
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Availability;
