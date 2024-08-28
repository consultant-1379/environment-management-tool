import { Injectable } from '@angular/core';
import { DeploymentService } from '../services/deployments.service';
import { Session } from '../models/session';
import { Deployment } from '../models/deployment';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';

@Injectable()
export class AdminEnvironmentService {

  private sessions: Session[] = [];
  private enterEnvironmentForm: FormGroup;
  private environment: Deployment;

  constructor(
    private deploymentService: DeploymentService,
    private formBuilder: FormBuilder,
  ) { }

  public async checkIfEnvironmentExists(environmentName: string): Promise<Boolean> {
    const environment = await this.deploymentService.getEnvironmentByName(environmentName);
    if (environment[0]) {
      return true;
    }
    return false;
  }
}
