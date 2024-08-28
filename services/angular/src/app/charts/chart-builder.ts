import { Highcharts } from 'angular-highcharts';

export class ChartBuilder {
  private chart = {};
  private title = {};
  private plotOptions = {};
  private creditsEnabled = false;
  private series = {};

  drawBasicChart(locationToAppendChart) {
    Highcharts.chart(locationToAppendChart, {
      chart: this.chart,
      title: this.title,
      plotOptions: this.plotOptions,
      credits: { enabled: this.creditsEnabled },
      series: [this.series],
    });
  }

  chartSetup(chartType, zoomAxis) {
    this.chart = {
      plotBackgroundColor: null,
      plotBorderWidth: null,
      plotShadow: false,
      zoomType: zoomAxis,
      type: chartType,
      backgroundColor: '#f2f2f2',
      style: {
        fontFamily:  'EricssonHilda, Helvetica, sans-serif',
      },
    };
  }

  chartTitle(titleName) {
    this.title = {
      text: titleName,
    };
  }

  chartPieOptions() {
    this.plotOptions = {
      pie: {
        allowPointSelect: true,
        cursor: 'pointer',
        borderColor: '#000000',
        animation: false,
        borderRadius: 20,
        borderWidth: 0,
        dataLabels: {
          enabled: true,
          format: '{point.name}: {point.y}',
        },
      },
    };
  }

  setSeries(seriesName, chartData) {
    this.series = {
      name: seriesName,
      colorByPoint: true,
      data: chartData,
    };
  }
}
