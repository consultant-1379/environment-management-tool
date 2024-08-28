import { Component, OnInit } from '@angular/core';
import { EventsService } from '../../services/event.service';

@Component({
  selector: 'help-docs-quarantine-management',
  templateUrl: './help-docs-quarantine-management.component.html',
  styleUrls: ['./help-docs-quarantine-management.component.css'],
})
export class HelpDocsQuarantineManagementComponent implements OnInit {

  constructor(private eventsService: EventsService) { }

  ngOnInit() {
    this.eventsService.sendMessage('hideTestPhases');
  }

}
