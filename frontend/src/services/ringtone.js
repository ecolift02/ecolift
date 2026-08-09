let audioContext = null;
let oscillator = null;
let gainNode = null;
let intervalId = null;

function createBeep() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }

  oscillator = audioContext.createOscillator();
  gainNode = audioContext.createGain();

  oscillator.type = "sine";
  oscillator.frequency.value = 800;
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
  oscillator.start();

  setTimeout(() => {
    if (oscillator) {
      oscillator.stop();
      oscillator.disconnect();
      oscillator = null;
    }
    if (gainNode) {
      gainNode.disconnect();
      gainNode = null;
    }
  }, 300);
}

export function startRingtone() {
  if (intervalId !== null) {
    return;
  }

  createBeep();
  intervalId = window.setInterval(() => {
    createBeep();
  }, 1000);
}

export function stopRingtone() {
  if (intervalId !== null) {
    window.clearInterval(intervalId);
    intervalId = null;
  }

  if (oscillator) {
    oscillator.stop();
    oscillator.disconnect();
    oscillator = null;
  }

  if (gainNode) {
    gainNode.disconnect();
    gainNode = null;
  }

  if (audioContext) {
    audioContext.close().catch(() => {});
    audioContext = null;
  }
}
