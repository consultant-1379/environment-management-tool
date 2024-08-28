import { Component, OnInit } from '@angular/core';
import { EventsService } from '../../services/event.service';

@Component({
  selector: 'help-docs-administration',
  templateUrl: './help-docs-administration.component.html',
  styleUrls: ['./help-docs-administration.component.css'],
})
export class HelpDocsAdministrationComponent implements OnInit {

  constructor(private eventsService: EventsService) { }

  ngOnInit() {
    this.eventsService.sendMessage('hideTestPhases');
  }

}
