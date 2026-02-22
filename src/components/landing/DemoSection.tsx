import { motion, useInView } from "framer-motion";
import { useRef, useState, useCallback } from "react";
import { CheckCircle2 } from "lucide-react";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const TIMES = ["10 AM", "11 AM", "12 PM", "1 PM", "2 PM", "3 PM", "4 PM", "5 PM", "6 PM", "7 PM", "8 PM"];

const DemoSection = () => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggle = useCallback((key: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  const friendSlots = new Set(["Sat-6 PM", "Sat-7 PM", "Sat-8 PM", "Sun-3 PM", "Sun-4 PM", "Fri-7 PM", "Fri-8 PM", "Thu-6 PM", "Thu-7 PM"]);

  const getHeat = (key: string) => {
    const isFriend = friendSlots.has(key);
    const isUser = selected.has(key);
    if (isUser && isFriend) return 3;
    if (isUser) return 2;
    if (isFriend) return 1;
    return 0;
  };

  const bestSlot = Array.from(selected).find((k) => friendSlots.has(k));

  return (
    <section id="demo" ref={ref} className="py-28 relative">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <p className="text-sm font-medium text-accent uppercase tracking-wider mb-3 font-mono">Live Preview</p>
          <h2 className="font-heading text-3xl md:text-5xl text-foreground mb-3">
            Try it yourself
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Click time slots below. Pretend your friends responded instantly.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="max-w-4xl mx-auto bg-card rounded-3xl shadow-elevated border border-border p-6 md:p-8"
        >
          {bestSlot && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 mb-5 px-4 py-2.5 rounded-2xl bg-highlight/10 border border-highlight/20 w-fit"
            >
              <CheckCircle2 className="h-4 w-4 text-highlight" />
              <span className="text-sm font-semibold text-foreground font-ui">Best overlap: <span className="font-mono">{bestSlot.replace("-", " ")}</span></span>
            </motion.div>
          )}

          <div className="overflow-x-auto">
            <div className="min-w-[600px]">
              <div className="grid grid-cols-8 gap-1.5 mb-1.5">
                <div />
                {DAYS.map((d) => (
                  <div key={d} className="text-center text-xs font-mono font-semibold text-muted-foreground py-2">{d}</div>
                ))}
              </div>

              {TIMES.map((time) => (
                <div key={time} className="grid grid-cols-8 gap-1.5 mb-1.5">
                  <div className="text-xs font-mono text-muted-foreground flex items-center justify-end pr-2">{time}</div>
                  {DAYS.map((day) => {
                    const key = `${day}-${time}`;
                    const heat = getHeat(key);
                    return (
                      <motion.button
                        key={key}
                        onClick={() => toggle(key)}
                        whileTap={{ scale: 0.92 }}
                        className={`h-9 rounded-xl transition-all duration-200 cursor-pointer border border-transparent ${
                          heat === 3
                            ? "bg-highlight/40 shadow-glow-accent border-highlight/30"
                            : heat === 2
                            ? "bg-accent/15 border-accent/15"
                            : heat === 1
                            ? "bg-highlight/10"
                            : "bg-muted/50 hover:bg-muted"
                        }`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4 mt-5 text-xs text-muted-foreground font-ui">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-muted/50 inline-block" /> Empty</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-highlight/10 inline-block" /> Friends</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-accent/15 inline-block" /> You</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-highlight/40 inline-block" /> Match!</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default DemoSection;
