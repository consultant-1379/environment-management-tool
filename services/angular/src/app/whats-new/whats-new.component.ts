import { Component, OnInit } from '@angular/core';
import { EventsService } from './../services/event.service';

@Component({
  selector: 'app-whats-new',
  templateUrl: './whats-new.component.html',
  styleUrls: ['./whats-new.component.css'],
})
export class WhatsNewComponent implements OnInit {

  constructor(private eventsService: EventsService) { }

  ngOnInit() {
    this.eventsService.sendMessage('hideTestPhases');
  }

}
