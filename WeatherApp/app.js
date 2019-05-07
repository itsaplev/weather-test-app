
var weatherApp = (function(service, ui, chart, logger) {
    //variables
    let self = this;
    
    self.currentMode = { temperature: true, precipitation: true };
    self.currentRange = { from: 1881, to: 2006};

    //methods
    self.createSeriesDataSource = function(data) {
        return new Promise((resolve, reject) => {
            if (window.Worker) {
                let worker = new Worker("worker.js");
                worker.postMessage(data);
                worker.onmessage = (e) => resolve(e.data);
            } else { 
                //do it in this thread
                resolve(convertData(data));
                //reject("A WebWorkers feature is unavailable")
            }
        });
    };

    self.reloadRangeData = function() {
        chart.clear();
        weatherService.getTemperatureData(currentRange.from, currentRange.to)
            .then((data) => {
                logger.info('Converting temperature data for chart...');
                createSeriesDataSource(data).then((seriesData) => {
                    logger.info('Adding temperature series to chart...');
                    chart.addSeries("Temperature", seriesData, currentMode.temperature);
                });
        }, logger.error);

        weatherService.getPrecipitationData(currentRange.from, currentRange.to)
            .then((data) => {
                logger.info('Converting precipitation data for chart...');
                createSeriesDataSource(data).then((seriesData) => {
                    logger.info('Adding precipitation series to chart...');
                    chart.addSeries("Precipitation", seriesData, currentMode.precipitation);
                });
            }, logger.error);
    };

    self.initApplication = function(appContainerId) {
        logger.setLevels(true, true, true);
        
        ui.init(appContainerId)
      
        ui.setOnRangeChanged((range) => {
            currentRange = range;
            reloadRangeData();
            logger.info('Range changed to: ' + range.from + ' - ' + range.to);
        });

        ui.setOnModeChanged((mode) => {
            currentMode = mode;
            chart.setSeriesVisible('Temperature', currentMode.temperature);
            chart.setSeriesVisible('Precipitation', currentMode.precipitation);
            logger.info('Mode changed to: temperature: ' + (mode.temperature ? 'yes' : 'no') + ', precipitation: ' + (mode.precipitation ? 'yes' : 'no'));
        });

        chart.setCanvas(ui.getCanvasElement());
        //load default range
        reloadRangeData();
    };

    //public
    return {
        init: initApplication,
    };
})(weatherService, weatherUI, weatherChart, weatherLogger);



