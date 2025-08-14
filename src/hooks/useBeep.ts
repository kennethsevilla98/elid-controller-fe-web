import { useEffect, useRef, useCallback } from "react";

type OscillatorTypeExtended = OscillatorType;

interface BeepOptions {
  frequency?: number;
  duration?: number;
  volume?: number;
  type?: OscillatorTypeExtended;
}

interface PatternStep extends Partial<BeepOptions> {
  gap?: number;
}

function useBeep() {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const timeoutsRef = useRef<number[]>([]);
  const activeOscRef = useRef<OscillatorNode | null>(null);

  const getCtx = (): AudioContext => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioCtxRef.current;
  };

  const stop = useCallback(() => {
    // stop oscillator if playing
    if (activeOscRef.current) {
      try {
        activeOscRef.current.stop();
      } catch {}
      activeOscRef.current.disconnect();
      activeOscRef.current = null;
    }
    // clear timeouts
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  }, []);

  const beep = useCallback(async ({
    frequency = 440,
    duration = 150,
    volume = 0.2,
    type = "sine",
  }: BeepOptions = {}): Promise<void> => {
    const ctx = getCtx();
    if (ctx.state === "suspended") await ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    activeOscRef.current = osc;

    osc.type = type;
    osc.frequency.value = frequency;
    gain.gain.value = volume;

    osc.connect(gain).connect(ctx.destination);
    osc.start();

    const timeoutId = window.setTimeout(() => {
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.01);
      osc.stop(ctx.currentTime + 0.02);
      osc.disconnect();
      gain.disconnect();
      if (activeOscRef.current === osc) {
        activeOscRef.current = null;
      }
    }, duration);

    timeoutsRef.current.push(timeoutId);
  }, []);

  const pattern = useCallback(async (steps: PatternStep[] = []) => {
    stop(); // stop any existing pattern first

    const ctx = getCtx();
    if (ctx.state === "suspended") await ctx.resume();

    let delay = 0;
    for (const s of steps) {
      if (s.gap) {
        delay += s.gap;
      } else {
        timeoutsRef.current.push(
          window.setTimeout(() => {
            beep(s);
          }, delay)
        );
        delay += s.duration ?? 150;
      }
    }
  }, [beep, stop]);

  useEffect(() => {
    return () => {
      stop();
      audioCtxRef.current?.close?.();
      audioCtxRef.current = null;
    };
  }, [stop]);

  return { beep, pattern, stop };
}

export default useBeep;
