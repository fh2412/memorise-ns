import { TestBed } from '@angular/core/testing';

import { MemorystatsService } from './memorystats.service';

describe('MemorystatsService', () => {
  let service: MemorystatsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MemorystatsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
