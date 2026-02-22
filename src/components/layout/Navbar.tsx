import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useTheme } from "@/hooks/use-theme";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const isLanding = location.pathname === "/";
  const { theme, toggle } = useTheme();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-2xl"
    >
      <div
        className={`flex items-center justify-between h-14 px-5 rounded-full transition-all duration-500 ${
          scrolled
            ? "glass-panel-strong shadow-card"
            : "bg-transparent"
        }`}
      >
        <Link to="/" className="flex items-center gap-2">
          <span className="font-heading text-xl text-foreground tracking-tight">LinkUp</span>
        </Link>

        {isLanding && (
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground font-ui">
            <a href="#how-it-works" className="hover:text-foreground transition-colors duration-200">How it Works</a>
            <a href="#demo" className="hover:text-foreground transition-colors duration-200">Live Preview</a>
          </div>
        )}

        <div className="flex items-center gap-3">
          {/* Modern switch toggle */}
          <button
            onClick={toggle}
            className="relative w-[72px] h-8 rounded-full bg-muted border border-border transition-colors duration-500 flex items-center px-1"
            aria-label="Toggle theme"
          >
            <motion.div
              layout
              transition={{ type: "spring", stiffness: 500, damping: 35 }}
              className={`w-6 h-6 rounded-full bg-foreground shadow-sm flex items-center justify-center ${
                theme === "dark" ? "ml-auto" : "ml-0"
              }`}
            >
              <span className="text-background text-[10px] font-ui font-semibold">
                {theme === "light" ? "☀" : "☾"}
              </span>
            </motion.div>
            <span className={`absolute text-[9px] font-ui font-semibold uppercase tracking-wider text-muted-foreground ${
              theme === "light" ? "right-2.5" : "left-2.5"
            }`}>
              {theme === "light" ? "Dark" : "Light"}
            </span>
          </button>
          <Link
            to="/create"
            className="bg-foreground text-background px-5 py-2 rounded-full text-sm font-semibold font-ui hover:opacity-90 transition-opacity duration-200"
          >
            Start a plan
          </Link>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
