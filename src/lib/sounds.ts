// Web Audio API sound effects with global volume control

let audioCtx: AudioContext | null = null;
let globalVolume = parseFloat(localStorage.getItem('sound_volume') ?? '0.5');

const getAudioContext = () => {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  return audioCtx;
};

export const setGlobalVolume = (volume: number) => {
  globalVolume = Math.max(0, Math.min(1, volume));
  localStorage.setItem('sound_volume', String(globalVolume));
};

export const getGlobalVolume = () => globalVolume;

const vol = (base: number) => base * globalVolume;

const playTone = (frequency: number, duration: number, type: OscillatorType = 'sine', volume = 0.3) => {
  try {
    if (globalVolume === 0) return;
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
    
    gainNode.gain.setValueAtTime(vol(volume), ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  } catch (e) {
    // Silently fail if audio is not available
  }
};

export const playScoreSound = () => {
  if (globalVolume === 0) return;
  const ctx = getAudioContext();
  const now = ctx.currentTime;
  [523, 659, 784].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now + i * 0.08);
    gain.gain.setValueAtTime(vol(0.25), now + i * 0.08);
    gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.2);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now + i * 0.08);
    osc.stop(now + i * 0.08 + 0.2);
  });
};

export const playWinSound = () => {
  if (globalVolume === 0) return;
  const ctx = getAudioContext();
  const now = ctx.currentTime;
  const notes = [523, 659, 784, 1047, 784, 1047];
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(freq, now + i * 0.12);
    gain.gain.setValueAtTime(vol(0.15), now + i * 0.12);
    gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.3);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now + i * 0.12);
    osc.stop(now + i * 0.12 + 0.3);
  });
};

export const playLoseSound = () => {
  if (globalVolume === 0) return;
  const ctx = getAudioContext();
  const now = ctx.currentTime;
  [400, 350, 300, 250].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now + i * 0.15);
    gain.gain.setValueAtTime(vol(0.2), now + i * 0.15);
    gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.15 + 0.3);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now + i * 0.15);
    osc.stop(now + i * 0.15 + 0.3);
  });
};

export const playAchievementSound = () => {
  if (globalVolume === 0) return;
  const ctx = getAudioContext();
  const now = ctx.currentTime;
  const notes = [523, 659, 784, 1047, 1319, 1568, 1047, 1568];
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = i < 4 ? 'triangle' : 'sine';
    osc.frequency.setValueAtTime(freq, now + i * 0.1);
    gain.gain.setValueAtTime(vol(0.2), now + i * 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.4);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now + i * 0.1);
    osc.stop(now + i * 0.1 + 0.4);
  });
};

export const playClickSound = () => {
  playTone(800, 0.05, 'square', 0.1);
};

export const playDrawSound = () => {
  if (globalVolume === 0) return;
  const ctx = getAudioContext();
  const now = ctx.currentTime;
  [440, 440, 350].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now + i * 0.15);
    gain.gain.setValueAtTime(vol(0.15), now + i * 0.15);
    gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.15 + 0.2);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now + i * 0.15);
    osc.stop(now + i * 0.15 + 0.2);
  });
};

export const playErrorSound = () => {
  if (globalVolume === 0) return;
  const ctx = getAudioContext();
  const now = ctx.currentTime;
  [200, 150].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(freq, now + i * 0.15);
    gain.gain.setValueAtTime(vol(0.2), now + i * 0.15);
    gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.15 + 0.25);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now + i * 0.15);
    osc.stop(now + i * 0.15 + 0.25);
  });
};
