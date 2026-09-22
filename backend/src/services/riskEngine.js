// src/services/riskEngine.js
// AI/Rule-based Risk Engine
// Analyzes location, time, movement, speed, user reports, and danger zones
// Returns a risk score 0-100 with explanatory factors

const dataStore = require('./dataStore');

/**
 * Calculate distance between two coordinates in meters (Haversine formula)
 */
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Earth radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Analyze time-of-day risk
 * Late night/early morning carries higher risk
 */
function getTimeRisk(hour) {
  if (hour >= 23 || hour < 4) return { score: 30, label: 'Late night travel (high risk period)' };
  if (hour >= 4 && hour < 6) return { score: 20, label: 'Early morning travel (elevated risk)' };
  if (hour >= 20 && hour < 23) return { score: 15, label: 'Evening travel (moderate risk period)' };
  if (hour >= 6 && hour < 8) return { score: 5, label: 'Early morning (low risk)' };
  return { score: 0, label: null };
}

/**
 * Check proximity to known danger zones
 */
async function getDangerZoneRisk(latitude, longitude) {
  const zones = await dataStore.getAll('danger_zones');
  const factors = [];
  let maxScore = 0;

  for (const zone of zones) {
    const dist = haversineDistance(latitude, longitude, zone.latitude, zone.longitude);
    if (dist <= zone.radius) {
      const contribution = zone.riskScore * 0.6; // 60% weight from zone score
      if (contribution > maxScore) maxScore = contribution;
      factors.push(`Inside ${zone.name} (${zone.riskLevel} danger zone, ${Math.round(dist)}m away)`);
    } else if (dist <= zone.radius * 2) {
      const contribution = zone.riskScore * 0.2;
      if (contribution > maxScore) maxScore = contribution;
      factors.push(`Near ${zone.name} (${Math.round(dist)}m away)`);
    }
  }

  return { score: Math.min(maxScore, 60), factors };
}

/**
 * Analyze movement pattern risk
 */
function getMovementRisk(movementData) {
  if (!movementData) return { score: 0, factors: [] };

  const { acceleration, speed, suddenMovement, isStationary, longInactivity } = movementData;
  let score = 0;
  const factors = [];

  if (suddenMovement) {
    score += 20;
    factors.push('Sudden abnormal movement detected');
  }
  if (acceleration && acceleration > 15) {
    score += 15;
    factors.push(`High acceleration detected (${acceleration.toFixed(1)} m/s²)`);
  }
  if (speed && speed > 8) {
    score += 10;
    factors.push(`Unusually high movement speed (${speed.toFixed(1)} m/s)`);
  }
  if (longInactivity) {
    score += 12;
    factors.push('Extended inactivity period detected');
  }
  if (isStationary && movementData.hour >= 22) {
    score += 8;
    factors.push('Stationary at night in unknown location');
  }

  return { score: Math.min(score, 40), factors };
}

/**
 * Analyze community safety reports near location
 */
async function getCommunityRisk(latitude, longitude) {
  const reports = await dataStore.getAll('safety_reports', 200);
  const nearbyReports = reports.filter((r) => {
    const dist = haversineDistance(latitude, longitude, r.latitude, r.longitude);
    return dist <= 800; // Within 800 meters
  });

  if (nearbyReports.length === 0) return { score: 0, factors: [] };

  const recentReports = nearbyReports.filter((r) => {
    const ageMs = Date.now() - new Date(r.createdAt).getTime();
    return ageMs < 7 * 24 * 60 * 60 * 1000; // Last 7 days
  });

  let score = 0;
  const factors = [];

  if (nearbyReports.length > 0) {
    score += Math.min(nearbyReports.length * 3, 15);
    factors.push(`${nearbyReports.length} safety reports in nearby area`);
  }
  if (recentReports.length > 0) {
    score += Math.min(recentReports.length * 2, 10);
    factors.push(`${recentReports.length} recent incidents reported nearby`);
  }

  return { score: Math.min(score, 20), factors };
}

/**
 * Main risk calculation function
 * Returns: { score, level, factors, recommendations }
 */
async function calculateRisk({
  latitude,
  longitude,
  movementData = null,
  userId = null,
}) {
  if (!latitude || !longitude) {
    return {
      score: 0,
      level: 'LOW',
      factors: [],
      recommendations: ['Enable location services for accurate risk assessment'],
    };
  }

  const now = new Date();
  const hour = now.getHours();

  // Run all risk analyses
  const timeRisk = getTimeRisk(hour);
  const [dangerZoneRisk, communityRisk, movementRisk] = await Promise.all([
    getDangerZoneRisk(latitude, longitude),
    getCommunityRisk(latitude, longitude),
    Promise.resolve(getMovementRisk(movementData ? { ...movementData, hour } : null)),
  ]);

  // Aggregate scores (max 100)
  let totalScore = 0;
  const allFactors = [];

  if (timeRisk.score > 0 && timeRisk.label) {
    totalScore += timeRisk.score;
    allFactors.push(timeRisk.label);
  }
  totalScore += dangerZoneRisk.score;
  allFactors.push(...dangerZoneRisk.factors);
  totalScore += communityRisk.score;
  allFactors.push(...communityRisk.factors);
  totalScore += movementRisk.score;
  allFactors.push(...movementRisk.factors);

  const score = Math.min(Math.round(totalScore), 100);

  // Determine risk level
  let level;
  if (score <= 30) level = 'LOW';
  else if (score <= 70) level = 'MEDIUM';
  else level = 'HIGH';

  // Generate recommendations
  const recommendations = [];
  if (level === 'HIGH') {
    recommendations.push('Move to a safer, well-lit area immediately');
    recommendations.push('Consider activating SOS if you feel threatened');
    recommendations.push('Share your live location with trusted contacts');
  } else if (level === 'MEDIUM') {
    recommendations.push('Stay alert and aware of your surroundings');
    recommendations.push('Consider enabling Travel Safety Mode');
    recommendations.push('Keep trusted contacts informed of your route');
  } else {
    recommendations.push('Area appears relatively safe');
    recommendations.push('Stay aware and trust your instincts');
  }

  return { score, level, factors: allFactors, recommendations };
}

module.exports = { calculateRisk, haversineDistance };
