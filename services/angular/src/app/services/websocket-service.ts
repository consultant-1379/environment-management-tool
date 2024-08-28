import { Injectable, isDevMode } from '@angular/core';
import * as io from 'socket.io-client';
import { Observable } from 'rxjs';

@Injectable()
export class WebsocketService {
  private socket;

  constructor() { }
  public initSocket(): void {
    let host = '/';
    if (isDevMode()) {
      host = 'localhost/';
    }
    this.socket = io(host, {
      secure: true,
      rejectUnauthorized: false,
      path: '/api/socket.io',
    });
  }

  public onMessage(): Observable<string> {
    return new Observable<string>((observer) => {
      this.socket.on('deploymentEvent', (data: string) => {
        observer.next(data);
      });
    });
  }

}
