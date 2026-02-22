import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const CTASection = () => (
  <section className="py-32 relative overflow-hidden">
    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-accent/[0.03] rounded-full blur-[100px] pointer-events-none" />

    <div className="container mx-auto px-6 relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="text-center max-w-2xl mx-auto"
      >
        <h2 className="font-heading text-3xl md:text-5xl text-foreground mb-4 leading-tight">
          You already made the plan.
          <br />
          <span className="text-muted-foreground">Now make it real.</span>
        </h2>
        <p className="text-lg text-muted-foreground mb-10">
          One link. Everyone's availability. The best time — automatically.
        </p>
        <Link
          to="/create"
          className="inline-flex items-center gap-2 bg-foreground text-background px-8 py-4 rounded-2xl text-lg font-semibold font-ui hover:opacity-90 transition-opacity duration-200"
        >
          Create your LinkUp <ArrowRight className="h-5 w-5" />
        </Link>
      </motion.div>
    </div>
  </section>
);

export default CTASection;
