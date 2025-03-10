import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TabNavComponent } from './tab-nav.component';
import { Component } from '@angular/core';
import { By } from '@angular/platform-browser';

@Component({
  selector: 'app-dummy-one',
  template: '<p>Dummy One Component</p>',
})
class DummyOneComponent {}

@Component({
  selector: 'app-dummy-two',
  template: '<p>Dummy Two Component</p>',
})
class DummyTwoComponent {}

describe('Tab Nav Component', () => {
  let component: TabNavComponent;
  let fixture: ComponentFixture<TabNavComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TabNavComponent],
      teardown: { destroyAfterEach: false },
      declarations: [DummyOneComponent, DummyTwoComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(TabNavComponent);
    component = fixture.componentInstance;
    component.tabs = [
      { title: 'Tab 1', component: DummyOneComponent },
      { title: 'Tab 2', component: DummyTwoComponent },
    ];
    fixture.detectChanges(); // Trigger initial change detection
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display first component by default', () => {
    const visiblePanel = fixture.debugElement.query(
      By.css('p-tabpanel div[aria-hidden="false"]'),
    );
    expect(visiblePanel).toBeTruthy();
    expect(
      visiblePanel.nativeElement.querySelector('p')?.textContent,
    ).toContain('Dummy One Component');
  });

  it('should switch to second component by default', () => {
    const tabs = fixture.debugElement.queryAll(By.css('a'));
    tabs[1].nativeElement.click();
    fixture.detectChanges();

    const visiblePanel = fixture.debugElement.query(
      By.css('p-tabpanel div[aria-hidden="false"]'),
    );
    expect(visiblePanel).toBeTruthy();
    expect(
      visiblePanel.nativeElement.querySelector('p')?.textContent,
    ).toContain('Dummy Two Component');
  });
});
