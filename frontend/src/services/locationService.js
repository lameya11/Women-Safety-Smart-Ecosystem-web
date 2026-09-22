// src/services/locationService.js
// GPS location tracking using Browser Geolocation API
// Continuously watches and updates user position

class LocationService {
  constructor() {
    this.watchId = null;
    this.currentPosition = null;
    this.callbacks = {
      update: [],
      error: [],
    };
    this.updateInterval = null;
    this.isTracking = false;
  }

  /**
   * Get one-time current position
   */
  getCurrentPosition() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const location = this._parsePosition(pos);
          this.currentPosition = location;
          resolve(location);
        },
        (err) => reject(err),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
      );
    });
  }

  /**
   * Start continuous location watching
   */
  startWatching() {
    if (!navigator.geolocation) {
      console.warn('Geolocation not supported');
      return false;
    }
    if (this.watchId !== null) return true;

    this.isTracking = true;
    this.watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const location = this._parsePosition(pos);
        this.currentPosition = location;
        this._emit('update', location);
      },
      (err) => {
        console.warn('Location watch error:', err.message);
        this._emit('error', err);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 5000 }
    );
    return true;
  }

  /**
   * Stop location watching
   */
  stopWatching() {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
    this.isTracking = false;
  }

  _parsePosition(pos) {
    return {
      latitude: pos.coords.latitude,
      longitude: pos.coords.longitude,
      accuracy: pos.coords.accuracy,
      speed: pos.coords.speed,
      heading: pos.coords.heading,
      altitude: pos.coords.altitude,
      timestamp: pos.timestamp,
    };
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
      try { cb(data); } catch (err) { console.error('Location callback error:', err); }
    });
  }

  isSupported() {
    return !!navigator.geolocation;
  }

  getLastKnown() {
    return this.currentPosition;
  }
}

const locationService = new LocationService();
export default locationService;
