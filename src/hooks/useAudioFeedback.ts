import { useCallback, useRef, useState, useEffect } from 'react';
import { storageService } from '../services/storageService';

const VOLUME_STORAGE_KEY = 'GEOMUNDI_SOUND_VOLUME_V1';
const HAPTICS_STORAGE_KEY = 'GEOMUNDI_HAPTICS_ENABLED_V1';

export function useAudioFeedback() {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const [soundEnabled, setSoundEnabledState] = useState<boolean>(() => storageService.getSoundEnabled());
  const [volume, setVolumeState] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(VOLUME_STORAGE_KEY);
      return saved !== null ? Number(saved) : 0.7;
    } catch (e) {
      return 0.7;
    }
  });
  const [hapticsEnabled, setHapticsEnabledState] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(HAPTICS_STORAGE_KEY);
      return saved !== null ? saved === 'true' : true;
    } catch (e) {
      return true;
    }
  });

  const getAudioContext = useCallback(() => {
    if (!audioCtxRef.current) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        audioCtxRef.current = new AudioContextClass();
      }
    }
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  }, []);

  const toggleSound = useCallback(() => {
    setSoundEnabledState(prev => {
      const next = !prev;
      storageService.setSoundEnabled(next);
      return next;
    });
  }, []);

  const setVolume = useCallback((newVol: number) => {
    const clamped = Math.max(0, Math.min(1, newVol));
    setVolumeState(clamped);
    try {
      localStorage.setItem(VOLUME_STORAGE_KEY, String(clamped));
    } catch (e) {}
    if (clamped > 0 && !soundEnabled) {
      toggleSound();
    }
  }, [soundEnabled, toggleSound]);

  const toggleHaptics = useCallback(() => {
    setHapticsEnabledState(prev => {
      const next = !prev;
      try {
        localStorage.setItem(HAPTICS_STORAGE_KEY, String(next));
      } catch (e) {}
      return next;
    });
  }, []);

  // Vibración háptica sutil para dispositivos táctiles
  const triggerHaptic = useCallback((pattern: number | number[]) => {
    if (!hapticsEnabled) return;
    if (typeof window !== 'undefined' && 'navigator' in window && typeof navigator.vibrate === 'function') {
      try {
        navigator.vibrate(pattern);
      } catch (e) {}
    }
  }, [hapticsEnabled]);

  // Sonido de acierto (arpegio mayor ascendente C5 -> E5 -> G5 -> C6) + Vibración sutil (35ms)
  const playCorrectSound = useCallback((comboMultiplier: number = 1) => {
    triggerHaptic(35);
    if (!soundEnabled || volume <= 0) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const baseFreq = comboMultiplier > 2 ? 659.25 : comboMultiplier > 1 ? 587.33 : 523.25; // C5 or higher
      const notes = [baseFreq, baseFreq * 1.25, baseFreq * 1.5, baseFreq * 2];

      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.05);

        const targetGain = 0.15 * volume;
        gain.gain.setValueAtTime(0, ctx.currentTime + idx * 0.05);
        gain.gain.linearRampToValueAtTime(targetGain, ctx.currentTime + idx * 0.05 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.05 + 0.25);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + idx * 0.05);
        osc.stop(ctx.currentTime + idx * 0.05 + 0.26);
      });
    } catch (e) {
      // Ignorar errores de autoplay
    }
  }, [soundEnabled, volume, getAudioContext, triggerHaptic]);

  // Sonido de error (tono disonante suave descendente) + Doble vibración sutil ([40, 50, 40])
  const playWrongSound = useCallback(() => {
    triggerHaptic([40, 50, 40]);
    if (!soundEnabled || volume <= 0) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.25);

      const targetGain = 0.12 * volume;
      gain.gain.setValueAtTime(targetGain, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.26);
    } catch (e) {}
  }, [soundEnabled, volume, getAudioContext, triggerHaptic]);

  // Sonido de clic sutil
  const playClickSound = useCallback(() => {
    if (!soundEnabled || volume <= 0) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.04);

      const targetGain = 0.05 * volume;
      gain.gain.setValueAtTime(targetGain, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.045);
    } catch (e) {}
  }, [soundEnabled, volume, getAudioContext]);

  // Sonido de Pista usada
  const playHintSound = useCallback(() => {
    if (!soundEnabled || volume <= 0) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);

      const targetGain = 0.08 * volume;
      gain.gain.setValueAtTime(targetGain, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.16);
    } catch (e) {}
  }, [soundEnabled, volume, getAudioContext]);

  // Sonido de Victoria Fanfarria
  const playVictorySound = useCallback(() => {
    triggerHaptic([50, 70, 80, 70, 100]);
    if (!soundEnabled || volume <= 0) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const chord = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      chord.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.1);
        gain.gain.setValueAtTime(0.12 * volume, ctx.currentTime + i * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.1 + 0.6);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + i * 0.1);
        osc.stop(ctx.currentTime + i * 0.1 + 0.65);
      });
    } catch (e) {}
  }, [soundEnabled, volume, getAudioContext, triggerHaptic]);

  return {
    soundEnabled,
    toggleSound,
    volume,
    setVolume,
    hapticsEnabled,
    toggleHaptics,
    playCorrectSound,
    playWrongSound,
    playClickSound,
    playHintSound,
    playVictorySound
  };
}
