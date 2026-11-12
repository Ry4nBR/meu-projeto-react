import { act, render, screen } from '@testing-library/react';
import { useRecruitSpawns } from './useRecruitSpawns';

function RecruitHarness({ party, onRecruit, maxPartySlots = 7, wave = 1 }) {
  const recruits = useRecruitSpawns(party, maxPartySlots, onRecruit, true, wave);
  return <output aria-label="recruits">{JSON.stringify(recruits)}</output>;
}

let scheduledFrame;

beforeEach(() => {
  jest.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
    scheduledFrame = callback;
    return 1;
  });
  jest.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});
});

afterEach(() => jest.restoreAllMocks());

test('spawns a recruit every twenty seconds', () => {
  jest.spyOn(Math, 'random').mockReturnValue(0.9);
  const onRecruit = jest.fn();
  render(
    <RecruitHarness
      party={{ leader: { x: 400, y: 300 }, followers: [] }}
      onRecruit={onRecruit}
    />,
  );

  act(() => scheduledFrame(0));
  act(() => scheduledFrame(20000));

  expect(JSON.parse(screen.getByLabelText('recruits').textContent)).toHaveLength(1);
});

test('can spawn a golden paladin once when a new wave begins', () => {
  jest.spyOn(Math, 'random').mockReturnValue(0.1);
  const onRecruit = jest.fn();
  const { rerender } = render(
    <RecruitHarness
      party={{ leader: { x: 400, y: 300 }, followers: [] }}
      onRecruit={onRecruit}
      wave={1}
    />,
  );

  act(() => scheduledFrame(0));
  expect(JSON.parse(screen.getByLabelText('recruits').textContent)).toHaveLength(1);

  rerender(
    <RecruitHarness
      party={{ leader: { x: 400, y: 300 }, followers: [] }}
      onRecruit={onRecruit}
      wave={2}
    />,
  );
  act(() => scheduledFrame(16.7));

  expect(JSON.parse(screen.getByLabelText('recruits').textContent)).toHaveLength(2);
});

test('recruits a hero on contact and notifies the party roster', () => {
  jest.spyOn(Math, 'random').mockReturnValue(0.9);
  const onRecruit = jest.fn();
  const { rerender } = render(
    <RecruitHarness
      party={{ leader: { x: 400, y: 300 }, followers: [] }}
      onRecruit={onRecruit}
    />,
  );

  act(() => scheduledFrame(0));
  act(() => scheduledFrame(20000));

  const recruit = JSON.parse(screen.getByLabelText('recruits').textContent)[0];
  rerender(
    <RecruitHarness
      party={{
        leader: { x: recruit.x, y: recruit.y },
        followers: [],
      }}
      onRecruit={onRecruit}
    />,
  );
  act(() => scheduledFrame(20016.7));

  expect(onRecruit).toHaveBeenCalledWith(
    expect.objectContaining({ id: recruit.id, classType: recruit.classType }),
  );
  expect(JSON.parse(screen.getByLabelText('recruits').textContent)).toHaveLength(0);
});
