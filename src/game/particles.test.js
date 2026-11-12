import {
  advanceParticles,
  createParticleBurst,
  PARTICLE_LIFETIME,
  PARTICLES_PER_BURST,
} from './particles';

test('creates a colorful burst with particles that live for 0.4 seconds', () => {
  const particles = createParticleBurst(
    'hit',
    20,
    30,
    '#ff7772',
    () => 0.5,
  );

  expect(particles).toHaveLength(PARTICLES_PER_BURST);
  expect(particles[0]).toMatchObject({
    id: 'hit-0',
    x: 20,
    y: 30,
    color: '#ff7772',
    timeRemaining: PARTICLE_LIFETIME,
  });
});

test('moves particles and removes them when their 0.4 second lifetime expires', () => {
  const particles = createParticleBurst(
    'coin',
    20,
    30,
    '#ffd700',
    () => 0.5,
  );

  const advanced = advanceParticles(particles, 0.2);
  expect(advanced[0].x).not.toBe(20);
  expect(advanced[0].timeRemaining).toBe(0.2);
  expect(advanceParticles(particles, 0.4)).toEqual([]);
});
