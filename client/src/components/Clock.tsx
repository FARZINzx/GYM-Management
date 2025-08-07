"use client";

import React, { useState, useEffect, useRef } from "react";
import { useHydration } from "@/hooks/useHydration";

// Single formatter instance to avoid recreating each tick
const timeFormatter = new Intl.DateTimeFormat("en-GB", {
  hour12: false,
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
});

export default function SimpleClock() {
  const [timeString, setTimeString] = useState(() =>
    timeFormatter.format(new Date())
  );
  const mounted = useHydration();
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!mounted) return;

    const tick = () => {
      if (typeof document !== "undefined" && !document.hidden) {
        const utcTime = new Date(new Date().toISOString()); // Use UTC time
        setTimeString(timeFormatter.format(utcTime)); // Format based on UTC time
      }
      scheduleNext();
    };

    const scheduleNext = () => {
      const ms = new Date().getMilliseconds();
      const delay = 1000 - ms;
      timerRef.current = window.setTimeout(tick, delay);
    };

    scheduleNext();
    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
      }
    };
  }, [mounted]);

  if (!mounted) {
    return (
      <div className="min-w-[48px] text-left">
        {timeFormatter.format(new Date())}
      </div>
    );
  }

  return <div className="min-w-[48px] text-left">{timeString}</div>;
}
