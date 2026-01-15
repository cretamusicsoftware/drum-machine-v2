# BEAT-ENGINE PRO: Low-Jitter Step Sequencer

A high-performance drum machine built with **Vanilla JS** and the **Web Audio API**. This project implements a professional "Look-Ahead" scheduler to ensure rock-solid timing that is independent of the main UI thread.

## 🚀 Key Architectural Features

- **Look-Ahead Scheduler:** Uses a dual-timer system (setTimeout + AudioContext clock) to schedule audio events in advance, eliminating timing drift caused by JS garbage collection or heavy UI tasks.
- **Procedural Drum Synthesis:** No external assets. All drum hits (Kick, Snare, Hats) are mathematically synthesized in real-time using Sine oscillators and White Noise generators.
- **Master Bus Processing:** Includes a `DynamicsCompressorNode` on the master output to prevent digital clipping and provide a "glued" hardware sound.
- **Sample-Accurate Envelopes:** Implements `exponentialRampToValueAtTime` to prevent "zipper noise" and clicks during rapid triggering.

## 🛠 Tech Stack

- **Web Audio API:** Core audio engine and scheduling.
- **HTML5 Canvas/RAF:** Smooth 60fps playhead visualization.
- **CSS Grid/Flexbox:** Modern, hardware-inspired skeuomorphic UI.

## 🧪 How to Use

1. Clone the repository.
2. Open `index.html` (No server required).
3. Toggle pads to create a pattern and adjust the BPM slider for real-time tempo changes.

![preview img](/SAMPLER-PRO.png)
