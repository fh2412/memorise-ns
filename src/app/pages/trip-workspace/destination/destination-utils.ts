// trip-workspace/destination/destination-utils.ts
import { Injector } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PlanBoardStore } from '../plan-board.store';
import { pickLocation } from '../polls/location-utils';
import { DestinationDialogComponent } from './destination-dialog/destination-dialog.component';

/** Opens the destination dialog. The injector must provide PlanBoardStore (workspace or live view). */
export function showDestinationDialog(dialog: MatDialog, injector: Injector): void {
  dialog.open<DestinationDialogComponent, void, boolean>(DestinationDialogComponent, {
    width: '480px',
    maxWidth: '95vw',
    autoFocus: false,
    injector,
  });
}

/** "Pick on map" for a name-only destination: keeps the name, adds the pin. */
export async function pinDestinationOnMap(dialog: MatDialog, store: PlanBoardStore): Promise<void> {
  const current = store.destinationInfo();
  if (!current) return;
  const loc = await pickLocation(dialog, current.location);
  if (loc) await store.setDestination(current.label, loc);
}
