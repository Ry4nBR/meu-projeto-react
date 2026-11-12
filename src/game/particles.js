export const PARTICLE_LIFETIME = 0.4;
export const PARTICLES_PER_BURST = 8;

export function createParticleBurst(idPrefix, x, y, color, random = Math.random) {
  return Array.from({ length: PARTICLES_PER_BURST }, (_, index) => {
    const angle = random() * Math.PI * 2;
    const speed = 35 + random() * 65;
    return {
      id: `${idPrefix}-${index}`,
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      color,
      timeRemaining: PARTICLE_LIFETIME,
    };
  });
}

export function advanceParticles(particles, deltaTime) {
  return particles
    .map((particle) => ({
      ...particle,
      x: particle.x + particle.vx * deltaTime,
      y: particle.y + particle.vy * deltaTime,
      timeRemaining: particle.timeRemaining - deltaTime,
    }))
    .filter((particle) => particle.timeRemaining > 0);
}

export function createIceShatterParticles(idPrefix, x, y, random = Math.random) {
  return createParticleBurst(idPrefix, x, y, '#9be7ff', random);
}

export function createHealLeafParticles(idPrefix, x, y, random = Math.random) {
  return createParticleBurst(idPrefix, x, y, '#38ef7d', random);
}

export function createWindRingParticles(idPrefix, x, y, random = Math.random) {
  return createParticleBurst(idPrefix, x, y, '#b7f7ff', random);
}

export function createSummonSmokeParticles(idPrefix, x, y, random = Math.random) {
  return createParticleBurst(idPrefix, x, y, '#d8c6ff', random);
}
