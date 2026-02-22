import { motion } from "framer-motion";
import { MessageSquare, Zap, Target, CalendarCheck, CheckCircle } from "lucide-react";
import { useState } from "react";

const features = [
  { icon: MessageSquare, title: "Works in group chats", desc: "Share the link anywhere — WhatsApp, iMessage, Discord." },
  { icon: Zap, title: "No confusion", desc: "Everyone sees the same grid. Clear and instant." },
  { icon: Target, title: "Fast decisions", desc: "Algorithm picks max attendance. No debating." },
  { icon: CalendarCheck, title: "Actually used plans", desc: "Plans that get made, not plans that get forgotten." },
  { icon: CheckCircle, title: "One tap done", desc: "Lock the time. Everyone gets notified. Go live your life." },
];

const FeatureCard = ({ f, i }: { f: typeof features[0]; i: number }) => {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 6;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -6;
    setTilt({ x: y, y: x });
  };

  const handleMouseLeave = () => setTilt({ x: 0, y: 0 });

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: i * 0.08 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ transform: `perspective(600px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)` }}
      className="bg-card rounded-3xl border border-border p-6 shadow-soft hover:shadow-card transition-all duration-200 cursor-default"
    >
      <div className="w-10 h-10 rounded-2xl bg-accent/[0.06] flex items-center justify-center mb-4">
        <f.icon className="h-5 w-5 text-accent" />
      </div>
      <h3 className="font-heading text-lg text-foreground mb-1.5">{f.title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
    </motion.div>
  );
};

const FeaturesSection = () => (
  <section className="py-28 relative">
    <div className="container mx-auto px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-16"
      >
        <p className="text-sm font-medium text-accent uppercase tracking-wider mb-3 font-mono">Built for real life</p>
        <h2 className="font-heading text-3xl md:text-5xl text-foreground">
          Effortless advantages
        </h2>
      </motion.div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
        {features.map((f, i) => (
          <FeatureCard key={i} f={f} i={i} />
        ))}
      </div>
    </div>
  </section>
);

export default FeaturesSection;
