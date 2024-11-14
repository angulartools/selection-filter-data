import { TestBed } from '@angular/core/testing';

import { SelectionFilterDataService } from './selection-filter-data.service';

describe('SelectionFilterDataService', () => {
  let service: SelectionFilterDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SelectionFilterDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
