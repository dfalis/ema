import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TestAudioComponent } from './test-audio.component';

describe('TestAudioComponent', () => {
  let component: TestAudioComponent;
  let fixture: ComponentFixture<TestAudioComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TestAudioComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestAudioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
