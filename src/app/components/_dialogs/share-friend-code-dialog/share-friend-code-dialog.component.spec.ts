import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LinkModalComponent } from './share-friend-code-dialog.component';

describe('LinkModalComponent', () => {
  let component: LinkModalComponent;
  let fixture: ComponentFixture<LinkModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LinkModalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LinkModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
