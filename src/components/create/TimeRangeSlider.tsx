import { useRef, useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ─── constants ─────────────────────────────────────────────── */
const MIN_HOUR = 0;
const MAX_HOUR = 24;
const TOTAL    = MAX_HOUR - MIN_HOUR; // 24 hours
const SNAP     = 0.25; // 15-minute increments

const MAJOR_TICKS = [0, 3, 6, 9, 12, 15, 18, 21, 24];
const MINOR_TICK_EVERY = 1; // every hour

const majorLabel = (h: number) => {
  if (h === 0 || h === 24) return "12 AM";
  if (h === 12) return "12 PM";
  return h < 12 ? `${h} AM` : `${h - 12} PM`;
};

const formatTime = (h: number) => {
  const snapped = Math.round(h / SNAP) * SNAP;
  const hours   = Math.floor(snapped);
  const mins    = Math.round((snapped - hours) * 60);
  const period  = hours < 12 ? "AM" : "PM";
  const h12     = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
  return `${h12}:${String(mins).padStart(2, "0")} ${period}`;
};

const conversationalLabel = (start: number, end: number): string => {
  const dur = end - start;
  if (start <= 6  && end >= 22) return "pretty much anytime works";
  if (start >= 22 || end <= 5)  return "night owl hours";
  if (start >= 20)              return "late evening vibes";
  if (start >= 17 && end <= 23) return "evening works";
  if (start >= 14 && end <= 20) return "afternoon into evening";
  if (start >= 12 && end <= 17) return "afternoon hangout";
  if (start >= 6  && end <= 12) return "morning energy";
  if (start <= 9  && end >= 18) return "anytime during the day";
  if (dur <= 2)                 return `roughly ${formatTime(start)} → ${formatTime(end)}`;
  return `roughly ${formatTime(start)} → ${formatTime(end)}`;
};

/* ─── helpers ───────────────────────────────────────────────── */
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const snapTo = (v: number) => Math.round(v / SNAP) * SNAP;
const pct = (v: number) => ((v - MIN_HOUR) / TOTAL) * 100;

/* ─── component ─────────────────────────────────────────────── */
interface Props {
  value: [number, number];
  onChange: (v: [number, number]) => void;
  onCommit?: () => void;
}

export default function TimeRangeSlider({ value, onChange, onCommit }: Props) {
  const trackRef   = useRef<HTMLDivElement>(null);
  const dragging   = useRef<"start" | "end" | null>(null);
  const [activeHandle, setActiveHandle]  = useState<"start"|"end"|null>(null);
  const [pulsing, setPulsing]            = useState(false);
  const [label, setLabel]                = useState(conversationalLabel(value[0], value[1]));

  useEffect(() => {
    setLabel(conversationalLabel(value[0], value[1]));
  }, [value]);

  const getHourFromClientX = useCallback((clientX: number) => {
    if (!trackRef.current) return 0;
    const { left, width } = trackRef.current.getBoundingClientRect();
    const ratio = clamp((clientX - left) / width, 0, 1);
    return snapTo(MIN_HOUR + ratio * TOTAL);
  }, []);

  const onPointerMove = useCallback((e: PointerEvent) => {
    if (!dragging.current) return;
    const h = getHourFromClientX(e.clientX);
    if (dragging.current === "start") {
      onChange([clamp(h, MIN_HOUR, value[1] - SNAP), value[1]]);
    } else {
      onChange([value[0], clamp(h, value[0] + SNAP, MAX_HOUR)]);
    }
  }, [value, onChange, getHourFromClientX]);

  const onPointerUp = useCallback(() => {
    if (dragging.current) {
      dragging.current = null;
      setActiveHandle(null);
      setPulsing(true);
      setTimeout(() => setPulsing(false), 950);
      onCommit?.();
    }
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerup",   onPointerUp);
  }, [onPointerMove, onCommit]);

  const startDrag = (handle: "start"|"end") => (e: React.PointerEvent) => {
    e.preventDefault();
    dragging.current = handle;
    setActiveHandle(handle);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup",   onPointerUp);
  };

  const left  = pct(value[0]);
  const right = 100 - pct(value[1]);

  return (
    <div className="select-none space-y-5">
      {/* Conversational label */}
      <AnimatePresence mode="wait">
        <motion.p
          key={label}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.25 }}
          className="text-center text-sm font-medium text-foreground font-ui"
        >
          "{label}"
        </motion.p>
      </AnimatePresence>

      {/* Major labels row */}
      <div className="flex justify-between px-1">
        {MAJOR_TICKS.map((h) => (
          <span key={h} className="text-[9px] font-mono text-muted-foreground/60 leading-none">
            {majorLabel(h)}
          </span>
        ))}
      </div>

      {/* Track */}
      <div className="relative h-10 flex items-center px-1" ref={trackRef}>
        {/* Tick marks */}
        <div className="absolute inset-x-1 top-1/2 -translate-y-1/2 pointer-events-none">
          {Array.from({ length: TOTAL / MINOR_TICK_EVERY + 1 }, (_, i) => i).map((i) => {
            const isMajor = MAJOR_TICKS.includes(i * MINOR_TICK_EVERY);
            const pos = pct(i * MINOR_TICK_EVERY);
            return (
              <div
                key={i}
                className="absolute bottom-0 -translate-x-1/2"
                style={{ left: `${pos}%` }}
              >
                <div
                  className={`w-px rounded-full ${
                    isMajor
                      ? "h-3 bg-muted-foreground/30"
                      : "h-1.5 bg-muted-foreground/15"
                  }`}
                />
              </div>
            );
          })}
        </div>

        {/* Base track */}
        <div className="absolute inset-x-1 h-2 rounded-full bg-muted" />

        {/* Active range track + shimmer */}
        <div
          className={`absolute h-2 rounded-full shimmer-track ${pulsing ? "animate-range-pulse" : ""}`}
          style={{
            left:  `calc(${left}% + 4px)`,
            right: `calc(${right}% + 4px)`,
            background: "linear-gradient(90deg, hsl(var(--accent)), hsl(var(--highlight)))",
            boxShadow: "0 0 12px -2px hsla(var(--accent), 0.45), 0 0 6px -1px hsla(var(--highlight), 0.3)",
          }}
        />

        {/* START HANDLE */}
        <Handle
          position={left}
          label={formatTime(value[0])}
          side="left"
          active={activeHandle === "start"}
          onPointerDown={startDrag("start")}
        />

        {/* END HANDLE */}
        <Handle
          position={left + (100 - left - right)}
          label={formatTime(value[1])}
          side="right"
          active={activeHandle === "end"}
          onPointerDown={startDrag("end")}
        />
      </div>

      {/* Exact time readout */}
      <div className="flex justify-between px-1">
        <span className="text-[10px] font-mono font-medium text-accent">{formatTime(value[0])}</span>
        <span className="text-[10px] font-mono text-muted-foreground/40">→</span>
        <span className="text-[10px] font-mono font-medium text-highlight">{formatTime(value[1])}</span>
      </div>
    </div>
  );
}

/* ─── handle sub-component ─────────────────────────────────── */
interface HandleProps {
  position: number;
  label: string;
  side: "left" | "right";
  active: boolean;
  onPointerDown: (e: React.PointerEvent) => void;
}

function Handle({ position, label, side: _side, active, onPointerDown }: HandleProps) {
  return (
    <div
      className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
      style={{ left: `${position}%` }}
    >
      {/* Tooltip */}
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.9 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 whitespace-nowrap"
          >
            <div className="bg-foreground text-background text-[10px] font-mono font-medium px-2 py-0.5 rounded-md shadow-float">
              {label}
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-foreground" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pill handle */}
      <motion.div
        onPointerDown={onPointerDown}
        animate={active ? { scaleX: 1.3, scaleY: 1.15 } : { scaleX: 1, scaleY: 1 }}
        whileHover={{ scaleX: 1.15, scaleY: 1.1 }}
        transition={{ type: "spring", stiffness: 500, damping: 28 }}
        className="cursor-grab active:cursor-grabbing touch-none"
        style={{ originX: "50%", originY: "50%" }}
      >
        <div
          className={`h-5 w-8 rounded-full border-2 border-background flex items-center justify-center transition-shadow ${
            active
              ? "shadow-[0_0_0_3px_hsl(var(--accent)/0.25),0_2px_8px_-2px_hsl(var(--accent)/0.4)]"
              : "shadow-[0_1px_4px_0_hsl(0,0%,0%,0.2)]"
          }`}
          style={{
            background: "linear-gradient(135deg, hsl(var(--accent)), hsl(var(--highlight)))",
          }}
        >
          {/* Inner highlight line */}
          <div className="w-4 h-0.5 rounded-full bg-white/40" />
        </div>
      </motion.div>
    </div>
  );
}
