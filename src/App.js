import './App.css';
import { usePartyMovement } from './hooks/usePartyMovement';
import { usePlayerDirection } from './hooks/usePlayerDirection';

function App() {
  const direction = usePlayerDirection();
  const party = usePartyMovement(direction);

  return (
    <main className="App">
      <canvas
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
