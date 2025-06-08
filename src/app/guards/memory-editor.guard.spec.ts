import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { memoryEditorGuard } from './memory-editor.guard';

describe('memoryEditorGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => memoryEditorGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
