import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MatSnackBar } from '@angular/material';
import { detect } from 'detect-browser';
const browser = detect();

@Component({
  selector: 'app-browser-checker',
  templateUrl: './browserChecker.component.html',
  encapsulation: ViewEncapsulation.None,
})
export class BrowserCheckerComponent implements OnInit {

  constructor(private snackBar: MatSnackBar) { }

  ngOnInit() {
    this.isSupported();
  }

  private isSupported() {
    if (browser.name === 'edge') {
      const message = ` Microsoft ${browser.name} is not an EMT supported browser`;
      this.snackBar.openFromComponent(SnackbarErrorComponent, {
        panelClass: ['error-snack-bar-container'],
        duration: 5000,
        verticalPosition: 'bottom',
      });
    }
  }
}

@Component({
  selector: 'snack-bar-component-example-snack',
  templateUrl: 'snack-bar-component-example-snack.html',
  styleUrls: ['./browserChecker.component.css'],
})
export class SnackbarErrorComponent {}
