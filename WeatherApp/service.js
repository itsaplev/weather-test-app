//https://openweathermap.org/history
var weatherService = (function(db, logger) {
    const host = "http://localhost:3000/";
    //variables
    let self =  this;
    //methods
    self.loadData = function(metric, yearFrom, yearTo) {
        return new Promise((resolve, reject) => {
            var url = host + metric + "?yearFrom=" + yearFrom + "&yearTo=" + yearTo;
                fetch(url).then((response) => {
                    response.json()
                        .then(resolve, reject);
                }, reject);
            });
    };

    self.getTemperatureData = function (yearFrom, yearTo) {
        return new Promise((resolve, reject) => {
            db.getTemperatureData(yearFrom, yearTo).then(resolve, 
                () => {
                    logger.warning('Temperature data for requested years range not found in DB, loading from Web Service...');
                    loadData('temperature', yearFrom, yearTo)
                        .then((data) => {
                           logger.info('Temperature data loaded successfully. Saving into DB...');
                           db.setTemperatureData(data).then(resolve, reject);
                        }, reject);
                });
        });
    };

    self.getPrecipitationData = function (yearFrom, yearTo) {
        return new Promise((resolve, reject) => {
            db.getPrecipitationData(yearFrom, yearTo).then(resolve, 
                () => {
                    logger.warning('Precipitation data for requested years range not found in DB, loading from Web Service...');
                    loadData('precipitation', yearFrom, yearTo)
                        .then((data) => {
                            logger.info('Precipitation data loaded successfully. Saving into DB...');
                            db.setPrecipitationData(data).then(resolve, reject);
                        }, reject);
                });
        });
    };

    //public
    return {
        getTemperatureData: getTemperatureData,
        getPrecipitationData: getPrecipitationData,
    };
})(weatherDB, weatherLogger);