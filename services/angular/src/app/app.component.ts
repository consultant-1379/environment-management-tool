import { Component, OnInit, ElementRef, ViewChild, Input } from '@angular/core';
import '../assets/css/systemBar.css';
import '../assets/css/styles.css';
import 'rxjs/add/operator/map';
import { WebsocketService } from './services/websocket-service';
import { detect } from 'detect-browser';
import { MatSnackBar, MatMenuTrigger } from '@angular/material';
import { keyCloakUser } from './utils/app-init';
import { SystemPanelComponent } from './systemPanel/system-panel.component';
import { EventsService } from './services/event.service';
import { Router } from '@angular/router';
const browser = detect();

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  host: {
    '(document:click)': 'onClick($event)',
  },
})

export class AppComponent implements OnInit {
  @ViewChild('usernameElement') usernameElement: ElementRef;
  @ViewChild('systemPanelElement') sysPanel: SystemPanelComponent;

  @Input() username: string;
  @Input() systemBar: SystemPanelComponent;

  ioConnection: any;
  showDeploymentLink: boolean = false;
  showAdminLink: boolean = false;
  isHidden: boolean = true;

  constructor(
    private socketService: WebsocketService,
    private snackBar: MatSnackBar,
    private eventsService: EventsService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.initIoConnection();
    this.username = keyCloakUser.getUsername();
    this.listenForMessageFromSystemBar();
    this.checkForAdminAccess();
  }

  private onClick(event: MouseEvent): void {
    if (!this.sysPanel.syspanel.nativeElement.contains(event.target) &&
      !this.usernameElement.nativeElement.contains(event.target)) {
      this.isHidden = true;
    }
  }

  private checkForAdminAccess(): void {
    if (keyCloakUser.isUserInRole('OPS')) {
      this.showAdminLink = true;
    } else {
      this.showAdminLink = false;
    }
  }

  private toggleSystemPanel(): void {
    this.isHidden = !this.isHidden;
  }

  private initIoConnection(): void {
    this.socketService.initSocket();
  }

  private listenForMessageFromSystemBar(): void {
    this.eventsService.getMessage().subscribe((message) => {
      if (message === 'hideSystemBar') {
        this.toggleSystemPanel();
      }
    });
  }
}
