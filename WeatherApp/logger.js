var weatherLogger = (function() {

    let self = this;
    
    self.levels = {
        error: true, 
        warning: true, 
        info: true
    };

    self.error = function(error) {
        if (self.levels.error) {
            console.log('ERROR:', error);
        }
    };

    self.warning = function(warn) {
        if (self.levels.warning) {
            console.log('WARNING:', warn);
        }
    };

    self.info = function (info) {
        if (self.levels.info) {
            console.log('INFO:', info);
        }
    };

    self.setLevels = function(error, warning, info) {
        self.levels = {
            error: error,
            warning: warning,
            info: info
        };
    };

    return {
        setLevels: setLevels,
        error: error,
        warning: warning,
        info: info,
    };


})();