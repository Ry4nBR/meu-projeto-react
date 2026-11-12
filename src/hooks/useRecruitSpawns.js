import { useRef, useState } from 'react';
import {
  collectRecruit,
  createGoldenPaladin,
  createRecruit,
  RECRUIT_SPAWN_INTERVAL,
  shouldSpawnRareRecruit,
} from '../game/recruits';
import { useGameLoop } from './useGameLoop';

export function useRecruitSpawns(
  party,
  maxPartySlots,
  onRecruit,
  active = true,
  wave = 1,
) {
  const [recruits, setRecruits] = useState([]);
  const recruitsRef = useRef([]);
  const elapsedRef = useRef(0);
  const nextIdRef = useRef(0);
  const observedWaveRef = useRef(0);
  const onRecruitRef = useRef(onRecruit);
  onRecruitRef.current = onRecruit;

  useGameLoop((deltaTime) => {
    if (wave > observedWaveRef.current) {
      observedWaveRef.current = wave;
      if (shouldSpawnRareRecruit()) {
        const recruit = createGoldenPaladin(`golden-paladin-wave-${wave}`);
        recruitsRef.current = [...recruitsRef.current, recruit];
        setRecruits(recruitsRef.current);
      }
    }

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
