// src/services/sensorService.js
// Phone sensor integration using Web APIs
// Detects shake, sudden movement, inactivity, and speed changes
// Falls back gracefully when sensors are unavailable

class SensorService {
  constructor() {
    this.callbacks = {
      shake: [],
      suddenMovement: [],
      inactivity: [],
      speedChange: [],
    };
    this.isActive = false;
    this.lastAcceleration = null;
    this.lastMovementTime = Date.now();
    this.shakeThreshold = 15; // m/s² — adjustable sensitivity
    this.suddenMoveThreshold = 20;
    this.inactivityTimeout = null;
    this.inactivityThresholdMs = 5 * 60 * 1000; // 5 minutes default
    this.permissionGranted = false;
    this.deviceMotionHandler = null;
    this.orientationHandler = null;
  }

  /**
   * Request permission for device motion (iOS 13+ requires explicit permission)
   */
  async requestPermission() {
    // iOS 13+: DeviceMotionEvent.requestPermission
    if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
      try {
        const permission = await DeviceMotionEvent.requestPermission();
        this.permissionGranted = permission === 'granted';
        return this.permissionGranted;
      } catch (err) {
        console.warn('Motion permission denied:', err);
        return false;
      }
    }
    // Android/Desktop: permission not required
    this.permissionGranted = typeof DeviceMotionEvent !== 'undefined';
    return this.permissionGranted;
  }

  /**
   * Start sensor monitoring
   */
  async start(options = {}) {
    if (this.isActive) return;

    const {
      shakeThreshold = 15,
      inactivityMinutes = 5,
    } = options;

    this.shakeThreshold = shakeThreshold;
    this.inactivityThresholdMs = inactivityMinutes * 60 * 1000;

    const granted = await this.requestPermission();
    if (!granted) {
      console.warn('Sensor service: motion events not available');
    }

    this.isActive = true;

    // Device Motion (accelerometer)
    this.deviceMotionHandler = (event) => this._handleMotion(event);
    window.addEventListener('devicemotion', this.deviceMotionHandler, { passive: true });

    // Start inactivity timer
    this._resetInactivityTimer();

    console.log('✅ Sensor service started');
  }

  /**
   * Stop sensor monitoring
   */
  stop() {
    this.isActive = false;
    if (this.deviceMotionHandler) {
      window.removeEventListener('devicemotion', this.deviceMotionHandler);
      this.deviceMotionHandler = null;
    }
    if (this.inactivityTimeout) {
      clearTimeout(this.inactivityTimeout);
      this.inactivityTimeout = null;
    }
    console.log('Sensor service stopped');
  }

  /**
   * Handle accelerometer data
   */
  _handleMotion(event) {
    if (!this.isActive) return;

    const acc = event.accelerationIncludingGravity || event.acceleration;
    if (!acc || (acc.x === null && acc.y === null)) return;

    const x = acc.x || 0;
    const y = acc.y || 0;
    const z = acc.z || 0;
    const magnitude = Math.sqrt(x * x + y * y + z * z);

    // Detect shake
    if (magnitude > this.shakeThreshold) {
      this._emit('shake', { magnitude, x, y, z });
      this._resetInactivityTimer();
    }

    // Detect sudden unusual movement
    if (this.lastAcceleration !== null) {
      const delta = Math.abs(magnitude - this.lastAcceleration);
      if (delta > this.suddenMoveThreshold) {
        this._emit('suddenMovement', { delta, magnitude, x, y, z });
      }
    }

    // Update movement tracking
    if (magnitude > 2) {
      this.lastMovementTime = Date.now();
      this._resetInactivityTimer();
    }

    this.lastAcceleration = magnitude;
  }

  _resetInactivityTimer() {
    if (this.inactivityTimeout) clearTimeout(this.inactivityTimeout);
    this.inactivityTimeout = setTimeout(() => {
      if (this.isActive) {
        this._emit('inactivity', { durationMs: this.inactivityThresholdMs });
      }
    }, this.inactivityThresholdMs);
  }

  /**
   * Simulate shake for demo mode
   */
  simulateShake() {
    this._emit('shake', { magnitude: 25, x: 15, y: 20, z: 5, simulated: true });
  }

  /**
   * Simulate sudden movement for demo mode
   */
  simulateSuddenMovement() {
    this._emit('suddenMovement', { delta: 30, magnitude: 28, simulated: true });
  }

  on(event, callback) {
    if (this.callbacks[event]) {
      this.callbacks[event].push(callback);
    }
    return () => this.off(event, callback);
  }

  off(event, callback) {
    if (this.callbacks[event]) {
      this.callbacks[event] = this.callbacks[event].filter((cb) => cb !== callback);
    }
  }

  _emit(event, data) {
    (this.callbacks[event] || []).forEach((cb) => {
      try { cb(data); } catch (err) { console.error('Sensor callback error:', err); }
    });
  }

  isSupported() {
    return typeof DeviceMotionEvent !== 'undefined';
  }

  setSensitivity(level) {
    // level: 'low', 'medium', 'high'
    const thresholds = { low: 25, medium: 15, high: 8 };
    this.shakeThreshold = thresholds[level] || 15;
    this.suddenMoveThreshold = thresholds[level] * 1.3 || 20;
  }
}

// Singleton instance
const sensorService = new SensorService();
export default sensorService;
