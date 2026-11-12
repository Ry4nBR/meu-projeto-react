import './App.css';
import { useEffect, useRef, useState } from 'react';
import { drawParty } from './game/renderParty';
import { useEnemyPursuit } from './hooks/useEnemyPursuit';
import { usePartyCombat } from './hooks/usePartyCombat';
import { usePartyMovement } from './hooks/usePartyMovement';
import { usePlayerDirection } from './hooks/usePlayerDirection';

function App() {
  const canvasRef = useRef(null);
  const [followerIds, setFollowerIds] = useState([
    'follower-0',
    'follower-1',
    'follower-2',
  ]);
  const [isGameOver, setIsGameOver] = useState(false);
  const direction = usePlayerDirection();
  const party = usePartyMovement(direction, { followerIds, active: !isGameOver });
  const enemies = useEnemyPursuit(party, !isGameOver);
  const combat = usePartyCombat(party, enemies, !isGameOver);

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

    drawParty(context, combat.party, canvas.width, canvas.height, combat.enemies);
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
        data-enemy-count={enemies.length}
        aria-label="Área do jogo"
      />
      {isGameOver && <p role="alert">Game Over</p>}
    </main>
  );
}

export default App;
