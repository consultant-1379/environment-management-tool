export class ChartConverter {

    chartNames = [];
    chartData: Object[];

    convert = function (dataToConvert, nameToSort): Object[] {
        this.chartData = [];
        this.chartNames = [];
        this.setChartNames(dataToConvert, nameToSort);
        this.countStates(nameToSort);
        return this.chartData;
    }

    setChartNames(dataToConvert, nameToSort) {
        dataToConvert.forEach( element => {
            this.chartNames.push(element[nameToSort]);
        });
    }

    countStates(){
        var dict = {};

        let names = new Set(this.chartNames)
        for(let name in names){
            dict[name] = 0
        }

        for (var i = 0; i < this.chartNames.length; i++){
            let state = this.chartNames[i];
            if (dict[state] === undefined){
                dict[state] = 1
            } else {
                dict[state] += 1;
            }
        }

        for (let key in dict){
            var value = dict[key];
            var chartSector = {
                name: <string> key,
                y: value
            };
            this.chartData.push(chartSector);
        }
    }

    setColors = function(data, nameColorMapping){
        data.forEach(element => {
            element["color"] = nameColorMapping.get(element.name);
        });
        return data;
    }
}