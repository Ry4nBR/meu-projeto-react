export function ClassGuideModal({ isOpen, onClose }) {
  if (!isOpen) {
    return null;
  }

  return (
    <section
      className="class-guide-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="guide-title"
    >
      <button
        type="button"
        className="guide-close"
        aria-label="Fechar guia"
        onClick={onClose}
      >
        ×
      </button>
      <h2 id="guide-title">🏰 Guia de Classes & Arcade</h2>
      <p className="guide-subtitle">Conheça as habilidades dos heróis da sua fila:</p>
      <ul className="guide-classes-list">
        <li>
          <strong>⚔️ Guerreiro (Líder):</strong> Golpeia em arco frontal causando 25 de dano e reduzindo o dano sofrido em 25%.
        </li>
        <li>
          <strong>❄️ Bruxa de Gelo:</strong> Dispara projéteis teleguiados que reduzem a velocidade do inimigo por 2.5s.
        </li>
        <li>
          <strong>🌿 Druida:</strong> A cada 4s, emite aura de cura que regenera o aliado mais ferido da fila.
        </li>
        <li>
          <strong>🌪️ Mago de Vento:</strong> A cada 3.5s, expande uma onda de choque que repele e fere inimigos.
        </li>
        <li>
          <strong>💀 Necromante:</strong> A cada 15s, invoca lacaios esqueletos autônomos acumuláveis.
        </li>
        <li>
          <strong>👑 Paladino Dourado (Raro):</strong> Concede vida massiva e aura sagrada de dano contínuo!
        </li>
      </ul>
      <button type="button" className="guide-start-btn" onClick={onClose}>
        Entendido / Jogar
      </button>
    </section>
  );
}

export default ClassGuideModal;
