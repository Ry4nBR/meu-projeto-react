import './App.css';
import { useEffect, useRef, useState } from 'react';
import { drawParty } from './game/renderParty';
import { createWaveEnemies } from './game/waves';
import { useEnemyPursuit } from './hooks/useEnemyPursuit';
import { usePartyCombat } from './hooks/usePartyCombat';
import { usePartyMovement } from './hooks/usePartyMovement';
import { usePlayerDirection } from './hooks/usePlayerDirection';
import { useWaveManager } from './hooks/useWaveManager';

function App() {
  const canvasRef = useRef(null);
  const [followerIds, setFollowerIds] = useState([
    'follower-0',
    'follower-1',
    'follower-2',
    'follower-3',
  ]);
  const [isGameOver, setIsGameOver] = useState(false);
  const direction = usePlayerDirection();
  const party = usePartyMovement(direction, { followerIds, active: !isGameOver });
  const pursuit = useEnemyPursuit(
    party,
    !isGameOver,
    () => createWaveEnemies(1),
  );
  const waveInfo = useWaveManager(pursuit.spawnEnemies, !isGameOver);
  const enemies = pursuit.enemies;
  const combat = usePartyCombat(
    party,
    enemies,
    !isGameOver,
    pursuit.applySlow,
    pursuit.applyKnockback,
  );

  useEffect(() => {
    const survivingFollowerIds = combat.party.followers.map(({ id }) => id);
    if (
      survivingFollowerIds.length !== followerIds.length ||
      survivingFollowerIds.some((id, index) => id !== followerIds[index])
    ) {
      setFollowerIds(survivingFollowerIds);
    }

    if (combat.isGameOver) {
      setIsGameOver(true);
    }
  }, [combat, followerIds]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) {
      throw new Error('O navegador não conseguiu criar o contexto 2D do canvas.');
    }

    drawParty(
      context,
      combat.party,
      canvas.width,
      canvas.height,
      combat.enemies,
      combat.projectiles,
      combat.healingEffects,
      combat.shockwaves,
      combat.skeletons,
    );
  }, [combat]);

  return (
    <main className="App">
      <canvas
        ref={canvasRef}
        className="game-canvas"
        width={800}
        height={600}
        data-direction-x={direction.x}
        data-direction-y={direction.y}
        data-leader-x={party.leader.x}
        data-leader-y={party.leader.y}
        data-follower-count={party.followers.length}
        data-enemy-count={combat.enemies.length}
        aria-label="Área do jogo"
      />
      <section className="game-hud" aria-label="Status do jogo">
        <span>Wave: {waveInfo.wave}</span>
        <span>Próxima onda: {waveInfo.countdown}s</span>
      </section>
      {isGameOver && <p role="alert">Game Over</p>}
    </main>
  );
}

export default App;
