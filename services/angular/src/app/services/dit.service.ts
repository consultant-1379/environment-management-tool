import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class DitService {

  DIT_URL = 'https://atvdit.athtem.eei.ericsson.se/api';
  DIT_DEPLOYMENTS_URL = `${this.DIT_URL}/deployments/`;
  DIT_DOCUMENTS_URL = `${this.DIT_URL}/documents/`;

  QUERY = '?q=';
  DEPLOYMENT_NAME_QUERY = 'name=';

  constructor(private http: HttpClient) { }

  public getDeploymentDocument(deploymentName: string): object {
    const deploymentDitUrl = this.DIT_DEPLOYMENTS_URL + this.QUERY
      + this.DEPLOYMENT_NAME_QUERY + deploymentName;
    return this.convertPromiseToObject(this.http.get(deploymentDitUrl).toPromise().catch((err) => {
      console.log(`Error fetching DIT link for ${deploymentName}`);
      throw err;
    }));
  }

  public getDeploymentSedDocument(sedDocumentId: string): Promise<any> {
    return this.convertPromiseToObject(this.http.get(this.DIT_DOCUMENTS_URL + sedDocumentId)
      .toPromise().catch((err) => {
        console.log(`Error fetching SED document from ID ${sedDocumentId}`);
        throw err;
      }));
  }

  public getDeploymentAssociatedDocument(associatedDocumentId: string): Promise<any> {
    return this.convertPromiseToObject(this.http.get(this.DIT_DOCUMENTS_URL + associatedDocumentId)
      .toPromise().catch((err) => {
        console.log(`Error fetching associated document with ID ${associatedDocumentId}`);
        throw err;
      }));
  }

  public getDeploymentId(deploymentDocument: object): string {
    return deploymentDocument[0]['_id'];
  }

  public getDeploymentSedId(deploymentDocument: object): string {
    return deploymentDocument[0]['enm']['sed_id'];
  }

  private parseDocuments(documentType: string, deploymentDocument: object): string {
    for (const schema of deploymentDocument[0].documents) {
      if ((schema['schema_name'] === documentType)) {
        return schema['document_id'];
      }
    }
  }

  public getDeploymentDdpId(deploymentDocument: object): string {
    return this.parseDocuments('ddp', deploymentDocument);
  }

  public getCenmDeploymentDdpId(deploymentDocument: object): string {
    return this.parseDocuments('cENM_site_information', deploymentDocument);
  }

  public getDeploymentVnfId(deploymentDocument: object): string {
    return this.parseDocuments('vnflcm_sed_schema', deploymentDocument);
  }

  private convertPromiseToObject(promise: Promise<Object>): any {
    return promise.then((result) => {
      return result;
    });
  }
}
