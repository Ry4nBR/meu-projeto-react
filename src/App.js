import './App.css';
import { usePlayerDirection } from './hooks/usePlayerDirection';

function App() {
  const direction = usePlayerDirection();

  return (
    <main className="App">
      <canvas
        className="game-canvas"
        width={800}
        height={600}
        data-direction-x={direction.x}
        data-direction-y={direction.y}
        aria-label="Área do jogo"
      />
    </main>
  );
}

export default App;
