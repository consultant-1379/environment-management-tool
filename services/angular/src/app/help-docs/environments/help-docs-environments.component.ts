import { Component, OnInit } from '@angular/core';
import { EventsService } from '../../services/event.service';

@Component({
  selector: 'help-docs-environments',
  templateUrl: './help-docs-environments.component.html',
  styleUrls: ['./help-docs-environments.component.css'],
})
export class HelpDocsEnvironmentsComponent implements OnInit {

  constructor(private eventsService: EventsService) { }

  ngOnInit() {
    this.eventsService.sendMessage('hideTestPhases');
  }

}
