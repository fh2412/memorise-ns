// Pure helpers for the edit page (no Angular DI → easy to unit test).
import { HttpErrorResponse } from '@angular/common/http';
import { CrewMember, Friend } from '@models/userInterface.model';
import { EditCrewEntry, MemoryPlaceholder, UpdateMemoryRequest } from '@models/memory-edit.model';
import { SelectedLocation } from '../create-memory/create-memory.helpers';
import { toIsoDate } from '../../utils/memory-create.mapper';

// ── Crew ─────────────────────────────────────────────────────────────────────

/** Same mapping the crew selector uses when a friend is added. */
export function friendToCrewMember(friend: Friend): CrewMember {
  return {
    user_id: friend.user_id,
    name: friend.name,
    profilepic: friend.profilepic,
    profilepic_thumb: friend.profilepic_thumb,
    sharedMemoriesCount: friend.sharedMemoriesCount,
    email: friend.email,
    isPlaceholder: false,
    country: null,
    dob: null,
    gender: '',
    status: 'online',
  };
}

/** Existing placeholder → its real id is used as user_id. */
export function placeholderToCrewMember(placeholder: MemoryPlaceholder): CrewMember {
  return {
    user_id: placeholder.id,
    name: placeholder.name,
    profilepic: null,
    profilepic_thumb: null,
    sharedMemoriesCount: 0,
    email: '',
    isPlaceholder: true,
    country: null,
    dob: null,
    gender: '',
    status: 'online',
  };
}

/** Order-independent fingerprint → "has the crew changed?" */
export function crewSignature(crew: CrewMember[]): string {
  return crew
    .map(m => `${m.isPlaceholder ? 'p' : 'u'}:${m.user_id}`)
    .sort()
    .join('|');
}

/**
 * Selector crew → request.
 * Placeholders that existed when the page loaded are sent by id (kept),
 * placeholders added in the selector ("placeholder_<timestamp>") by name (created).
 */
export function toEditCrewPayload(
  crew: CrewMember[],
  currentUserId: string | null,
  existingPlaceholderIds: ReadonlySet<string>,
): EditCrewEntry[] {
  const seen = new Set<string>();
  const result: EditCrewEntry[] = [];

  for (const member of crew) {
    if (member.isPlaceholder) {
      if (existingPlaceholderIds.has(member.user_id)) {
        if (!seen.has(member.user_id)) result.push({ placeholderId: member.user_id });
        seen.add(member.user_id);
      } else {
        const name = member.name?.trim();
        if (name) result.push({ placeholderName: name });
      }
      continue;
    }
    const id = member.user_id;
    if (!id || id === currentUserId || seen.has(id)) continue;
    seen.add(id);
    result.push({ userId: id });
  }
  return result;
}

// ── Request ──────────────────────────────────────────────────────────────────

export interface EditDraft {
  title: string;
  description: string;
  start: Date | null;
  end: Date | null;
  location: SelectedLocation | null;
  locationChanged: boolean;
  crew: CrewMember[];
  /** false if the crew couldn't be loaded or wasn't touched → crew is NOT sent. */
  crewChanged: boolean;
  currentUserId: string | null;
  existingPlaceholderIds: ReadonlySet<string>;
}

export function buildUpdateRequest(draft: EditDraft): UpdateMemoryRequest {
  const startDate = toIsoDate(draft.start);
  const request: UpdateMemoryRequest = {
    title: draft.title.trim(),
    description: draft.description.trim() || null,
    startDate,
    endDate: startDate ? toIsoDate(draft.end ?? draft.start) : null,
  };

  if (draft.locationChanged) {
    const loc = draft.location;
    request.location = loc
      ? {
          lat: loc.lat,
          lng: loc.lng,
          city: loc.city || undefined,
          country: loc.country || undefined,
          countryCode: loc.countryCode || undefined,
        }
      : null;
  }

  if (draft.crewChanged) {
    request.crew = toEditCrewPayload(draft.crew, draft.currentUserId, draft.existingPlaceholderIds);
  }
  return request;
}

// ── Errors ───────────────────────────────────────────────────────────────────

export function describeEditError(error: unknown): string {
  if (error instanceof HttpErrorResponse) {
    const code = (error.error as { code?: string } | null)?.code;
    if (error.status === 0) return 'No connection. Your changes are still here – try again.';
    if (code === 'CREW_USER_NOT_FOUND') return 'One of the crew members no longer exists. Please check the crew.';
    if (code === 'PLACEHOLDER_NOT_FOUND') return 'The crew changed in the meantime. Reload the page and try again.';
    if (error.status === 403) return 'You don\'t have permission to edit this memory.';
    if (error.status === 404) return 'This memory no longer exists.';
    if (error.status === 400) return 'Some details are invalid. Please check your input.';
  }
  return 'Your changes could not be saved. Please try again.';
}
