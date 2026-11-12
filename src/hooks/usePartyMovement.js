import { useState } from 'react';
import { useGameLoop } from './useGameLoop';

const INITIAL_POSITION = { x: 400, y: 300 };
const DEFAULT_SPACING = 40;
const DEFAULT_FOLLOWER_IDS = ['follower-0', 'follower-1', 'follower-2'];
const DEFAULT_SPEED = 120;

function createInitialParty(direction, followerIds, spacing, initialPosition) {
  const positionHistory = [];

  for (let index = followerIds.length; index > 0; index -= 1) {
    const distance = -index * spacing;
    positionHistory.push({
      distance,
      x: initialPosition.x + direction.x * distance,
      y: initialPosition.y + direction.y * distance,
    });
  }

  positionHistory.push({
    distance: 0,
    x: initialPosition.x,
    y: initialPosition.y,
  });

  return {
    leader: { ...initialPosition },
    followers: followerIds.map((id, index) => ({
      id,
      x: initialPosition.x - direction.x * spacing * (index + 1),
      y: initialPosition.y - direction.y * spacing * (index + 1),
    })),
    direction: { ...direction },
    distanceTravelled: 0,
    positionHistory,
  };
}

function getPositionAtDistance(positionHistory, targetDistance) {
  for (let index = 1; index < positionHistory.length; index += 1) {
    const previous = positionHistory[index - 1];
    const next = positionHistory[index];

    if (next.distance >= targetDistance) {
      const segmentLength = next.distance - previous.distance;
      const progress =
        segmentLength === 0
          ? 0
          : (targetDistance - previous.distance) / segmentLength;

      return {
        x: previous.x + (next.x - previous.x) * progress,
        y: previous.y + (next.y - previous.y) * progress,
      };
    }
  }

  const lastPosition = positionHistory[positionHistory.length - 1];
  return { x: lastPosition.x, y: lastPosition.y };
}

function trimPositionHistory(positionHistory, oldestNeededDistance) {
  const firstNeededIndex = positionHistory.findIndex(
    (position) => position.distance >= oldestNeededDistance,
  );
  const pointsToRemove = Math.max(0, firstNeededIndex - 1);

  if (pointsToRemove > 0) {
    positionHistory.splice(0, pointsToRemove);
  }
}

function advanceParty(party, direction, deltaTime, followerIds, spacing, speed) {
  const distanceTravelled = party.distanceTravelled + speed * deltaTime;
  const leader = {
    x: party.leader.x + direction.x * speed * deltaTime,
    y: party.leader.y + direction.y * speed * deltaTime,
  };
  const positionHistory = [
    ...party.positionHistory,
    { ...leader, distance: distanceTravelled },
  ];

  const followers = followerIds.map((id, index) => ({
    id,
    ...getPositionAtDistance(
      positionHistory,
      distanceTravelled - spacing * (index + 1),
    ),
  }));

  trimPositionHistory(
    positionHistory,
    distanceTravelled - spacing * followerIds.length,
  );

  return {
    leader,
    followers,
    direction: { ...direction },
    distanceTravelled,
    positionHistory,
  };
}

export function usePartyMovement(
  direction,
  {
    followerIds = DEFAULT_FOLLOWER_IDS,
    spacing = DEFAULT_SPACING,
    speed = DEFAULT_SPEED,
    initialPosition = INITIAL_POSITION,
    active = true,
  } = {},
) {
  const [party, setParty] = useState(() =>
    createInitialParty(direction, followerIds, spacing, initialPosition),
  );

  useGameLoop((deltaTime) => {
    if (deltaTime <= 0) {
      return;
    }

    setParty((currentParty) =>
      advanceParty(currentParty, direction, deltaTime, followerIds, spacing, speed),
    );
  }, active);

  return party;
}
