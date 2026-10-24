// DOM builders for the advanced-marker contents (photo pins + cluster photo stacks).
// Styled in home-map-view.component.scss via :host ::ng-deep (elements are created outside Angular templates).
import { MapMemoryView } from './home-map-view.helpers';

export const MEMORY_ID_ATTR = 'memoryId';   // → data-memory-id
export const MEMORY_IDS_ATTR = 'memoryIds'; // → data-memory-ids (clusters)

function photo(doc: Document, src: string | null, className: string): HTMLElement {
  if (!src) return placeholder(doc, className);

  const img = doc.createElement('img');
  img.className = className;
  img.src = src;
  img.alt = '';
  img.decoding = 'async';
  img.draggable = false;
  img.referrerPolicy = 'no-referrer';
  img.addEventListener('error', () => img.replaceWith(placeholder(doc, className)), { once: true });
  return img;
}

function placeholder(doc: Document, className: string): HTMLElement {
  const el = doc.createElement('span');
  el.className = `${className} mm-noimg`;
  const icon = doc.createElement('span');
  icon.className = 'material-icons';
  icon.setAttribute('aria-hidden', 'true');
  icon.textContent = 'photo';
  el.appendChild(icon);
  return el;
}

/** Round photo pin. Pinned memories: bigger, gold ring, star badge, one-time pulse. */
export function createPinElement(doc: Document, memory: MapMemoryView): HTMLElement {
  const pin = doc.createElement('div');
  pin.className = memory.isPinned ? 'mm-pin mm-pin--pinned' : 'mm-pin';
  pin.dataset[MEMORY_ID_ATTR] = String(memory.memoryId);
  pin.appendChild(photo(doc, memory.thumb, 'mm-pin__photo'));

  if (memory.isPinned) {
    const star = doc.createElement('span');
    star.className = 'mm-pin__star material-icons';
    star.setAttribute('aria-hidden', 'true');
    star.textContent = 'star';
    pin.appendChild(star);
  }
  return pin;
}

/** Cluster as a stack of up to 3 photos (newest on top) plus the count. */
export function createStackElement(
  doc: Document,
  top: MapMemoryView[],
  count: number,
  memberIds: number[],
): HTMLElement {
  const stack = doc.createElement('div');
  stack.className = 'mm-stack';
  stack.dataset[MEMORY_IDS_ATTR] = memberIds.join(',');

  // Painted back to front → newest last = on top
  [...top].reverse().forEach((memory, i, list) => {
    const layer = photo(doc, memory.thumb, 'mm-stack__photo');
    layer.style.setProperty('--layer', String(list.length - 1 - i)); // 0 = top
    stack.appendChild(layer);
  });

  const badge = doc.createElement('span');
  badge.className = 'mm-stack__count';
  badge.textContent = count > 99 ? '99+' : String(count);
  stack.appendChild(badge);
  return stack;
}

/** Memory id behind a marker created by <map-advanced-marker> (read from its content). */
export function memoryIdOf(marker: unknown): number | null {
  const content = (marker as { content?: Element | null } | null)?.content;
  const raw = content instanceof HTMLElement ? content.dataset[MEMORY_ID_ATTR] : undefined;
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export function memberIdsOf(stack: HTMLElement): number[] {
  return (stack.dataset[MEMORY_IDS_ATTR] ?? '').split(',').map(Number).filter(n => n > 0);
}
