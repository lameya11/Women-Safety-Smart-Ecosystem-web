// src/services/audioService.js
// Audio service: alarm, recording, fake call ringtone
// Uses Web Audio API for alarm generation
// Uses MediaRecorder API for recording (when permission granted)

class AudioService {
  constructor() {
    this.audioContext = null;
    this.alarmNodes = [];
    this.isAlarmPlaying = false;
    this.mediaRecorder = null;
    this.recordingChunks = [];
    this.isRecording = false;
    this.ringtoneInterval = null;
    this.ringtoneOscillators = [];
  }

  _getAudioContext() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    // Resume if suspended (autoplay policy)
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
    return this.audioContext;
  }

  /**
   * Play emergency alarm using Web Audio API (no external files needed)
   */
  playAlarm() {
    if (this.isAlarmPlaying) return;
    this.isAlarmPlaying = true;

    try {
      const ctx = this._getAudioContext();

      const playBeep = (freq, startTime, duration, gain = 0.8) => {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        osc.connect(gainNode);
        gainNode.connect(ctx.destination);
        osc.frequency.setValueAtTime(freq, startTime);
        gainNode.gain.setValueAtTime(gain, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
        osc.start(startTime);
        osc.stop(startTime + duration);
        this.alarmNodes.push(osc);
      };

      // Emergency alarm pattern: repeating high-pitched beeps
      const scheduleAlarm = () => {
        if (!this.isAlarmPlaying) return;
        const now = ctx.currentTime;
        // Alternating frequencies for attention-grabbing pattern
        for (let i = 0; i < 6; i++) {
          playBeep(i % 2 === 0 ? 1200 : 900, now + i * 0.2, 0.18);
        }
        this._alarmTimer = setTimeout(scheduleAlarm, 1400);
      };

      scheduleAlarm();
    } catch (err) {
      console.warn('Audio playback error:', err);
    }
  }

  /**
   * Stop emergency alarm
   */
  stopAlarm() {
    this.isAlarmPlaying = false;
    if (this._alarmTimer) {
      clearTimeout(this._alarmTimer);
      this._alarmTimer = null;
    }
    this.alarmNodes.forEach((node) => {
      try { node.stop(); } catch {}
    });
    this.alarmNodes = [];
  }

  /**
   * Play fake call ringtone
   */
  playRingtone() {
    if (this.ringtoneInterval) return;
    try {
      const ctx = this._getAudioContext();
      const playRingTone = () => {
        if (!this.ringtoneInterval) return;
        const now = ctx.currentTime;
        // Classic phone ring: two beeps then pause
        [0, 0.3].forEach((offset) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.frequency.setValueAtTime(440, now + offset);
          gain.gain.setValueAtTime(0.5, now + offset);
          gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.25);
          osc.start(now + offset);
          osc.stop(now + offset + 0.25);
          this.ringtoneOscillators.push(osc);
        });
      };

      playRingTone();
      this.ringtoneInterval = setInterval(playRingTone, 2000);
    } catch (err) {
      console.warn('Ringtone error:', err);
    }
  }

  /**
   * Stop ringtone
   */
  stopRingtone() {
    if (this.ringtoneInterval) {
      clearInterval(this.ringtoneInterval);
      this.ringtoneInterval = null;
    }
    this.ringtoneOscillators.forEach((osc) => {
      try { osc.stop(); } catch {}
    });
    this.ringtoneOscillators = [];
  }

  /**
   * Request microphone permission and start recording
   * NOTE: Recording requires user permission - clearly labeled
   */
  async startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.recordingChunks = [];
      this.mediaRecorder = new MediaRecorder(stream);
      this.mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) this.recordingChunks.push(e.data);
      };
      this.mediaRecorder.start();
      this.isRecording = true;
      console.log('🎙️ Recording started');
      return true;
    } catch (err) {
      console.warn('Microphone access denied or unavailable:', err.message);
      return false;
    }
  }

  /**
   * Stop recording and return audio blob
   */
  stopRecording() {
    return new Promise((resolve) => {
      if (!this.mediaRecorder || !this.isRecording) {
        resolve(null);
        return;
      }
      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.recordingChunks, { type: 'audio/webm' });
        this.recordingChunks = [];
        this.isRecording = false;
        resolve(blob);
      };
      this.mediaRecorder.stop();
      this.mediaRecorder.stream.getTracks().forEach((t) => t.stop());
    });
  }

  /**
   * Play warning beep
   */
  playWarningBeep() {
    try {
      const ctx = this._getAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      gain.gain.setValueAtTime(0.4, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch {}
  }
}

const audioService = new AudioService();
export default audioService;
