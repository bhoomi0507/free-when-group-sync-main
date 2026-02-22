import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { FileText, Share2, PartyPopper } from "lucide-react";

const steps = [
  {
    num: "01",
    icon: FileText,
    title: "Create",
    desc: "Name it. Pick a vibe. Done in seconds.",
    caption: "less effort than sending a voice note",
    visual: (
      <div className="space-y-2.5 p-4">
        <div className="h-7 rounded-lg bg-muted w-3/4" />
        <div className="h-7 rounded-lg bg-muted w-1/2" />
        <div className="h-9 rounded-lg bg-foreground/10 w-2/3" />
      </div>
    ),
  },
  {
    num: "02",
    icon: Share2,
    title: "Share",
    desc: "Drop the link in any chat. Everyone taps.",
    caption: "works everywhere, even carrier pigeon",
    visual: (
      <div className="grid grid-cols-5 gap-1 p-4">
        {Array.from({ length: 15 }).map((_, i) => {
          const filled = [1, 2, 6, 7, 8, 11, 12].includes(i);
          return (
            <div
              key={i}
              className={`h-5 rounded-md transition-all ${
                filled ? "bg-highlight/40" : "bg-muted"
              }`}
            />
          );
        })}
      </div>
    ),
  },
  {
    num: "03",
    icon: PartyPopper,
    title: "Show up",
    desc: "We find the max overlap. You just go.",
    caption: "that's the whole app",
    visual: (
      <div className="p-4 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-highlight/10 mb-2">
          <PartyPopper className="h-3.5 w-3.5 text-highlight" />
          <span className="font-mono font-semibold text-highlight text-sm">Sat 6–8 PM</span>
        </div>
        <div className="flex justify-center -space-x-2 mt-3">
          {["A", "R", "P", "S", "M"].map((l, i) => (
            <div key={i} className="w-6 h-6 rounded-full bg-foreground flex items-center justify-center text-[9px] font-bold font-ui text-background border-2 border-card">{l}</div>
          ))}
        </div>
      </div>
    ),
  },
];

const HowItWorksSection = () => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="how-it-works" ref={ref} className="py-28 relative">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-sm font-medium text-accent uppercase tracking-wider mb-3 font-mono">How it works</p>
          <h2 className="font-heading text-3xl md:text-5xl text-foreground">
            Three steps. Zero drama.
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 relative">
          <div className="hidden md:block absolute top-1/2 left-[16%] right-[16%] h-px">
            <motion.div
              initial={{ scaleX: 0 }}
              animate={isInView ? { scaleX: 1 } : {}}
              transition={{ duration: 1.2, delay: 0.4, ease: "easeOut" }}
              className="h-full bg-border origin-left"
            />
          </div>

          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 + i * 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="relative bg-card rounded-3xl border border-border shadow-soft p-6 hover:shadow-card transition-shadow duration-300"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="text-xs font-mono font-bold text-accent bg-accent/[0.06] px-2.5 py-1 rounded-lg">{step.num}</span>
                <step.icon className="h-5 w-5 text-muted-foreground" />
              </div>
              <h3 className="font-heading text-xl text-foreground mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground mb-1">{step.desc}</p>
              <p className="text-xs text-muted-foreground/50 font-mono mb-4">{step.caption}</p>
              <div className="bg-muted/40 rounded-2xl min-h-[90px]">
                {step.visual}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
