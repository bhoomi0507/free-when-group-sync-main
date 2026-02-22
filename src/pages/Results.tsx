import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Crown, Lock, Calendar, Clock, Users, X, Copy, Check } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const attendees = [
  { name: "You",    available: true,  avatar: "Y" },
  { name: "Arjun",  available: true,  avatar: "A" },
  { name: "Priya",  available: true,  avatar: "P" },
  { name: "Rahul",  available: true,  avatar: "R" },
  { name: "Sneha",  available: true,  avatar: "S" },
  { name: "Vikram", available: false, avatar: "V" },
];

const alternates = [
  { time: "Fri 7–9 PM",  count: 4 },
  { time: "Sun 3–5 PM",  count: 3 },
];

/* ─── Result reveal sequence ──────────────────────────────────
   idle → heatmap → intensify → lock → revealed
*/
type RevealPhase = "idle" | "heatmap" | "intensify" | "lock" | "revealed";

/* ─── Blinking dot ──────────────────────────────────────────── */
const LiveDot = () => (
  <span className="relative inline-flex h-2 w-2 ml-1">
    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-highlight opacity-60" />
    <span className="relative inline-flex rounded-full h-2 w-2 bg-highlight" />
  </span>
);

const Results = () => {
  const [phase, setPhase]           = useState<RevealPhase>("idle");
  const [finalized, setFinalized]   = useState(false);
  const [showRipple, setShowRipple] = useState(false);
  const [nudgeCopied, setNudgeCopied] = useState(false);
  const isOwner = true; // simulated

  /* kick off reveal sequence on mount */
  useEffect(() => {
    const t0 = setTimeout(() => setPhase("heatmap"),    400);
    const t1 = setTimeout(() => setPhase("intensify"),  1400);
    const t2 = setTimeout(() => setPhase("lock"),       2400);
    const t3 = setTimeout(() => setPhase("revealed"),   3200);
    return () => { clearTimeout(t0); clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  const handleFinalize = () => {
    setFinalized(true);
    setShowRipple(true);
    setTimeout(() => setShowRipple(false), 1400);
  };

  const handleNudge = () => {
    navigator.clipboard.writeText(
      "hey, fill this so we can exist at the same time → linkup.app/join/abc123"
    );
    setNudgeCopied(true);
    setTimeout(() => setNudgeCopied(false), 2200);
  };

  const isRevealed = phase === "revealed";

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <Navbar />

      {/* Ripple on finalize */}
      <AnimatePresence>
        {showRipple && (
          <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center">
            {[0, 0.18, 0.36].map((delay, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0, opacity: 0.5 }}
                animate={{ scale: 4, opacity: 0 }}
                transition={{ duration: 1.1, delay, ease: "easeOut" }}
                className="absolute w-24 h-24 rounded-full border-2 border-highlight/40"
              />
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Owner nudge panel (floating) */}
      {isOwner && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 3.6, duration: 0.4 }}
          className="fixed right-5 bottom-24 z-40 hidden md:block"
        >
          <div className="bg-card border border-border rounded-2xl p-4 shadow-float w-52 card-tinted">
            <p className="text-xs font-ui text-muted-foreground mb-2">still waiting on people?</p>
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={handleNudge}
              className="w-full h-9 rounded-xl bg-muted/60 hover:bg-muted text-foreground text-xs font-ui font-medium flex items-center justify-center gap-2 transition-all"
            >
              <AnimatePresence mode="wait">
                {nudgeCopied ? (
                  <motion.span key="done" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-1.5 text-highlight">
                    <Check className="h-3.5 w-3.5" /> copied!
                  </motion.span>
                ) : (
                  <motion.span key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-1.5">
                    <Copy className="h-3.5 w-3.5" /> nudge friends
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
            <p className="text-[10px] text-muted-foreground/50 font-mono mt-2 text-center">copies a reminder message</p>
          </div>
        </motion.div>
      )}

      <div className="pt-28 pb-20">
        <div className="container mx-auto px-6 max-w-4xl">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8 font-ui">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>

          {/* ── Heatmap reveal (pre-result) ─────────────────────── */}
          <AnimatePresence>
            {!isRevealed && (
              <motion.div
                key="heatmap-reveal"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.4 } }}
                className="mb-8"
              >
                <p className="text-sm font-mono text-muted-foreground mb-4 text-center">
                  {phase === "heatmap"   && "reading everyone's free time…"}
                  {phase === "intensify" && "finding the overlap…"}
                  {phase === "lock"      && "locking in the best moment…"}
                  {phase === "idle"      && ""}
                </p>
                {/* Mini heatmap grid that reveals */}
                <div className="bg-card rounded-3xl border border-border p-6 shadow-soft card-tinted">
                  <div className="grid grid-cols-7 gap-1.5 mb-1">
                    {["M","T","W","T","F","S","S"].map((d, i) => (
                      <div key={i} className="text-center text-[10px] font-mono text-muted-foreground">{d}</div>
                    ))}
                  </div>
                  <div className="space-y-1">
                    {Array.from({ length: 5 }).map((_, row) => (
                      <div key={row} className="grid grid-cols-7 gap-1.5">
                        {Array.from({ length: 7 }).map((_, col) => {
                          const heat = [
                            [0,0,0,1,2,4,2],[0,0,0,1,3,4,2],[0,0,0,1,3,4,1],[0,0,0,0,2,3,0],[0,0,0,0,1,2,0]
                          ][row][col];
                          const isBest = row <= 2 && col === 5;
                          const shouldGlow = phase === "intensify" || phase === "lock";
                          const shouldExpand = phase === "lock" && isBest;

                          return (
                            <motion.div
                              key={col}
                              animate={phase === "heatmap" ? { opacity: [0, 1] } : {}}
                              transition={{ delay: (row * 7 + col) * 0.015, duration: 0.3 }}
                              className={`h-8 rounded-lg transition-all duration-500 ${
                                isBest && shouldGlow
                                  ? "bg-highlight/60 shadow-[0_0_12px_-2px_hsl(var(--highlight)/0.6)]"
                                  : heat >= 4 ? "bg-highlight/40"
                                  : heat >= 3 ? "bg-highlight/28"
                                  : heat >= 2 ? "bg-highlight/14"
                                  : heat >= 1 ? "bg-highlight/[0.07]"
                                  : "bg-muted/50"
                              } ${shouldExpand ? "scale-110 z-10" : ""}`}
                            />
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Hero result card ─────────────────────────────────── */}
          <AnimatePresence>
            {isRevealed && (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 24, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.55, ease: [0.34, 1.56, 0.64, 1] }}
                className={`rounded-3xl border p-8 md:p-10 text-center mb-8 transition-all duration-500 ${
                  finalized
                    ? "bg-highlight/5 border-highlight/20 shadow-glow-accent"
                    : "bg-card border-border shadow-elevated card-tinted"
                }`}
              >
                <motion.div
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1, type: "spring", stiffness: 400, damping: 22 }}
                  className="w-14 h-14 rounded-2xl bg-highlight/10 flex items-center justify-center mx-auto mb-4"
                >
                  {finalized
                    ? <Lock className="h-7 w-7 text-highlight" />
                    : <CheckCircle2 className="h-7 w-7 text-highlight" />}
                </motion.div>

                <div className="flex items-center justify-center gap-2 mb-2">
                  <p className="text-sm font-medium text-highlight uppercase tracking-wider font-mono">
                    {finalized ? "plan locked 🔒" : "this works"}
                  </p>
                  {!finalized && <LiveDot />}
                </div>

                <motion.h1
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="font-heading text-4xl md:text-5xl text-foreground mb-3"
                >
                  Saturday 6–8 PM
                </motion.h1>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="flex items-center justify-center gap-5 text-sm text-muted-foreground font-ui"
                >
                  <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" /> Feb 22</span>
                  <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" /> 2 hours</span>
                  <span className="flex items-center gap-1.5"><Users className="h-4 w-4" /> 5/6 people</span>
                </motion.div>

                {!finalized && (
                  <motion.button
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleFinalize}
                    className="mt-8 bg-foreground text-background px-8 py-3.5 rounded-2xl font-semibold font-ui hover:opacity-90 transition-all inline-flex items-center gap-2"
                  >
                    <Lock className="h-4 w-4" /> Lock the plan
                  </motion.button>
                )}

                {finalized && (
                  <motion.p
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 text-sm text-highlight font-medium font-mono"
                  >
                    rare moment achieved — you all exist at the same time ✨
                  </motion.p>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Attendees + alternates (appear after reveal) ─────── */}
          <AnimatePresence>
            {isRevealed && (
              <motion.div
                key="details"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.5 }}
                className="grid md:grid-cols-2 gap-6"
              >
                {/* People */}
                <div className="bg-card rounded-3xl border border-border shadow-soft p-6 card-tinted">
                  <h3 className="font-heading text-lg text-foreground mb-4 flex items-center gap-2">
                    <Users className="h-5 w-5 text-accent" /> People
                  </h3>
                  <div className="space-y-3">
                    {attendees.filter(a => a.available).map((a, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-foreground flex items-center justify-center text-xs font-bold font-ui text-background">
                          {a.avatar}
                        </div>
                        <span className="text-sm font-medium text-foreground font-ui flex-1">{a.name}</span>
                        <span className="text-xs font-medium text-highlight font-ui flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5" /> In
                        </span>
                        {i === 0 && <Crown className="h-4 w-4 text-warm" />}
                      </div>
                    ))}
                    {attendees.filter(a => !a.available).map((a, i) => (
                      <div key={i} className="flex items-center gap-3 opacity-40">
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold font-ui text-muted-foreground">
                          {a.avatar}
                        </div>
                        <span className="text-sm font-medium text-muted-foreground font-ui flex-1">{a.name}</span>
                        <span className="text-xs text-muted-foreground font-ui flex items-center gap-1">
                          <X className="h-3.5 w-3.5" /> can't make it
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Alternates */}
                <div className="bg-card rounded-3xl border border-border shadow-soft p-6 card-tinted">
                  <h3 className="font-heading text-lg text-foreground mb-4 flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-accent" /> Other options
                  </h3>
                  <div className="space-y-3">
                    {alternates.map((alt, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-muted/40">
                        <span className="text-sm font-mono font-medium text-foreground">{alt.time}</span>
                        <span className="text-xs text-muted-foreground font-ui">{alt.count}/6 people</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-5">
                    <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider font-mono">free time heatmap</p>
                    <div className="grid grid-cols-7 gap-1">
                      {Array.from({ length: 21 }).map((_, i) => {
                        const heat = [9,10,11].includes(i) ? 4 : [4,5,16,17].includes(i) ? 2 : [3,12,18].includes(i) ? 1 : 0;
                        return (
                          <div key={i} className={`h-6 rounded-lg ${
                            heat >= 4 ? "bg-highlight/50" : heat >= 2 ? "bg-highlight/20" : heat >= 1 ? "bg-highlight/8" : "bg-muted/50"
                          }`} />
                        );
                      })}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Results;
