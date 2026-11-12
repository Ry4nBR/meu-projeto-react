import './App.css';
import { useEffect, useRef } from 'react';
import { drawParty } from './game/renderParty';
import { usePartyMovement } from './hooks/usePartyMovement';
import { usePlayerDirection } from './hooks/usePlayerDirection';

function App() {
  const canvasRef = useRef(null);
  const direction = usePlayerDirection();
  const party = usePartyMovement(direction);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) {
      throw new Error('O navegador não conseguiu criar o contexto 2D do canvas.');
    }

    drawParty(context, party, canvas.width, canvas.height);
  }, [party]);

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
        aria-label="Área do jogo"
      />
    </main>
  );
}

export default App;
