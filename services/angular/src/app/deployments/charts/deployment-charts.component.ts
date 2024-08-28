import { Component } from '@angular/core';
import { ChartConverter } from '../../charts/chart-converter';
import { ChartBuilder } from '../../charts/chart-builder';
import deploymentStates from '../deployment-states';

@Component({
  selector: 'chart-root',
  templateUrl: './chart.component.html',
})

export class DeploymentChartComponent {

  deploymentStateColors = new Map();

  constructor(private chartConverter: ChartConverter, private chartBuilder: ChartBuilder) {
    deploymentStates.forEach((deploymentState) => {
      this.deploymentStateColors.set(deploymentState.name, deploymentState.color);
    });
  }

  buildChart = (deploymentData) => {
    const chartData = this.chartConverter.convert(deploymentData, 'state');
    this.chartConverter.setColors(chartData, this.deploymentStateColors);
    this.chartBuilder.chartSetup('pie', '');
    this.chartBuilder.chartTitle('Status of Environments');
    this.chartBuilder.chartPieOptions();
    this.chartBuilder.setSeries('Environments', chartData);
    this.chartBuilder.drawBasicChart('deploymentsStatusChart');
  }

}
