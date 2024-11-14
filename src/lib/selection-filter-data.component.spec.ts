import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectionFilterDataComponent } from './selection-filter-data.component';

describe('SelectionFilterDataComponent', () => {
  let component: SelectionFilterDataComponent;
  let fixture: ComponentFixture<SelectionFilterDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectionFilterDataComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SelectionFilterDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
