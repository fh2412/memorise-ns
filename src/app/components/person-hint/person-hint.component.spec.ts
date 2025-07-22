import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PersonHintComponent } from './person-hint.component';

describe('PersonHintComponent', () => {
  let component: PersonHintComponent;
  let fixture: ComponentFixture<PersonHintComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PersonHintComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PersonHintComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
