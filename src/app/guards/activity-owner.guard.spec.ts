import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { activityOwnerGuard } from './activity-owner.guard';

describe('activityOwnerGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => activityOwnerGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
