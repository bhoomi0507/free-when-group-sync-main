import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { CalendarCheck, Clock, MessageSquareOff } from "lucide-react";

const stats = [
  { icon: CalendarCheck, label: "Plans saved from dying", value: 12840, suffix: "+" },
  { icon: Clock, label: "Hours of back-and-forth avoided", value: 34600, suffix: "+" },
  { icon: MessageSquareOff, label: "Friendships preserved", value: 128000, suffix: "+" },
];

const AnimatedCounter = ({ target, suffix, active }: { target: number; suffix: string; active: boolean }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!active) return;
    const duration = 2000;
    const startTime = Date.now();
    const step = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [active, target]);

  return <span>{count.toLocaleString()}{suffix}</span>;
};

const StatsSection = () => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="py-24 dark-section relative grain-overlay">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {stats.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="text-center"
            >
              <s.icon className="h-6 w-6 mx-auto mb-3 text-highlight" />
              <p className="font-heading text-4xl md:text-5xl mb-2 font-mono">
                <AnimatedCounter target={s.value} suffix={s.suffix} active={isInView} />
              </p>
              <p className="text-sm text-muted-fg font-ui">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
