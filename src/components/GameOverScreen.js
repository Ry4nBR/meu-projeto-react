function GameOverScreen({
  wavesSurvived,
  enemiesDefeated,
  coinsCollected,
  onRestart,
}) {
  return (
    <section
      className="game-over-panel"
      role="dialog"
      aria-modal="true"
      aria-labelledby="game-over-title"
    >
      <h1 id="game-over-title">Game Over</h1>
      <dl>
        <div>
          <dt>Waves Sobrevividas</dt>
          <dd>{wavesSurvived}</dd>
        </div>
        <div>
          <dt>Total de Inimigos Derrotados</dt>
          <dd>{enemiesDefeated}</dd>
        </div>
        <div>
          <dt>Moedas Coletadas</dt>
          <dd>{coinsCollected}</dd>
        </div>
      </dl>
      <button type="button" onClick={onRestart}>
        Jogar Novamente
      </button>
    </section>
  );
}

export default GameOverScreen;
