import { useRef, useState } from 'react';
import { collectRecruit, createRecruit, RECRUIT_SPAWN_INTERVAL } from '../game/recruits';
import { useGameLoop } from './useGameLoop';

export function useRecruitSpawns(party, maxPartySlots, onRecruit, active = true) {
  const [recruits, setRecruits] = useState([]);
  const recruitsRef = useRef([]);
  const elapsedRef = useRef(0);
  const nextIdRef = useRef(0);
  const onRecruitRef = useRef(onRecruit);
  onRecruitRef.current = onRecruit;

  useGameLoop((deltaTime) => {
    if (deltaTime <= 0) {
      return;
    }

    elapsedRef.current += deltaTime;
    while (elapsedRef.current >= RECRUIT_SPAWN_INTERVAL) {
      elapsedRef.current -= RECRUIT_SPAWN_INTERVAL;
      const recruit = createRecruit(`recruit-${nextIdRef.current}`);
      nextIdRef.current += 1;
      recruitsRef.current = [...recruitsRef.current, recruit];
      setRecruits(recruitsRef.current);
    }

    const result = collectRecruit(
      recruitsRef.current,
      party,
      maxPartySlots,
    );
    if (result.recruited) {
      recruitsRef.current = result.recruits;
      setRecruits(result.recruits);
      onRecruitRef.current(result.recruited);
    }
  }, active);

  return recruits;
}
