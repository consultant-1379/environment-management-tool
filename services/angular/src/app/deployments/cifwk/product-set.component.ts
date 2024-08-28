import { Component, Input } from '@angular/core';

@Component({
  selector: 'link-to-ps',
  template: `<a href="#" id="{{this.productSet}}" (mousedown)="openProductSet();">
                {{this.productSet}}
             </a>`,
})

export class ProductSetButton {
  psUrl :string = '';
  @Input() productSet:string = '';
  @Input() platformType:string = '';
  openProductSet(): void {
    const blankWindow = window.open('', '_blank');
    const cifwkUrl = 'https://ci-portal.seli.wh.rnd.internal.ericsson.com';
    const productSet = this['productSet'];
    const drop = productSet.slice(0, productSet.lastIndexOf('.'));
    if (this.platformType === 'cENM') {
      this.psUrl = `${cifwkUrl}/cloudnative/getCloudNativeProductSetContent/${drop}/${productSet}`;
    } else {
      this.psUrl = `${cifwkUrl}/ENM/content/${drop}/${productSet}`;
    }
    blankWindow.location.href = this.psUrl;
  }
}
