// Audio procedimental para GeoStrike Imperios utilizando Web Audio API nativo.
// Cero dependencias externas, cero latencia, 100% libre de copyright.

class EmpireSoundService {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private isMusicPlaying: boolean = false;
  private musicGain: GainNode | null = null;
  private musicInterval: any = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.isMuted = localStorage.getItem('geostrike_empire_muted') === 'true';
    }
  }

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (typeof window !== 'undefined') {
      localStorage.setItem('geostrike_empire_muted', String(this.isMuted));
    }
    if (this.isMuted && this.isMusicPlaying) {
      this.stopAmbientMusic();
    }
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public isMusicActive(): boolean {
    return this.isMusicPlaying;
  }

  // --- EFECTOS DE SONIDO (SFX) ---

  // 1. Clink metálico de monedas al cobrar tributos o recompensas
  public playCoinClink() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const notes = [1960, 2620, 3920]; // G6, E7, B7
    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.05);

      gain.gain.setValueAtTime(0.12, this.ctx.currentTime + idx * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + idx * 0.05 + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(this.ctx.currentTime + idx * 0.05);
      osc.stop(this.ctx.currentTime + idx * 0.05 + 0.4);
    });
  }

  // 2. Martillo/Construcción al crear edificios o huertos
  public playBuild() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(240, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, this.ctx.currentTime + 0.18);

    gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.22);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(this.ctx.currentTime);
    osc.stop(this.ctx.currentTime + 0.25);
  }

  // 3. Arpegio ascendente de mejora tecnológica o de casilla
  public playUpgrade() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const chord = [392, 493.88, 587.33, 783.99]; // G4, B4, D5, G5
    chord.forEach((freq, i) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + i * 0.07);

      gain.gain.setValueAtTime(0.1, this.ctx.currentTime + i * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + i * 0.07 + 0.3);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(this.ctx.currentTime + i * 0.07);
      osc.stop(this.ctx.currentTime + i * 0.07 + 0.35);
    });
  }

  // 4. Campana naval / Cuerno de niebla marítimo al fletar barcos o expediciones
  public playShipHorn() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sawtooth';
    osc2.type = 'triangle';

    osc1.frequency.setValueAtTime(87.31, this.ctx.currentTime);
    osc2.frequency.setValueAtTime(130.81, this.ctx.currentTime);

    gain.gain.setValueAtTime(0.01, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.18, this.ctx.currentTime + 0.2);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 1.6);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.ctx.destination);

    osc1.start(this.ctx.currentTime);
    osc2.start(this.ctx.currentTime);
    osc1.stop(this.ctx.currentTime + 1.7);
    osc2.stop(this.ctx.currentTime + 1.7);

    const bellOsc = this.ctx.createOscillator();
    const bellGain = this.ctx.createGain();
    bellOsc.type = 'sine';
    bellOsc.frequency.setValueAtTime(1480, this.ctx.currentTime + 0.25);
    bellGain.gain.setValueAtTime(0.08, this.ctx.currentTime + 0.25);
    bellGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 1.1);
    bellOsc.connect(bellGain);
    bellGain.connect(this.ctx.destination);
    bellOsc.start(this.ctx.currentTime + 0.25);
    bellOsc.stop(this.ctx.currentTime + 1.2);
  }

  // 5. Fanfarria de Megaciudad y Maravilla Nacional
  public playMegacityFanfare() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const bell = this.ctx.createOscillator();
    const bellG = this.ctx.createGain();
    bell.type = 'sine';
    bell.frequency.setValueAtTime(329.63, this.ctx.currentTime);
    bellG.gain.setValueAtTime(0.2, this.ctx.currentTime);
    bellG.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 2.5);
    bell.connect(bellG);
    bellG.connect(this.ctx.destination);
    bell.start(this.ctx.currentTime);
    bell.stop(this.ctx.currentTime + 2.6);

    const trumpet = [523.25, 659.25, 783.99, 1046.50];
    trumpet.forEach((f, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, this.ctx.currentTime + 0.2 + idx * 0.16);

      g.gain.setValueAtTime(0.12, this.ctx.currentTime + 0.2 + idx * 0.16);
      g.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.2 + idx * 0.16 + (idx === 3 ? 1.0 : 0.4));

      osc.connect(g);
      g.connect(this.ctx.destination);

      osc.start(this.ctx.currentTime + 0.2 + idx * 0.16);
      osc.stop(this.ctx.currentTime + 0.2 + idx * 0.16 + (idx === 3 ? 1.1 : 0.45));
    });
  }

  // 6. Fanfarria breve de Misión Completada
  public playMissionSuccess() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const notes = [440, 554.37, 659.25, 880];
    notes.forEach((f, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, this.ctx.currentTime + idx * 0.08);

      g.gain.setValueAtTime(0.14, this.ctx.currentTime + idx * 0.08);
      g.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + idx * 0.08 + 0.5);

      osc.connect(g);
      g.connect(this.ctx.destination);

      osc.start(this.ctx.currentTime + idx * 0.08);
      osc.stop(this.ctx.currentTime + idx * 0.08 + 0.6);
    });
  }

  // --- MÚSICA AMBIENTAL ZEN PROCEDIMENTAL ---
  public toggleAmbientMusic(): boolean {
    if (this.isMusicPlaying) {
      this.stopAmbientMusic();
      return false;
    } else {
      this.startAmbientMusic();
      return true;
    }
  }

  public startAmbientMusic() {
    if (this.isMuted || this.isMusicPlaying) return;
    this.initContext();
    if (!this.ctx) return;

    this.isMusicPlaying = true;
    this.musicGain = this.ctx.createGain();
    this.musicGain.gain.setValueAtTime(0.04, this.ctx.currentTime);
    this.musicGain.connect(this.ctx.destination);

    const chords = [
      [261.63, 329.63, 392.00, 493.88],
      [220.00, 261.63, 329.63, 392.00],
      [174.61, 220.00, 261.63, 370.00],
      [196.00, 246.94, 293.66, 392.00],
    ];

    let chordIdx = 0;

    const playAmbientChord = () => {
      if (!this.isMusicPlaying || !this.ctx || !this.musicGain) return;

      const currentChord = chords[chordIdx % chords.length];
      chordIdx++;

      currentChord.forEach((f, i) => {
        if (!this.ctx || !this.musicGain) return;
        const osc = this.ctx.createOscillator();
        const noteGain = this.ctx.createGain();

        osc.type = i % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(f, this.ctx.currentTime);

        const now = this.ctx.currentTime;
        noteGain.gain.setValueAtTime(0.0001, now);
        noteGain.gain.linearRampToValueAtTime(0.06, now + 1.5);
        noteGain.gain.exponentialRampToValueAtTime(0.0001, now + 4.5);

        osc.connect(noteGain);
        noteGain.connect(this.musicGain);

        osc.start(now);
        osc.stop(now + 4.6);
      });
    };

    playAmbientChord();
    this.musicInterval = setInterval(playAmbientChord, 4800);
  }

  public stopAmbientMusic() {
    this.isMusicPlaying = false;
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
    if (this.musicGain && this.ctx) {
      this.musicGain.gain.linearRampToValueAtTime(0.0001, this.ctx.currentTime + 0.8);
      setTimeout(() => {
        this.musicGain?.disconnect();
        this.musicGain = null;
      }, 900);
    }
  }
}

export const empireSound = new EmpireSoundService();
export default empireSound;
