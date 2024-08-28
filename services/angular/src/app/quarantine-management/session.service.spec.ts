import { SessionService } from './session.service';
import { TestBed, getTestBed } from '@angular/core/testing';
import { TimePeriodService } from './timeperiod.service';
import { TimersService } from './timers.service';
import { Session } from '../models/session';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

describe('SessionService', () => {

  const sessionToTest1: Session = {
    status: 'expired',
    deploymentId: '',
    deploymentName: '',
    assignedTeam: [''],
    teamEmail: [''],
    assignedUserNames: [''],
    assignedUserEmails: [''],
    hours: 0,
    minutes: 0,
    sessionUsername: 'username',
    sessionPassword: 'password',
    expires: '',
    timePeriodId: '',
    _id: '',
    startTime: null,
    endTime: null,
    jira: null,
    createUserOnWlvm: false,
  };

  const sessionToTest2: Session = {
    status: 'active',
    deploymentId: '',
    deploymentName: '',
    assignedTeam: [''],
    teamEmail: [''],
    assignedUserNames: [''],
    assignedUserEmails: [''],
    hours: 0,
    minutes: 0,
    sessionUsername: 'username',
    sessionPassword: 'password',
    expires: '',
    timePeriodId: '',
    _id: '',
    startTime: null,
    endTime: null,
    jira: null,
    createUserOnWlvm: false,
  };

  const sessionToTest3: Session = {
    status: 'expired',
    deploymentId: '',
    deploymentName: '',
    assignedTeam: [''],
    teamEmail: [''],
    assignedUserNames: [''],
    assignedUserEmails: [''],
    hours: 0,
    minutes: 0,
    sessionUsername: 'username',
    sessionPassword: 'password',
    expires: '',
    timePeriodId: '',
    _id: '',
    startTime: null,
    endTime: null,
    jira: null,
    createUserOnWlvm: false,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      declarations: [],
      providers: [
        SessionService,
        { provide: TimePeriodService, useValue: {} },
        { provide: TimersService, useValue: {} },
      ],
    });
    this.injector = getTestBed();
    this.service = this.injector.get(SessionService);
    this.httpMock = this.injector.get(HttpTestingController);
  });

  afterEach(() => {
    this.httpMock.verify();
  });

  it('should be created', () => {
    expect(this.service).toBeTruthy();
  });

  describe('should filter on sessions, given a state is passed in', () => {
    // Arrange
    const sessions: Session[] = [sessionToTest1, sessionToTest2, sessionToTest3];
    const expectedExpiredSessionsToBeReturned: Session[] = [sessionToTest1, sessionToTest3];
    const expectedActiveSessionsToBeReturned: Session[] = [sessionToTest2];

    it('given expired is passed in', () => {
      // Act
      const filteredSessions: Session[] =
      this.service.filterSessionsByStatus(sessions, 'expired');

      // Assert
      expect(filteredSessions).toEqual(expectedExpiredSessionsToBeReturned);
    });

    it('given active is passed in', () => {
      // Act
      const filteredSessions: Session[] =
      this.service.filterSessionsByStatus(sessions, 'active');

      // Assert
      expect(filteredSessions).toEqual(expectedActiveSessionsToBeReturned);
    });
  });

  it('should return a promise of an array of sessions', () => {
    // Arrange
    const dummySessions: Session[] = [sessionToTest1, sessionToTest2, sessionToTest3];

    // Act

    // Assert
    this.service.getAllSessions().then((sessions) => {
      expect(sessions.length).toBe(3);
      expect(sessions).toEqual(dummySessions);
    });

    // Assert requests
    const req = this.httpMock.expectOne(`${this.service.API}/sessions`);
    expect(req.request.method).toBe('GET');

    // provide dummy values as responses
    req.flush(dummySessions);

  });
});
