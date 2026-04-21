/**
 * Sound system for skribbl clone.
 * Uses real .ogg audio files from assets + Web Audio API for simple UI sounds.
 */

import joinSound from '../assets/join.ogg';
import roundStartSound from '../assets/roundStart.ogg';
import roundEndSuccessSound from '../assets/roundEndSuccess.ogg';
import roundEndFailureSound from '../assets/roundEndFailure.ogg';

type SoundName =
  | 'roundStart'
  | 'roundEndSuccess'
  | 'roundEndFailure'
  | 'join'
  | 'leave'
  | 'playerGuessed'
  | 'tick'
  | 'click';

// Map sound names to imported audio file URLs
const SOUND_FILES: Partial<Record<SoundName, string>> = {
  join: joinSound,
  roundStart: roundStartSound,
  roundEndSuccess: roundEndSuccessSound,
  roundEndFailure: roundEndFailureSound,
};

// Audio element cache for file-based sounds
const audioCache = new Map<string, HTMLAudioElement>();

let volume = 0.5;
let audioCtx: AudioContext | null = null;

function getContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/** Play a short synthesized tone (for tick/click/etc.) */
function playTone(
  freq: number,
  duration: number,
  type: OscillatorType = 'sine',
  delay = 0,
  vol = volume
) {
  const ctx = getContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(vol, ctx.currentTime + delay);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(ctx.currentTime + delay);
  osc.stop(ctx.currentTime + delay + duration);
}

/** Play a real audio file */
function playFile(url: string) {
  try {
    let audio = audioCache.get(url);
    if (!audio) {
      audio = new Audio(url);
      audioCache.set(url, audio);
    }
    audio.volume = volume;
    audio.currentTime = 0;
    audio.play().catch(() => {
      // Autoplay may be blocked until user interacts
    });
  } catch (e) {
    // ignore
  }
}

// Synthesized fallback sounds for effects that don't have .ogg files
const synthSounds: Partial<Record<SoundName, () => void>> = {
  leave: () => {
    // Soft downward chime
    playTone(880, 0.1, 'sine', 0, volume * 0.2);
    playTone(698.46, 0.15, 'sine', 0.08, volume * 0.2);
  },
  playerGuessed: () => {
    // Happy two-note
    playTone(784, 0.1, 'triangle', 0, volume * 0.3);
    playTone(1047, 0.2, 'triangle', 0.1, volume * 0.35);
  },
  tick: () => {
    // Short click
    playTone(1000, 0.03, 'square', 0, volume * 0.15);
  },
  click: () => {
    // UI click
    playTone(700, 0.04, 'square', 0, volume * 0.1);
  },
};

export function playSound(name: SoundName) {
  try {
    // Prefer real audio files
    const fileUrl = SOUND_FILES[name];
    if (fileUrl) {
      playFile(fileUrl);
      return;
    }
    // Fall back to synthesized sounds
    const synth = synthSounds[name];
    if (synth) {
      synth();
    }
  } catch (e) {
    // AudioContext may not be available
  }
}

export function setVolume(v: number) {
  volume = Math.max(0, Math.min(1, v));
  // Update cached audio elements
  audioCache.forEach((audio) => {
    audio.volume = volume;
  });
}

export function getVolume(): number {
  return volume;
}

/**
 * Must be called from a user gesture (click) to unlock Web Audio on mobile.
 */
export function initAudio() {
  try {
    getContext();
    // Pre-load all audio files into cache
    Object.values(SOUND_FILES).forEach((url) => {
      if (url && !audioCache.has(url)) {
        const audio = new Audio(url);
        audio.preload = 'auto';
        audioCache.set(url, audio);
      }
    });
  } catch (e) {
    // ignore
  }
}
