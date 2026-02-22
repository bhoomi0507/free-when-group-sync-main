import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, CheckCircle2, Users } from "lucide-react";
import { useEffect, useState } from "react";

const subtitles = [
  "group chats retired",
  "coordination achieved",
  "miracle scheduling",
  "yes even THAT friend responded",
  "rare alignment detected",
];

const slotStates = [
  0,0,1,0,0,0,0,
  0,1,2,1,0,0,0,
  0,0,1,2,0,0,0,
];

const avatars = [
  { letter: "A", delay: 0.8 },
  { letter: "R", delay: 1.1 },
  { letter: "P", delay: 1.4 },
  { letter: "S", delay: 1.7 },
  { letter: "M", delay: 2.0 },
];

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] as const },
});

const HeroSection = () => {
  const [subtitleIndex, setSubtitleIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setSubtitleIndex((i) => (i + 1) % subtitles.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden grain-overlay">
      {/* Subtle radial glows */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-accent/[0.03] blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-highlight/[0.03] blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-6 pt-28 pb-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left – Copy */}
          <div className="max-w-lg">
            <motion.h1
              {...fadeUp(0.15)}
              className="font-heading text-[2.8rem] md:text-[3.5rem] lg:text-[4.2rem] leading-[1.08] tracking-tight text-foreground mb-5"
            >
              Make a plan.
              <br />
              <span className="text-muted-foreground">We'll find the moment.</span>
            </motion.h1>

            <motion.p
              {...fadeUp(0.25)}
              className="text-lg text-muted-foreground leading-relaxed mb-4 max-w-md"
            >
              Drop a link. Everyone taps their availability. Best time appears. Done.
            </motion.p>

            {/* Rotating subtitle */}
            <motion.div {...fadeUp(0.3)} className="h-7 mb-10 overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.p
                  key={subtitleIndex}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.35 }}
                  className="text-sm text-muted-foreground/50 font-mono"
                >
                  "{subtitles[subtitleIndex]}"
                </motion.p>
              </AnimatePresence>
            </motion.div>

            <motion.div {...fadeUp(0.35)} className="flex flex-col sm:flex-row items-start gap-3">
              <Link
                to="/create"
                className="bg-foreground text-background px-7 py-3.5 rounded-2xl text-base font-semibold font-ui hover:opacity-90 transition-opacity duration-200 flex items-center gap-2"
              >
                Start a plan <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/availability/demo"
                className="flex items-center gap-2 px-7 py-3.5 rounded-2xl text-base font-medium font-ui text-foreground border border-border hover:bg-card transition-all duration-200"
              >
                View example
              </Link>
            </motion.div>
          </div>

          {/* Right – Live interface preview */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
          >
            <div className="bg-card rounded-3xl shadow-elevated p-6 border border-border">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="font-heading text-lg text-foreground">Weekend Hangout</p>
                  <p className="text-xs text-muted-foreground font-ui mt-0.5">2 hours · this saturday</p>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-ui">
                  <Users className="h-3.5 w-3.5" /> 5 friends
                </div>
              </div>

              {/* Day headers */}
              <div className="grid grid-cols-7 gap-1.5 mb-1.5">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                  <div key={d} className="text-[10px] text-center text-muted-foreground font-mono py-1">{d}</div>
                ))}
              </div>

              {/* Animated slots */}
              <div className="grid grid-cols-7 gap-1.5">
                {slotStates.map((state, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.6 + i * 0.04 }}
                    className={`h-8 rounded-xl transition-all duration-300 ${
                      state === 2
                        ? "bg-highlight/40 shadow-glow-accent"
                        : state === 1
                        ? "bg-accent/10"
                        : "bg-muted/50"
                    }`}
                  />
                ))}
              </div>

              {/* Avatars appearing */}
              <div className="flex items-center gap-2 mt-5">
                <div className="flex -space-x-2">
                  {avatars.map((a, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4, delay: a.delay, ease: [0.34, 1.56, 0.64, 1] }}
                      className="w-7 h-7 rounded-full bg-foreground flex items-center justify-center text-[10px] font-bold font-ui text-background border-2 border-card"
                    >
                      {a.letter}
                    </motion.div>
                  ))}
                </div>
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 2.3 }}
                  className="text-xs text-muted-foreground font-ui"
                >
                  everyone's in
                </motion.span>
              </div>
            </div>

            {/* Floating best time */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 2.5, duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
              className="absolute -top-4 right-6 bg-card rounded-2xl shadow-float px-4 py-3 border border-highlight/20"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-highlight" />
                <span className="text-sm font-semibold font-mono text-foreground">Sat 6–8 PM</span>
              </div>
              <p className="text-[10px] text-muted-foreground font-ui mt-0.5">coordination complete ✨</p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
