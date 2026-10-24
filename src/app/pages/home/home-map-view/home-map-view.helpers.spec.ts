import {
  boundsOf, distanceMeters, filterBySearch, idsSignature, isSameSpot, placeLabel, sortForList, stackOrder, toView,
} from './home-map-view.helpers';
import { MapMemory } from '@models/memory-map.model';

const memory = (id: number, partial: Partial<MapMemory> = {}): MapMemory => ({
  memoryId: id, title: `Trip ${id}`, startDate: '2026-06-06', endDate: '2026-06-07',
  coverUrl: 'full.jpg', coverThumbUrl: null, pictureCount: 3, lat: 47.8, lng: 13.04,
  city: 'Salzburg', country: 'Austria', isOwner: true, isPinned: false, ...partial,
});

describe('toView', () => {
  it('builds labels, position and thumb fallback', () => {
    const v = toView(memory(1));
    expect(v.position).toEqual({ lat: 47.8, lng: 13.04 });
    expect(v.place).toBe('Salzburg, Austria');
    expect(v.thumb).toBe('full.jpg');
    expect(v.dateLabel.replace(/\s/g, ' ')).toBe('Jun 6 – 7, 2026');
    expect(toView(memory(2, { coverThumbUrl: 't.jpg' })).thumb).toBe('t.jpg');
  });

  it('formats places', () => {
    expect(placeLabel(null, 'Austria')).toBe('Austria');
    expect(placeLabel(null, null)).toBe('');
  });
});

describe('filterBySearch / sortForList / stackOrder', () => {
  const list = [
    memory(1, { startDate: '2025-01-01' }),
    memory(2, { startDate: '2026-05-01', title: 'Vienna weekend' }),
    memory(3, { startDate: '2024-01-01', isPinned: true }),
  ];

  it('filters by title, case-insensitive', () => {
    expect(filterBySearch(list, ' VIENNA ').map(m => m.memoryId)).toEqual([2]);
    expect(filterBySearch(list, '').length).toBe(3);
  });

  it('sorts pinned first, then newest', () => {
    expect(sortForList(list).map(m => m.memoryId)).toEqual([3, 2, 1]);
  });

  it('stacks newest on top, max 3', () => {
    expect(stackOrder([...list, memory(4, { startDate: '2026-09-01' })]).map(m => m.memoryId)).toEqual([4, 2, 1]);
  });

  it('builds an order-independent signature', () => {
    expect(idsSignature([list[2], list[0]])).toBe(idsSignature([list[0], list[2]]));
  });
});

describe('geometry', () => {
  it('computes bounds', () => {
    expect(boundsOf([{ lat: 1, lng: 2 }, { lat: -3, lng: 5 }])).toEqual({ north: 1, south: -3, east: 5, west: 2 });
    expect(boundsOf([])).toBeNull();
  });

  it('detects memories at the same spot', () => {
    const cafe = { lat: 48.20849, lng: 16.37208 };
    const nextDoor = { lat: 48.20869, lng: 16.37228 };   // ~27 m
    const acrossTown = { lat: 48.19, lng: 16.35 };       // ~2.6 km
    expect(distanceMeters(cafe, nextDoor)).toBeLessThan(40);
    expect(isSameSpot([cafe, cafe, nextDoor])).toBe(true);
    expect(isSameSpot([cafe, acrossTown])).toBe(false);
    expect(isSameSpot([cafe])).toBe(false);
  });
});
