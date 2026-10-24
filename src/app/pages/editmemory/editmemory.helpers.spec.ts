import { HttpErrorResponse } from '@angular/common/http';
import {
  buildUpdateRequest, crewSignature, describeEditError, friendToCrewMember, placeholderToCrewMember, toEditCrewPayload,
} from './editmemory.helpers';
import { CrewMember } from '@models/userInterface.model';
import { SelectedLocation } from '../create-memory/create-memory.helpers';

const PH_ID = '11111111-1111-4111-8111-111111111111';

const friend = (id: string): CrewMember => friendToCrewMember({
  user_id: id, name: id, profilepic: null, profilepic_thumb: null, sharedMemoriesCount: 1, email: '',
} as never);
const existingPh = placeholderToCrewMember({ id: PH_ID, name: 'Maxi' });
const newPh: CrewMember = { ...placeholderToCrewMember({ id: 'placeholder_123', name: ' Lena ' }) };

describe('crewSignature', () => {
  it('ignores order', () => {
    expect(crewSignature([friend('a'), friend('b')])).toBe(crewSignature([friend('b'), friend('a')]));
    expect(crewSignature([friend('a')])).not.toBe(crewSignature([friend('a'), existingPh]));
  });
});

describe('toEditCrewPayload', () => {
  it('keeps existing placeholders by id and creates new ones by name', () => {
    const payload = toEditCrewPayload([friend('a'), existingPh, newPh, friend('me'), friend('a')], 'me', new Set([PH_ID]));
    expect(payload).toEqual([{ userId: 'a' }, { placeholderId: PH_ID }, { placeholderName: 'Lena' }]);
  });
});

describe('buildUpdateRequest', () => {
  const base = {
    title: ' Trip ', description: ' ', start: new Date(2026, 5, 6), end: null,
    location: null, locationChanged: false, crew: [friend('a')], crewChanged: false,
    currentUserId: 'me', existingPlaceholderIds: new Set<string>(),
  };

  it('omits unchanged location and crew', () => {
    const r = buildUpdateRequest(base);
    expect(r).toEqual({ title: 'Trip', description: null, startDate: '2026-06-06', endDate: '2026-06-06' });
    expect('location' in r).toBe(false);
    expect('crew' in r).toBe(false);
  });

  it('sends null for a removed location and the crew when changed', () => {
    const r = buildUpdateRequest({ ...base, locationChanged: true, crewChanged: true });
    expect(r.location).toBeNull();
    expect(r.crew).toEqual([{ userId: 'a' }]);
  });

  it('sends a new location', () => {
    const loc: SelectedLocation = { lat: 47.8, lng: 13.04, city: 'Salzburg', country: '', countryCode: '', source: 'map' };
    expect(buildUpdateRequest({ ...base, location: loc, locationChanged: true }).location)
      .toEqual({ lat: 47.8, lng: 13.04, city: 'Salzburg', country: undefined, countryCode: undefined });
  });
});

describe('describeEditError', () => {
  it('maps known errors', () => {
    expect(describeEditError(new HttpErrorResponse({ status: 403 }))).toContain('permission');
    expect(describeEditError(new HttpErrorResponse({ status: 400, error: { code: 'PLACEHOLDER_NOT_FOUND' } }))).toContain('Reload');
    expect(describeEditError(new Error('x'))).toContain('could not be saved');
  });
});
