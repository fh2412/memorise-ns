import { toCrewPayload, toIsoDate } from './memory-create.mapper';
import { CrewMember } from '@models/userInterface.model';

function member(partial: Partial<CrewMember>): CrewMember {
  return {
    country: null, dob: null, name: '', profilepic: null, profilepic_thumb: null,
    sharedMemoriesCount: 0, user_id: '', gender: '', email: '', status: 'online',
    ...partial,
  };
}

describe('toIsoDate', () => {
  it('uses the local calendar day (no UTC shift)', () => {
    expect(toIsoDate(new Date(2026, 5, 3))).toBe('2026-06-03');
    expect(toIsoDate(new Date(2026, 0, 1, 0, 30))).toBe('2026-01-01');
    expect(toIsoDate(new Date(2026, 11, 31, 23, 59))).toBe('2026-12-31');
  });

  it('returns null for missing or invalid dates', () => {
    expect(toIsoDate(null)).toBeNull();
    expect(toIsoDate(undefined)).toBeNull();
    expect(toIsoDate(new Date('invalid'))).toBeNull();
  });
});

describe('toCrewPayload', () => {
  it('maps friends by id and placeholders by name', () => {
    const payload = toCrewPayload([
      member({ user_id: 'u1', name: 'Anna' }),
      member({ user_id: 'placeholder_123', name: '  Maxi ', isPlaceholder: true }),
    ], 'me');
    expect(payload).toEqual([{ userId: 'u1' }, { placeholderName: 'Maxi' }]);
  });

  it('removes the creator, duplicates and empty placeholders', () => {
    const payload = toCrewPayload([
      member({ user_id: 'me' }),
      member({ user_id: 'u1' }),
      member({ user_id: 'u1' }),
      member({ user_id: 'placeholder_1', name: '   ', isPlaceholder: true }),
    ], 'me');
    expect(payload).toEqual([{ userId: 'u1' }]);
  });
});
