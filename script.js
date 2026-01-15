class SamplerEngine {
  constructor() {
    this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    this.samples = {}; // PCM Data storage
    this.isPlaying = false;
    this.currentStep = 0;
    this.tempo = 120;
    this.lookahead = 25.0; // ms
    this.scheduleAheadTime = 0.1; // seconds
    this.nextNoteTime = 0.0;

    this.setupMasterBus();
    this.initUI();
  }

  setupMasterBus() {
    this.masterCompressor = this.audioCtx.createDynamicsCompressor();
    this.masterCompressor.threshold.setValueAtTime(
      -20,
      this.audioCtx.currentTime
    );
    this.masterCompressor.ratio.setValueAtTime(12, this.audioCtx.currentTime);
    this.masterCompressor.connect(this.audioCtx.destination);
  }

  async loadSample(file, instName) {
    const arrayBuffer = await file.arrayBuffer();
    const audioBuffer = await this.audioCtx.decodeAudioData(arrayBuffer);
    this.samples[instName] = audioBuffer;
    console.log(`Loaded: ${instName}`);
  }

  initUI() {
    // Build Pads
    document.querySelectorAll(".track").forEach((track) => {
      const padsContainer = track.querySelector(".pads");
      const inst = track.dataset.inst;
      for (let i = 0; i < 16; i++) {
        const pad = document.createElement("div");
        pad.className = "pad";
        pad.onclick = () => pad.classList.toggle("on");
        padsContainer.appendChild(pad);
      }

      // Bind File Loader
      track.querySelector(".sample-loader").onchange = (e) => {
        const file = e.target.files[0];
        if (file) this.loadSample(file, inst);
      };
    });

    // Build Ruler
    const ruler = document.getElementById("ruler");
    for (let i = 0; i < 16; i++) {
      const dot = document.createElement("div");
      dot.className = "ruler-dot";
      ruler.appendChild(dot);
    }
  }

  scheduler() {
    while (
      this.nextNoteTime <
      this.audioCtx.currentTime + this.scheduleAheadTime
    ) {
      this.scheduleNote(this.currentStep, this.nextNoteTime);
      this.advanceNote();
    }
    if (this.isPlaying) {
      this.timerID = setTimeout(() => this.scheduler(), this.lookahead);
    }
  }

  advanceNote() {
    const secondsPerBeat = 60.0 / this.tempo / 4; // 16th notes
    this.nextNoteTime += secondsPerBeat;
    this.currentStep = (this.currentStep + 1) % 16;
  }

  scheduleNote(step, time) {
    // Visual Update
    const dots = document.querySelectorAll(".ruler-dot");
    const pads = document.querySelectorAll(".pad");

    // Use requestAnimationFrame for visual sync
    requestAnimationFrame(() => {
      dots.forEach((d, i) => d.classList.toggle("active", i === step));
      // Highlight pads currently being triggered
      document
        .querySelectorAll(".pad.playing")
        .forEach((p) => p.classList.remove("playing"));
    });

    document.querySelectorAll(".track").forEach((track) => {
      const inst = track.dataset.inst;
      const pad = track.querySelector(`.pads`).children[step];

      if (pad.classList.contains("on")) {
        this.playBuffer(this.samples[inst], time);
        requestAnimationFrame(() => pad.classList.add("playing"));
      }
    });
  }

  playBuffer(buffer, time) {
    if (!buffer) return;
    const source = this.audioCtx.createBufferSource();
    source.buffer = buffer;

    // Simple Envelope to prevent clicks
    const gain = this.audioCtx.createGain();
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(1, time + 0.002);

    source.connect(gain);
    gain.connect(this.masterCompressor);
    source.start(time);
  }

  toggle() {
    this.isPlaying = !this.isPlaying;
    if (this.isPlaying) {
      if (this.audioCtx.state === "suspended") this.audioCtx.resume();
      this.currentStep = 0;
      this.nextNoteTime = this.audioCtx.currentTime;
      this.scheduler();
    } else {
      clearTimeout(this.timerID);
    }
  }
}

const engine = new SamplerEngine();
const playBtn = document.getElementById("play-btn");

playBtn.onclick = () => {
  engine.toggle();
  playBtn.innerText = engine.isPlaying ? "STOP ENGINE" : "START ENGINE";
  playBtn.classList.toggle("playing");
};

document.getElementById("bpm-input").oninput = (e) => {
  engine.tempo = e.target.value;
};
