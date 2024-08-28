import { Component, OnInit } from '@angular/core';
import { EventsService } from '../../services/event.service';

@Component({
  selector: 'help-docs-permissions',
  templateUrl: './help-docs-permissions.component.html',
  styleUrls: ['./help-docs-permissions.component.css'],
})
export class HelpDocsPermissionsComponent implements OnInit {

  constructor(private eventsService: EventsService) { }

  ngOnInit() {
    this.eventsService.sendMessage('hideTestPhases');
  }

}
