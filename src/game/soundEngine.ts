/**
 * Procedural Web Audio API Synthesizer for TETRIS 3D
 * Generates electronic arcade music and responsive sound effects with zero external audio files.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private musicVolume = 0.35;
  private sfxVolume = 0.65;
  private muted = false;
  private isMusicPlaying = false;
  private musicTimer: number | null = null;
  private stepIndex = 0;
  private currentLevel = 1;

  // Classic arcade minor-key electronic sequence (frequencies in Hz, 0 = rest)
  // Inspired by classic A-minor / E-minor arcade chiptune/synthwave progressions
  private readonly leadNotes = [
    659.25, 0, 493.88, 523.25, 587.33, 0, 523.25, 493.88,
    440.00, 0, 440.00, 523.25, 659.25, 0, 587.33, 523.25,
    493.88, 0, 493.88, 523.25, 587.33, 0, 659.25, 0,
    523.25, 0, 440.00, 0, 440.00, 0, 0, 0,
    587.33, 0, 698.46, 880.00, 0, 783.99, 698.46, 0,
    659.25, 0, 523.25, 659.25, 0, 587.33, 523.25, 0,
    493.88, 0, 493.88, 523.25, 587.33, 0, 659.25, 0,
    523.25, 0, 440.00, 0, 440.00, 0, 0, 0,
  ];

  private readonly bassNotes = [
    164.81, 329.63, 164.81, 329.63, 164.81, 329.63, 164.81, 329.63,
    110.00, 220.00, 110.00, 220.00, 110.00, 220.00, 110.00, 220.00,
    146.83, 293.66, 146.83, 293.66, 164.81, 329.63, 164.81, 329.63,
    110.00, 220.00, 110.00, 220.00, 110.00, 164.81, 220.00, 0,
    146.83, 293.66, 146.83, 293.66, 146.83, 293.66, 146.83, 293.66,
    130.81, 261.63, 130.81, 261.63, 130.81, 261.63, 130.81, 261.63,
    164.81, 329.63, 164.81, 329.63, 164.81, 329.63, 164.81, 329.63,
    110.00, 220.00, 110.00, 220.00, 110.00, 0, 110.00, 0,
  ];

  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public setVolumes(music: number, sfx: number, muted: boolean) {
    this.musicVolume = Math.max(0, Math.min(1, music));
    this.sfxVolume = Math.max(0, Math.min(1, sfx));
    this.muted = muted;
  }

  public setLevel(level: number) {
    this.currentLevel = Math.max(1, level);
  }

  public startMusic() {
    if (this.isMusicPlaying) return;
    this.isMusicPlaying = true;
    this.scheduleNextBeat();
  }

  public stopMusic() {
    this.isMusicPlaying = false;
    if (this.musicTimer !== null) {
      window.clearTimeout(this.musicTimer);
      this.musicTimer = null;
    }
  }

  private scheduleNextBeat = () => {
    if (!this.isMusicPlaying) return;

    if (!this.muted && this.musicVolume > 0.01) {
      this.playMusicStep(this.stepIndex);
    }

    this.stepIndex = (this.stepIndex + 1) % this.leadNotes.length;
    const tempoFactor = Math.max(0.68, 1 - (this.currentLevel - 1) * 0.02);
    const stepMs = Math.round(165 * tempoFactor);
    this.musicTimer = window.setTimeout(this.scheduleNextBeat, stepMs);
  };

  private playMusicStep(idx: number) {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const leadFreq = this.leadNotes[idx];
    const bassFreq = this.bassNotes[idx];

    if (leadFreq > 0) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(leadFreq, now);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2400, now);

      const peak = this.musicVolume * 0.16;
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(peak, now + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.15);
    }

    if (bassFreq > 0) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(bassFreq, now);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(650, now);

      const peak = this.musicVolume * 0.11;
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(peak, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.13);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.14);
    }
  }

  public playMove() {
    if (this.muted || this.sfxVolume <= 0.01) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    const jitter = 0.96 + Math.random() * 0.08;
    osc.type = 'sine';
    osc.frequency.setValueAtTime(290 * jitter, now);
    osc.frequency.exponentialRampToValueAtTime(190 * jitter, now + 0.045);

    gain.gain.setValueAtTime(this.sfxVolume * 0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.045);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.05);
  }

  public playRotate() {
    if (this.muted || this.sfxVolume <= 0.01) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    const jitter = 0.95 + Math.random() * 0.1;
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(420 * jitter, now);
    osc.frequency.exponentialRampToValueAtTime(680 * jitter, now + 0.075);

    gain.gain.setValueAtTime(this.sfxVolume * 0.24, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.085);
  }

  public playSoftDrop() {
    if (this.muted || this.sfxVolume <= 0.01) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(210, now);
    osc.frequency.exponentialRampToValueAtTime(150, now + 0.035);

    gain.gain.setValueAtTime(this.sfxVolume * 0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.035);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.04);
  }

  public playHold() {
    if (this.muted || this.sfxVolume <= 0.01) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [392.0, 523.25];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.045);

      gain.gain.setValueAtTime(this.sfxVolume * 0.22, now + i * 0.045);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.045 + 0.09);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.045);
      osc.stop(now + i * 0.045 + 0.095);
    });
  }

  public playLand(hardDrop = false) {
    if (this.muted || this.sfxVolume <= 0.01) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = hardDrop ? 'triangle' : 'sine';
    const startFreq = hardDrop ? 185 : 140;
    const endFreq = hardDrop ? 48 : 65;
    const duration = hardDrop ? 0.14 : 0.09;

    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(endFreq, now + duration);

    gain.gain.setValueAtTime(this.sfxVolume * (hardDrop ? 0.42 : 0.28), now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + duration + 0.01);
  }

  public playLineClear(linesCount: number) {
    if (this.muted || this.sfxVolume <= 0.01) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    if (linesCount >= 4) {
      // Special 4-line TETRIS fanfare chord + shimmer!
      const fanfare = [523.25, 659.25, 783.99, 1046.5, 1318.5, 1567.98];
      fanfare.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = idx % 2 === 0 ? 'triangle' : 'sawtooth';
        const start = now + idx * 0.055;
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.linearRampToValueAtTime(this.sfxVolume * 0.28, start + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.36);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + 0.38);
      });
    } else {
      const chords: Record<number, number[]> = {
        1: [523.25, 659.25, 783.99],
        2: [523.25, 659.25, 783.99, 987.77],
        3: [587.33, 739.99, 880.0, 1174.66],
      };
      const notes = chords[linesCount] || chords[1];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        const start = now + idx * 0.045;
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.linearRampToValueAtTime(this.sfxVolume * 0.25, start + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.22);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + 0.24);
      });
    }
  }

  public playGameOver() {
    if (this.muted || this.sfxVolume <= 0.01) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [440.0, 415.3, 392.0, 349.23, 293.66, 220.0];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      const start = now + idx * 0.095;
      osc.frequency.setValueAtTime(freq, start);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.92, start + 0.18);

      gain.gain.setValueAtTime(this.sfxVolume * 0.24, start);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.22);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.23);
    });
  }
}

export const soundEngine = new SoundEngine();
