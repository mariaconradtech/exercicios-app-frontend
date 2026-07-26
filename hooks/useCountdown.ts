import { useCallback, useEffect, useRef, useState } from 'react';

interface UseCountdownOptions {
  onComplete?: () => void;
}

interface UseCountdownResult {
  remaining: number;
  isRunning: boolean;
  start: () => void;
  pause: () => void;
  resume: () => void;
  reset: (nextDurationSeconds: number) => void;
}

// Timer baseado em timestamp de deadline (não em contador decrescente).
// Guarda o instante em que deve zerar e recalcula o restante a partir de
// Date.now() a cada tick — imune a drift e ao throttling de timers do RN
// quando o app volta do background.
export function useCountdown(durationSeconds: number, opts?: UseCountdownOptions): UseCountdownResult {
  const onCompleteRef = useRef(opts?.onComplete);
  onCompleteRef.current = opts?.onComplete;

  const [remaining, setRemaining] = useState(durationSeconds);
  const [isRunning, setIsRunning] = useState(false);

  const endAtRef = useRef<number | null>(null);
  const remainingAtPauseRef = useRef(durationSeconds);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimer = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const tick = useCallback(() => {
    if (endAtRef.current === null) {
      return;
    }

    const next = Math.max(0, Math.ceil((endAtRef.current - Date.now()) / 1000));
    setRemaining(next);

    if (next <= 0) {
      clearTimer();
      setIsRunning(false);
      onCompleteRef.current?.();
    }
  }, [clearTimer]);

  const start = useCallback(() => {
    clearTimer();
    endAtRef.current = Date.now() + remainingAtPauseRef.current * 1000;
    setIsRunning(true);
    intervalRef.current = setInterval(tick, 250);
  }, [clearTimer, tick]);

  const pause = useCallback(() => {
    if (endAtRef.current !== null) {
      remainingAtPauseRef.current = Math.max(0, Math.ceil((endAtRef.current - Date.now()) / 1000));
      setRemaining(remainingAtPauseRef.current);
    }
    clearTimer();
    setIsRunning(false);
  }, [clearTimer]);

  const reset = useCallback(
    (nextDurationSeconds: number) => {
      clearTimer();
      endAtRef.current = null;
      remainingAtPauseRef.current = nextDurationSeconds;
      setRemaining(nextDurationSeconds);
      setIsRunning(false);
    },
    [clearTimer],
  );

  useEffect(() => clearTimer, [clearTimer]);

  return { remaining, isRunning, start, pause, resume: start, reset };
}
