import './App.css';
import { useEffect, useRef, useState } from 'react';
import { drawParty } from './game/renderParty';
import { createWaveEnemies } from './game/waves';
import { getSlotUpgradeCost, purchaseSlotUpgrade } from './game/shop';
import { addPartyMember } from './game/partyRoster';
import { useEnemyPursuit } from './hooks/useEnemyPursuit';
import { usePartyCombat } from './hooks/usePartyCombat';
import { usePartyMovement } from './hooks/usePartyMovement';
import { usePlayerDirection } from './hooks/usePlayerDirection';
import { useWaveManager } from './hooks/useWaveManager';
import { useRecruitSpawns } from './hooks/useRecruitSpawns';
import GameOverScreen from './components/GameOverScreen';
import { hasCanvasBoundaryCollision } from './game/boundaries';

function GameSession({ onRestart }) {
  const canvasRef = useRef(null);
  const [followerIds, setFollowerIds] = useState([
    'follower-0',
    'follower-1',
    'follower-2',
    'follower-3',
  ]);
  const [classById, setClassById] = useState({
    'follower-0': { classType: 'ice-witch', name: 'Bruxa de Gelo' },
    'follower-1': { classType: 'druid', name: 'Druida' },
    'follower-2': { classType: 'wind-mage', name: 'Mago de Vento' },
    'follower-3': { classType: 'necromancer', name: 'Necromante' },
  });
  const [maxPartySlots, setMaxPartySlots] = useState(7);
  const [slotUpgradeCount, setSlotUpgradeCount] = useState(0);
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const isGameActive = !isPaused && !isGameOver;
  const direction = usePlayerDirection(isGameActive);
  const party = usePartyMovement(direction, {
    followerIds,
    classById,
    active: isGameActive,
  });
  const pursuit = useEnemyPursuit(
    party,
    isGameActive,
    () => createWaveEnemies(1),
  );
  const waveInfo = useWaveManager(pursuit.spawnEnemies, isGameActive);
  const enemies = pursuit.enemies;
  const combat = usePartyCombat(
    party,
    enemies,
    isGameActive,
    pursuit.applySlow,
    pursuit.applyKnockback,
  );
  const recruits = useRecruitSpawns(
    party,
    maxPartySlots,
    (recruit) => {
      const result = addPartyMember(
        followerIds,
        recruit.id,
        maxPartySlots,
      );
      if (result.added) {
        setFollowerIds(result.followerIds);
        setClassById((current) => ({
          ...current,
          [recruit.id]: {
            classType: recruit.classType,
            name: recruit.name,
            color: recruit.color,
            maxHp: recruit.maxHp,
            hp: recruit.hp,
            auraRange: recruit.auraRange,
            auraDamage: recruit.auraDamage,
          },
        }));
        if (recruit.isRare) {
          combat.addCoins(50);
        }
      }
    },
    isGameActive,
    waveInfo.wave,
  );
  const slotUpgradeCost = getSlotUpgradeCost(slotUpgradeCount);

  useEffect(() => {
    if (isGameOver) {
      return undefined;
    }

    const handlePauseKeyDown = (event) => {
      if (event.key.toLowerCase() !== 'p' || event.repeat) {
        return;
      }

      event.preventDefault();
      setIsPaused((paused) => !paused);
    };

    window.addEventListener('keydown', handlePauseKeyDown);
    return () => window.removeEventListener('keydown', handlePauseKeyDown);
  }, [isGameOver]);

  const handleSlotUpgrade = () => {
    const purchase = purchaseSlotUpgrade({
      coins: combat.coins,
      maxPartySlots,
      upgradeCount: slotUpgradeCount,
    });

    if (!purchase.purchased || !combat.spendCoins(purchase.cost)) {
      return;
    }

    setMaxPartySlots(purchase.maxPartySlots);
    setSlotUpgradeCount(purchase.upgradeCount);
  };

  useEffect(() => {
    if (
      hasCanvasBoundaryCollision(
        party.leader,
        canvasRef.current.width,
        canvasRef.current.height,
      )
    ) {
      setIsGameOver(true);
      return;
    }

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
  }, [combat, followerIds, party.leader]);

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
      combat.coinDrops,
      combat.coinPickupEffects,
      recruits,
      combat.particles,
    );
  }, [combat, recruits]);

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
        data-coins={combat.coins}
        data-recruit-count={recruits.length}
        aria-label="Área do jogo"
      />
      <section className="game-hud" aria-label="Status do jogo">
        <span>Wave: {waveInfo.wave}</span>
        <span>Próxima onda: {waveInfo.countdown}s</span>
        <span>Moedas: {combat.coins}</span>
        <span>
          Fila: {combat.party.followers.length + 1}/{maxPartySlots}
        </span>
        <button
          type="button"
          aria-pressed={isPaused}
          onClick={() => setIsPaused((paused) => !paused)}
        >
          {isPaused ? 'Continuar' : 'Pausar'}
        </button>
        <button
          type="button"
          disabled={isPaused || isGameOver}
          onClick={() => setIsShopOpen(true)}
        >
          Loja
        </button>
      </section>
      {isPaused && !isGameOver && (
        <section className="pause-overlay" aria-live="polite">
          <h1>Jogo pausado</h1>
          <p>Pressione P ou Continuar para retomar.</p>
        </section>
      )}
      {isShopOpen && (
        <section
          className="shop-panel"
          role="dialog"
          aria-modal="true"
          aria-labelledby="shop-title"
        >
          <button
            className="shop-close"
            type="button"
            aria-label="Fechar loja"
            onClick={() => setIsShopOpen(false)}
          >
            ×
          </button>
          <h2 id="shop-title">Loja</h2>
          <p>+1 Slot de Fila — {slotUpgradeCost} moedas</p>
          <button
            type="button"
            disabled={combat.coins < slotUpgradeCost}
            onClick={handleSlotUpgrade}
          >
            Comprar +1 slot
          </button>
        </section>
      )}
      {isGameOver && (
        <GameOverScreen
          wavesSurvived={Math.max(0, waveInfo.wave - 1)}
          enemiesDefeated={combat.enemiesDefeated}
          coinsCollected={combat.coinsCollected}
          onRestart={onRestart}
        />
      )}
    </main>
  );
}

function App() {
  const [gameRun, setGameRun] = useState(0);

  return (
    <GameSession
      key={gameRun}
      onRestart={() => setGameRun((currentRun) => currentRun + 1)}
    />
  );
}

export default App;
