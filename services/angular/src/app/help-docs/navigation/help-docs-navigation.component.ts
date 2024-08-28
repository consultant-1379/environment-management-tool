import { Component, OnInit, HostListener } from '@angular/core';

@Component({
  selector: 'help-docs-navigation',
  templateUrl: './help-docs-navigation.component.html',
  styleUrls: ['./help-docs-navigation.component.css'],
})
export class HelpDocsNavigationComponent implements OnInit {
  private helpDocsNavigation: string = 'helpDocsNavigationNormalHeight';
  private showGoToTopButton: string = '';
  constructor() { }

  ngOnInit() {
  }

  @HostListener('window:scroll', ['$event'])
  private handleScroll(): void {
    const windowScroll = window.pageYOffset;
    if (windowScroll >= 145) {
      this.showGoToTopButton = 'fadeIn';
      this.helpDocsNavigation = 'helpDocsNavigationShorterHeight';
    } else {
      this.showGoToTopButton = 'fadeOut';
      this.helpDocsNavigation = 'helpDocsNavigationNormalHeight';
    }
  }

}
