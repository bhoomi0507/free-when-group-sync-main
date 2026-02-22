import { useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ─── config ─────────────────────────────────────────────────── */
const STOPS: { value: number; label: string }[] = [
  { value: 0.5,  label: "30m" },
  { value: 1,    label: "1h"  },
  { value: 1.5,  label: "1.5h"},
  { value: 2,    label: "2h"  },
  { value: 3,    label: "3h"  },
  { value: 5,    label: "5h"  },
];

const MIN = STOPS[0].value;
const MAX = STOPS[STOPS.length - 1].value;

const conversationalLabel = (v: number): string => {
  if (v <= 0.5) return "quick hang";
  if (v <= 1)   return "short meet";
  if (v <= 1.5) return "casual session";
  if (v <= 2)   return "proper hangout";
  if (v <= 3)   return "solid session";
  return "this might take a while";
};

const pct = (v: number) => ((v - MIN) / (MAX - MIN)) * 100;

const snapToStop = (raw: number): number => {
  return STOPS.reduce((best, s) =>
    Math.abs(s.value - raw) < Math.abs(best.value - raw) ? s : best
  ).value;
};

/* ─── component ─────────────────────────────────────────────── */
interface Props {
  value: number;
  onChange: (v: number) => void;
}

export default function DurationSlider({ value, onChange }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const [active, setActive] = useState(false);
  const [pulsing, setPulsing] = useState(false);

  const getRawFromClientX = useCallback((clientX: number) => {
    if (!trackRef.current) return value;
    const { left, width } = trackRef.current.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (clientX - left) / width));
    return MIN + ratio * (MAX - MIN);
  }, [value]);

  const onPointerMove = useCallback((e: PointerEvent) => {
    if (!dragging.current) return;
    const snapped = snapToStop(getRawFromClientX(e.clientX));
    onChange(snapped);
  }, [getRawFromClientX, onChange]);

  const onPointerUp = useCallback(() => {
    dragging.current = false;
    setActive(false);
    setPulsing(true);
    setTimeout(() => setPulsing(false), 950);
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerup",   onPointerUp);
  }, [onPointerMove]);

  const startDrag = (e: React.PointerEvent) => {
    e.preventDefault();
    dragging.current = true;
    setActive(true);
    // also handle click-on-track
    const snapped = snapToStop(getRawFromClientX(e.clientX));
    onChange(snapped);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup",   onPointerUp);
  };

  const position = pct(value);
  const label    = conversationalLabel(value);
  const stopLabel = STOPS.find(s => s.value === value)?.label ?? `${value}h`;

  return (
    <div className="select-none space-y-4">
      {/* Label row */}
      <div className="flex items-center justify-between">
        <AnimatePresence mode="wait">
          <motion.span
            key={label}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 6 }}
            transition={{ duration: 0.2 }}
            className="text-sm font-ui text-muted-foreground italic"
          >
            {label}
          </motion.span>
        </AnimatePresence>
        <span className="text-sm font-mono font-semibold text-accent">{stopLabel}</span>
      </div>

      {/* Track */}
      <div
        className="relative h-8 flex items-center cursor-pointer"
        ref={trackRef}
        onPointerDown={startDrag}
      >
        {/* Base track */}
        <div className="absolute inset-x-0 h-1.5 rounded-full bg-muted" />

        {/* Active fill */}
        <div
          className={`absolute left-0 h-1.5 rounded-full ${pulsing ? "animate-range-pulse" : ""}`}
          style={{
            width: `${position}%`,
            background: "linear-gradient(90deg, hsl(var(--accent)), hsl(var(--highlight)))",
            boxShadow: "0 0 8px -2px hsla(var(--accent), 0.4)",
          }}
        />

        {/* Stop dots */}
        {STOPS.map((s) => {
          const p = pct(s.value);
          const isActive = s.value <= value;
          return (
            <div
              key={s.value}
              className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1.5"
              style={{ left: `${p}%` }}
            >
              <div
                className={`w-2 h-2 rounded-full border transition-colors duration-200 ${
                  isActive
                    ? "border-highlight bg-highlight scale-110"
                    : "border-muted-foreground/30 bg-muted"
                }`}
              />
            </div>
          );
        })}

        {/* Handle */}
        <motion.div
          className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
          style={{ left: `${position}%` }}
          animate={active ? { scale: 1.25 } : { scale: 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 28 }}
        >
          {/* Tooltip */}
          <AnimatePresence>
            {active && (
              <motion.div
                initial={{ opacity: 0, y: 4, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4, scale: 0.9 }}
                transition={{ duration: 0.15 }}
                className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 whitespace-nowrap pointer-events-none"
              >
                <div className="bg-foreground text-background text-[10px] font-mono font-medium px-2 py-0.5 rounded-md shadow-float">
                  {stopLabel}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-foreground" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div
            className={`h-5 w-9 rounded-full border-2 border-background flex items-center justify-center cursor-grab active:cursor-grabbing ${
              active
                ? "shadow-[0_0_0_3px_hsl(var(--accent)/0.25)]"
                : "shadow-[0_1px_4px_0_hsl(0,0%,0%,0.2)]"
            }`}
            style={{
              background: "linear-gradient(135deg, hsl(var(--accent)), hsl(var(--highlight)))",
            }}
          >
            <div className="w-4 h-0.5 rounded-full bg-white/40" />
          </div>
        </motion.div>
      </div>

      {/* Stop labels */}
      <div className="flex justify-between text-[9px] font-mono text-muted-foreground/50">
        {STOPS.map((s) => (
          <span key={s.value} style={{ width: 0, textAlign: "center", transform: "translateX(-50%)" }}>
            {s.label}
          </span>
        ))}
      </div>
    </div>
  );
}
