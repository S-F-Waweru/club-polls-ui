import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoursesOverview } from './courses-overview';

describe('CoursesOverview', () => {
  let component: CoursesOverview;
  let fixture: ComponentFixture<CoursesOverview>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CoursesOverview],
    }).compileComponents();

    fixture = TestBed.createComponent(CoursesOverview);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
