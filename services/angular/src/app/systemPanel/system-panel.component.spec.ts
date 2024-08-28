import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ChangeDetectorRef } from '@angular/core';
import { EventsService } from './../services/event.service';
import { MatCheckboxChange } from '@angular/material';
import { SystemPanelComponent } from './system-panel.component';
import { AngularMaterialModule } from './../app.module';
import { By } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

describe('Component: SystemPanelComponent', () => {
  let component: SystemPanelComponent;
  let fixture: ComponentFixture<SystemPanelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [AngularMaterialModule, FormsModule],
      declarations: [SystemPanelComponent],
      providers: [
        EventsService,
        ChangeDetectorRef,
        MatCheckboxChange,
      ],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SystemPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should call the logout() method if user clicks logout on the system panel', () => {
    const spy = spyOn(component, 'logOut');
    const debugElement = fixture.debugElement.nativeElement.querySelector('#logOutButton');

    debugElement.click();

    fixture.whenStable().then(() => {
      expect(spy).toHaveBeenCalled();
    });
  });

  it('should check the corresponding checkboxes', () => {
    const mteCheckboxDebugElement = fixture.debugElement.query(By.css('#mteCheckbox label'));
    const mteCheckboxInstance = mteCheckboxDebugElement.componentInstance;
    const plmCheckboxDebugElement = fixture.debugElement.query(By.css('#plmCheckbox label'));
    const plmCheckboxInstance = plmCheckboxDebugElement.componentInstance;
    const rvbCheckboxDebugElement = fixture.debugElement.query(By.css('#rvbCheckbox label'));
    const rvbCheckboxInstance = rvbCheckboxDebugElement.componentInstance;

    expect(mteCheckboxInstance.checked).toBe(false);
    expect(plmCheckboxInstance.checked).toBe(false);
    expect(rvbCheckboxInstance.checked).toBe(false);

    fixture.componentInstance.enableDisable('MTE', 'enable');
    fixture.componentInstance.enableDisable('PLM', 'enable');
    fixture.componentInstance.enableDisable('RVB', 'enable');

    fixture.detectChanges();

    fixture.whenStable().then(() => {
      expect(mteCheckboxInstance.checked).toBe(true);
      expect(plmCheckboxInstance.checked).toBe(true);
      expect(rvbCheckboxInstance.checked).toBe(true);
    });
  });

  it('should check all boxes for the coresponding phase', () => {
    const cdlCheckboxDebugElement = fixture.debugElement.query(By.css('#cdlCheckbox label'));
    const cdlCheckboxInstance = cdlCheckboxDebugElement.componentInstance;
    const llCheckboxDebugElement = fixture.debugElement.query(By.css('#longLoopCheckbox label'));
    const llCheckboxInstance = llCheckboxDebugElement.componentInstance;
    const rvbCheckboxDebugElement = fixture.debugElement.query(By.css('#rvbCheckbox label'));
    const rvbCheckboxInstance = rvbCheckboxDebugElement.componentInstance;
    const stkpiCheckboxDebugElement = fixture.debugElement.query(By.css('#stkpiCheckbox label'));
    const stkpiCheckboxInstance = stkpiCheckboxDebugElement.componentInstance;

    expect(cdlCheckboxInstance.checked).toBe(false);
    expect(llCheckboxInstance.checked).toBe(false);
    expect(rvbCheckboxInstance.checked).toBe(false);
    expect(stkpiCheckboxInstance.checked).toBe(false);

    fixture.componentInstance.selectTestPhases('mtValidation');
    fixture.detectChanges();

    fixture.whenStable().then(() => {
      expect(cdlCheckboxInstance.checked).toBe(true);
      expect(llCheckboxInstance.checked).toBe(true);
      expect(rvbCheckboxInstance.checked).toBe(true);
      expect(stkpiCheckboxInstance.checked).toBe(true);
    });
  });

});
