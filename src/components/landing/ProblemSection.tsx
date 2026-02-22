import { motion, useInView, AnimatePresence } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { CheckCircle2, Users, Clock } from "lucide-react";

/* ─── conversation script ──────────────────────────────────────
   Each entry has:
   - text: message content
   - side: which side of the chat
   - pauseBefore: extra breathing room before typing starts (ms)
     (in addition to the base inter-message gap)
   - typingDuration: how long the "..." indicator shows (ms)
*/
const SCRIPT = [
  { text: "kal free?",       side: "left"  as const, pauseBefore: 0,    typingDuration: 400 },
  { text: "class hai 😩",    side: "right" as const, pauseBefore: 0,    typingDuration: 500 },
  { text: "lab hai bro",     side: "left"  as const, pauseBefore: 0,    typingDuration: 350 },
  { text: "tuition 4-6",     side: "right" as const, pauseBefore: 900,  typingDuration: 350 },
  { text: "next week?",      side: "left"  as const, pauseBefore: 0,    typingDuration: 450 },
  { text: "never mind 😐",   side: "right" as const, pauseBefore: 1200, typingDuration: 550 },
];

/* Inter-message gap: randomized 600–900 ms between each message */
const randGap = () => 600 + Math.random() * 300;

/* ─── Typing dots sub-component ────────────────────────────── */
const TypingDots = ({ side }: { side: "left" | "right" }) => (
  <div className={`flex ${side === "right" ? "justify-end" : "justify-start"}`}>
    <div className={`px-4 py-3 rounded-2xl ${
      side === "right"
        ? "bg-accent/10 rounded-br-md"
        : "bg-muted rounded-bl-md"
    } flex items-center gap-1`}>
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 inline-block"
          animate={{ y: [0, -4, 0] }}
          transition={{
            duration: 0.55,
            repeat: Infinity,
            delay: i * 0.15,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  </div>
);

/* ─── Section ───────────────────────────────────────────────── */
const ProblemSection = () => {
  const ref         = useRef<HTMLDivElement>(null);
  const isInView    = useInView(ref, { once: true, margin: "-100px" });

  /* visibleMessages: array of indices that have finished "typing" and are shown */
  const [visibleMessages, setVisibleMessages] = useState<number[]>([]);
  /* typingIndex: which message is currently showing the typing indicator (-1 = none) */
  const [typingIndex, setTypingIndex]         = useState<number>(-1);
  const [showResult, setShowResult]           = useState(false);

  useEffect(() => {
    if (!isInView) return;

    let cancelled = false;
    const timeouts: ReturnType<typeof setTimeout>[] = [];

    const schedule = (fn: () => void, ms: number) => {
      const t = setTimeout(() => { if (!cancelled) fn(); }, ms);
      timeouts.push(t);
      return ms;
    };

    /* Walk through each message sequentially */
    let cursor = 0; // running ms from start

    SCRIPT.forEach((msg, i) => {
      /* 1. Optional extra pause before this message's typing starts */
      cursor += msg.pauseBefore;

      /* 2. Show typing indicator */
      const typingStart = cursor;
      schedule(() => setTypingIndex(i), typingStart);

      /* 3. After typing duration, hide dots and reveal message */
      cursor += msg.typingDuration;
      const revealAt = cursor;
      schedule(() => {
        setTypingIndex(-1);
        setVisibleMessages((prev) => [...prev, i]);
      }, revealAt);

      /* 4. Randomised gap before next message's pause/typing begins */
      cursor += randGap();
    });

    /* Show result card after all messages + a little extra breathing room */
    const resultDelay = cursor + 800;
    schedule(() => setShowResult(true), resultDelay);

    return () => {
      cancelled = true;
      timeouts.forEach(clearTimeout);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInView]);

  return (
    <section ref={ref} className="py-28 relative overflow-hidden">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-heading text-3xl md:text-5xl text-foreground mb-4">
            Sound familiar?
          </h2>
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            group chats shouldn't need negotiations
          </p>
        </motion.div>

        <div className="max-w-lg mx-auto relative min-h-[340px]">
          {/* ── Chat thread ──────────────────────────────────── */}
          <div className={`transition-all duration-700 ${showResult ? "opacity-0 scale-95 blur-sm" : "opacity-100"}`}>
            <div className="space-y-3">

              {/* Rendered (revealed) messages */}
              {SCRIPT.map((msg, i) => (
                <AnimatePresence key={i}>
                  {visibleMessages.includes(i) && (
                    <motion.div
                      initial={{ opacity: 0, x: msg.side === "right" ? 16 : -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.35, ease: "easeOut" }}
                      className={`flex ${msg.side === "right" ? "justify-end" : "justify-start"}`}
                    >
                      <div className={`px-4 py-2.5 rounded-2xl text-sm font-medium max-w-[200px] ${
                        msg.side === "right"
                          ? "bg-accent/10 text-foreground rounded-br-md"
                          : "bg-muted text-foreground rounded-bl-md"
                      }`}>
                        {msg.text}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              ))}

              {/* Typing indicator — shown for the current typing message */}
              <AnimatePresence>
                {typingIndex >= 0 && (
                  <motion.div
                    key={`typing-${typingIndex}`}
                    initial={{ opacity: 0, x: SCRIPT[typingIndex]?.side === "right" ? 12 : -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, transition: { duration: 0.15 } }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                  >
                    <TypingDots side={SCRIPT[typingIndex]?.side ?? "left"} />
                  </motion.div>
                )}
              </AnimatePresence>

            </div>
          </div>

          {/* ── Result card ──────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={showResult ? { opacity: 1, scale: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className={`absolute inset-0 flex items-center justify-center ${showResult ? "pointer-events-auto" : "pointer-events-none"}`}
          >
            <div className="bg-card rounded-3xl shadow-elevated p-8 border border-border w-full max-w-sm text-center">
              <div className="w-12 h-12 rounded-2xl bg-highlight/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="h-6 w-6 text-highlight" />
              </div>
              <p className="text-sm text-muted-foreground font-ui mb-1">coordination complete</p>
              <p className="font-heading text-2xl text-foreground mb-1">Saturday 6–8 PM</p>
              <p className="text-xs text-muted-foreground/60 font-mono mb-3">problem solved in 3 taps</p>
              <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground font-ui">
                <span className="flex items-center gap-1.5"><Users className="h-4 w-4" /> 5 people</span>
                <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" /> 2hr</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ProblemSection;
