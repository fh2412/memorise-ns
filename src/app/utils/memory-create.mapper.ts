import { HttpErrorResponse } from '@angular/common/http';
import { CrewMember } from '@models/userInterface.model';
import { CreateMemoryCrewEntry } from '@models/memory-create.model';

/**
 * Local calendar day → "YYYY-MM-DD".
 * Never use toISOString() for dates: Jun 3 00:00 in Vienna is "2026-06-02T22:00Z" → wrong day.
 */
export function toIsoDate(date: Date | null | undefined): string | null {
  if (!date || Number.isNaN(date.getTime())) return null;
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Crew selector members → request payload.
 * Friends by userId (deduped, creator removed), placeholders by name.
 * The temporary "placeholder_<timestamp>" ids of the selector are NOT sent – the backend creates real ids.
 */
export function toCrewPayload(crew: CrewMember[], currentUserId: string | null): CreateMemoryCrewEntry[] {
  const seen = new Set<string>();
  const result: CreateMemoryCrewEntry[] = [];

  for (const member of crew) {
    if (member.isPlaceholder) {
      const name = member.name?.trim();
      if (name) result.push({ placeholderName: name });
      continue;
    }
    const id = member.user_id;
    if (!id || id === currentUserId || seen.has(id)) continue;
    seen.add(id);
    result.push({ userId: id });
  }
  return result;
}

/** User-facing message for errors of POST /memories. */
export function describeCreateMemoryError(error: unknown): string {
  if (error instanceof HttpErrorResponse) {
    const code = (error.error as { code?: string } | null)?.code;
    if (error.status === 0) return 'No connection. Please check your internet and try again.';
    if (code === 'STORAGE_FULL') return 'Not enough storage left for these photos. Remove some or upgrade your plan.';
    if (code === 'CREW_USER_NOT_FOUND') return 'One of the selected crew members no longer exists. Please check your crew.';
    if (error.status === 400) return 'Some details are invalid. Please check your input.';
    if (error.status === 401) return 'Your session expired. Please sign in again.';
  }
  return 'The memory could not be created. Please try again.';
}
