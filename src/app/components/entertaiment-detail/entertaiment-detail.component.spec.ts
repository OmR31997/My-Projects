import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EntertaimentDetailComponent } from './entertaiment-detail.component';

describe('EntertaimentDetailComponent', () => {
  let component: EntertaimentDetailComponent;
  let fixture: ComponentFixture<EntertaimentDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EntertaimentDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EntertaimentDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
