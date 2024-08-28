import { Component, OnInit } from '@angular/core';
import { EventsService } from '../services/event.service';

@Component({
  selector: 'help-docs-landing-page',
  templateUrl: './help-docs-landing-page.component.html',
  styleUrls: ['./help-docs-landing-page.component.css'],
})
export class HelpDocsLandingPageComponent implements OnInit {

  constructor(private eventsService: EventsService) { }

  ngOnInit() {
    this.eventsService.sendMessage('hideTestPhases');
  }

}
