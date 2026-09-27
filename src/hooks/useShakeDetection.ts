import { useEffect, useRef, useCallback } from 'react';

interface ShakeOptions {
  threshold?: number;    // acceleration threshold (m/s²) — default 15
  timeout?: number;      // min ms between shakes — default 1000
  onShake: () => void;
  enabled?: boolean;
}

/**
 * useShakeDetection — listens to DeviceMotionEvent and calls onShake
 * when the device is vigorously shaken.
 * Requests iOS 13+ permission automatically.
 */
export function useShakeDetection({ threshold = 15, timeout = 1500, onShake, enabled = true }: ShakeOptions) {
  const lastShakeRef = useRef<number>(0);
  const lastAccelRef = useRef({ x: 0, y: 0, z: 0 });

  const handleMotion = useCallback((e: DeviceMotionEvent) => {
    const accel = e.accelerationIncludingGravity;
    if (!accel || accel.x === null) return;

    const { x = 0, y = 0, z = 0 } = accel;
    const dx = Math.abs((x ?? 0) - lastAccelRef.current.x);
    const dy = Math.abs((y ?? 0) - lastAccelRef.current.y);
    const dz = Math.abs((z ?? 0) - lastAccelRef.current.z);

    lastAccelRef.current = { x: x ?? 0, y: y ?? 0, z: z ?? 0 };

    const magnitude = Math.sqrt(dx * dx + dy * dy + dz * dz);
    const now = Date.now();

    if (magnitude > threshold && now - lastShakeRef.current > timeout) {
      lastShakeRef.current = now;
      onShake();
    }
  }, [threshold, timeout, onShake]);

  useEffect(() => {
    if (!enabled) return;
    if (!('DeviceMotionEvent' in window)) return;

    const addListener = () => window.addEventListener('devicemotion', handleMotion);

    // iOS 13+ requires explicit permission
    if (typeof (DeviceMotionEvent as unknown as { requestPermission?: () => Promise<string> }).requestPermission === 'function') {
      (DeviceMotionEvent as unknown as { requestPermission: () => Promise<string> })
        .requestPermission()
        .then(res => { if (res === 'granted') addListener(); })
        .catch(() => {});
    } else {
      addListener();
    }

    return () => window.removeEventListener('devicemotion', handleMotion);
  }, [enabled, handleMotion]);
}
