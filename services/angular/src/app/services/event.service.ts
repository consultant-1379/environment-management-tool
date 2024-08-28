import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

@Injectable()
export class EventsService {

  private subject = new Subject<string>();

  sendMessage(message: string) {
    this.subject.next(message);
  }

  getMessage(): Observable<any> {
    return this.subject.asObservable();
  }

}
