export function getClassIcon(classType) {
  switch (classType) {
    case 'warrior':
      return '⚔️';
    case 'ice-witch':
      return '❄️';
    case 'druid':
      return '🌿';
    case 'wind-mage':
      return '🌪️';
    case 'necromancer':
      return '💀';
    case 'golden-paladin':
      return '👑';
    default:
      return '🛡️';
  }
}

export function PartyInspector({
  leader,
  followers = [],
  maxPartySlots = 7,
  coins = 0,
  slotUpgradeCost = 50,
  onSlotUpgrade = () => {},
  isPaused = false,
  isGameOver = false,
}) {
  const currentSlots = followers.length + (leader ? 1 : 0);
  const canBuySlot = coins >= slotUpgradeCost && !isPaused && !isGameOver;

  return (
    <aside className="party-inspector" aria-label="Painel da Fila">
      <div className="party-inspector-header">
        <h2>Painel da Fila</h2>
        <span className="party-slot-count">
          {currentSlots}/{maxPartySlots}
        </span>
      </div>

      <ul className="party-member-list">
        {leader && (
          <li className="party-member-card leader" key="leader">
            <span className="member-icon" role="img" aria-label="Líder">
              ⚔️
            </span>
            <div className="member-details">
              <div className="member-header">
                <span className="member-name">Guerreiro (Líder)</span>
                <span className="member-hp-text">
                  {Math.ceil(leader.hp)}/{leader.maxHp}
                </span>
              </div>
              <div className="member-hp-track">
                <div
                  className="member-hp-fill"
                  style={{
                    width: `${Math.max(0, Math.min(100, (leader.hp / leader.maxHp) * 100))}%`,
                  }}
                />
              </div>
            </div>
          </li>
        )}

        {followers.map((follower) => {
          const hp = follower.hp ?? 100;
          const maxHp = follower.maxHp ?? 100;
          const icon = getClassIcon(follower.classType);
          return (
            <li className="party-member-card" key={follower.id}>
              <span className="member-icon" role="img" aria-label={follower.name || follower.classType}>
                {icon}
              </span>
              <div className="member-details">
                <div className="member-header">
                  <span className="member-name">{follower.name || follower.classType}</span>
                  <span className="member-hp-text">
                    {Math.ceil(hp)}/{maxHp}
                  </span>
                </div>
                <div className="member-hp-track">
                  <div
                    className="member-hp-fill"
                    style={{
                      width: `${Math.max(0, Math.min(100, (hp / maxHp) * 100))}%`,
                    }}
                  />
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="party-inspector-footer">
        <button
          type="button"
          className="quick-slot-button"
          disabled={!canBuySlot}
          onClick={onSlotUpgrade}
        >
          +1 Slot ({slotUpgradeCost} moedas)
        </button>
      </div>
    </aside>
  );
}

export default PartyInspector;
