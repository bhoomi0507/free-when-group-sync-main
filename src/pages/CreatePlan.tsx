import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Copy, Check, Send, Sparkles } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import TimeRangeSlider from "@/components/create/TimeRangeSlider";
import DurationSlider from "@/components/create/DurationSlider";

const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

type Step = "title" | "duration" | "days" | "time" | "generating" | "done";

/* ─── helpers ────────────────────────────────────────────────── */
const getTimeDescription = (start: number, end: number): string => {
  if (start <= 6 && end >= 22)  return "pretty much anytime works";
  if (start >= 22 || end <= 5)  return "night owl hours";
  if (start >= 20)              return "late evening vibes";
  if (start >= 17 && end <= 23) return "evening works";
  if (start >= 14 && end <= 20) return "afternoon into evening";
  if (start >= 12 && end <= 17) return "afternoon hangout";
  if (start >= 6  && end <= 12) return "morning energy";
  const fmt = (h: number) => {
    const p = h < 12 ? "AM" : "PM";
    const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return `${h12}:00 ${p}`;
  };
  return `roughly ${fmt(start)} → ${fmt(end)}`;
};

const durationLabel = (v: number) =>
  v === 0.5 ? "30m" : Number.isInteger(v) ? `${v}h` : `${v}h`;

/* Flexibility hint for the time window */
const flexibilityHint = (start: number, end: number): { text: string; color: string } | null => {
  const span = end - start;
  if (span <= 2)  return { text: "might be hard to match — tight window", color: "text-warm" };
  if (span >= 8)  return { text: "good flexibility — easy to find overlap", color: "text-highlight" };
  if (span >= 5)  return { text: "decent flexibility", color: "text-accent" };
  return null;
};

/* ─── Blinking dot ──────────────────────────────────────────── */
const LiveDot = () => (
  <span className="relative inline-flex h-1.5 w-1.5 ml-1.5">
    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-highlight opacity-60" />
    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-highlight" />
  </span>
);

const CreatePlan = () => {
  const [step, setStep]           = useState<Step>("title");
  const [title, setTitle]         = useState("");
  const handleTitleSubmit = () => {
    if (!title.trim()) return;
    setStep("duration");
  };
  const [duration, setDuration]   = useState(1);
  const [selectedDays, setSelectedDays] = useState<Set<string>>(new Set());
  const [timeRange, setTimeRange] = useState<[number, number]>([14, 21]);
  const [copied, setCopied]       = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  /* returning user memory */
  const storedName = localStorage.getItem("linkup-name");
  const navigate = useNavigate();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [step]);

  const handleTimeSubmit = async () => {
  try {
    setStep("generating");

   const res = await fetch(`${import.meta.env.VITE_API_URL}/plans`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });

    const data = await res.json();

    if (!res.ok) throw new Error("Failed to create plan");

    navigate(`/availability/${data.id}`);

  } catch (err) {
    console.error(err);
    alert("Something went wrong creating the plan.");
    setStep("time");
  }
};
  const handleDurationNext = () => setStep("days");
  const handleDaysNext     = () => { if (selectedDays.size > 0) setStep("time"); };
  
  const toggleDay = (d: string) => {
    setSelectedDays(prev => {
      const next = new Set(prev);
      next.has(d) ? next.delete(d) : next.add(d);
      return next;
    });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText("https://linkup.app/join/abc123");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const msgIn = {
    initial:    { opacity: 0, y: 14, scale: 0.97 },
    animate:    { opacity: 1, y: 0,  scale: 1 },
    transition: { duration: 0.42, ease: [0.34, 1.56, 0.64, 1] as [number, number, number, number] },
  };

  const cardBase = "rounded-3xl border border-border shadow-soft p-6 card-tinted";

  const hint = flexibilityHint(timeRange[0], timeRange[1]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-28 pb-20">
        <div className="container mx-auto px-6 max-w-lg">

          {/* ── Returning user greeting ──────────────────────────── */}
          {storedName && (
            <motion.p
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs font-mono text-muted-foreground/60 mb-3 ml-1 flex items-center"
            >
              welcome back, {storedName}
              <LiveDot />
            </motion.p>
          )}

          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8 font-ui"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>

          <div className="space-y-4">

            {/* ── Step 1: Title ─────────────────────────────────── */}
            <motion.div {...msgIn} className={cardBase}>
              <p className="text-sm text-muted-foreground mb-1 font-ui">What are we planning?</p>
              <p className="text-xs text-muted-foreground/40 font-mono mb-3">give it a name people will recognize</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleTitleSubmit()}
                  placeholder="weekend hangout, study session…"
                  disabled={step !== "title"}
                  className="flex-1 h-11 px-4 rounded-2xl bg-muted/50 border border-border text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent/30 transition-all disabled:opacity-60 font-ui text-sm caret-accent"
                />
                {step === "title" && (
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={handleTitleSubmit}
                    disabled={!title.trim()}
                    className="h-11 px-4 rounded-2xl bg-foreground text-background font-medium text-sm disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <Send className="h-4 w-4" />
                  </motion.button>
                )}
              </div>
              {step !== "title" && title && (
                <p className="mt-2 text-sm font-medium text-foreground font-ui">→ {title}</p>
              )}
            </motion.div>

            {/* ── Step 2: Duration ──────────────────────────────── */}
            <AnimatePresence>
              {step !== "title" && (
                <motion.div {...msgIn} className={cardBase}>
                  <p className="text-sm text-muted-foreground mb-1 font-ui">How long will it take?</p>
                  <p className="text-xs text-muted-foreground/40 font-mono mb-5">helps people block the right amount of time</p>
                  {step === "duration" ? (
                    <div className="space-y-5">
                      <DurationSlider value={duration} onChange={setDuration} />
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={handleDurationNext}
                        className="h-10 w-full rounded-2xl bg-foreground text-background font-medium text-sm font-ui"
                      >
                        Next
                      </motion.button>
                    </div>
                  ) : (
                    <p className="text-sm font-medium text-foreground font-ui">→ {durationLabel(duration)}</p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Step 3: Days ──────────────────────────────────── */}
            <AnimatePresence>
              {(step === "days" || step === "time" || step === "generating" || step === "done") && (
                <motion.div {...msgIn} className={cardBase}>
                  <p className="text-sm text-muted-foreground mb-1 font-ui">Which days work?</p>
                  <p className="text-xs text-muted-foreground/40 font-mono mb-3">pick all that could work, not just perfect ones</p>
                  {step === "days" ? (
                    <>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {daysOfWeek.map((d) => (
                          <motion.button
                            key={d}
                            whileTap={{ scale: 0.93 }}
                            onClick={() => toggleDay(d)}
                            className={`px-4 py-2 rounded-xl text-sm font-medium font-ui transition-all ${
                              selectedDays.has(d)
                                ? "bg-foreground text-background"
                                : "bg-muted/50 text-foreground hover:bg-muted"
                            }`}
                          >
                            {d}
                          </motion.button>
                        ))}
                      </div>
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={handleDaysNext}
                        disabled={selectedDays.size === 0}
                        className="h-10 px-5 rounded-2xl bg-foreground text-background font-medium text-sm font-ui disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        Next
                      </motion.button>
                    </>
                  ) : (
                    <p className="text-sm font-medium text-foreground font-ui">→ {Array.from(selectedDays).join(", ")}</p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Step 4: Time Range ────────────────────────────── */}
            <AnimatePresence>
              {(step === "time" || step === "generating" || step === "done") && (
                <motion.div {...msgIn} className={cardBase}>
                  <p className="text-sm text-muted-foreground mb-1 font-ui">What time roughly?</p>
                  <p className="text-xs text-muted-foreground/40 font-mono mb-5">broader = easier to match</p>
                  {step === "time" ? (
                    <div className="space-y-5">
                      <TimeRangeSlider value={timeRange} onChange={setTimeRange} />

                      {/* Flexibility feedback */}
                      <AnimatePresence mode="wait">
                        {hint && (
                          <motion.p
                            key={hint.text}
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            transition={{ duration: 0.25 }}
                            className={`text-xs font-mono text-center ${hint.color}`}
                          >
                            {hint.text}
                          </motion.p>
                        )}
                      </AnimatePresence>

                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={handleTimeSubmit}
                        className="h-10 w-full rounded-2xl bg-foreground text-background font-medium text-sm font-ui"
                      >
                        Create invite ✨
                      </motion.button>
                    </div>
                  ) : (
                    <p className="text-sm font-medium text-foreground font-ui">
                      → {getTimeDescription(timeRange[0], timeRange[1])}
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Generating ────────────────────────────────────── */}
            <AnimatePresence>
              {step === "generating" && (
                <motion.div {...msgIn} className={`${cardBase} text-center`}>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="inline-block mb-3"
                  >
                    <Sparkles className="h-6 w-6 text-accent" />
                  </motion.div>
                  <p className="text-sm text-muted-foreground font-mono">creating your invite…</p>
                  <p className="text-xs text-muted-foreground/40 font-mono mt-1">just a sec</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Done — Share card ─────────────────────────────── */}
            <AnimatePresence>
              {step === "done" && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 16 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
                  className="rounded-3xl p-6"
                  style={{
                    background: "linear-gradient(135deg, hsl(var(--accent)/0.08), hsl(var(--highlight)/0.06))",
                    border: "1px solid hsl(var(--accent)/0.25)",
                    boxShadow: "0 0 24px -6px hsl(var(--accent)/0.15), inset 0 1px 0 0 hsl(0,0%,100%,0.08)",
                  }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="h-4 w-4 text-highlight" />
                    <p className="text-sm font-medium text-highlight font-ui">invite ready</p>
                    <LiveDot />
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex-1 h-11 px-4 rounded-xl bg-muted/50 border border-border flex items-center">
                      <span className="text-sm font-mono text-foreground truncate">linkup.app/join/abc123</span>
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={handleCopy}
                      className="h-11 px-4 rounded-xl bg-foreground text-background font-medium text-sm font-ui flex items-center gap-2 shrink-0"
                    >
                      {copied
                        ? <><Check className="h-4 w-4" /> Copied!</>
                        : <><Copy className="h-4 w-4" /> Copy</>}
                    </motion.button>
                  </div>
                  <button className="w-full h-10 rounded-xl bg-highlight/10 text-highlight font-medium text-sm font-ui flex items-center justify-center gap-2 hover:bg-highlight/15 transition-all">
                    <Send className="h-4 w-4" /> Drop in group chat
                  </button>
                  <p className="text-xs text-muted-foreground/40 font-mono text-center mt-3">
                    page updates as people respond
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            <div ref={bottomRef} />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CreatePlan;
