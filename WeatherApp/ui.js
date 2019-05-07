var weatherUI = (function(){
     //variables
    let self = this;
    self.canvasElement = null;
    
    self.mode = { 
        temperature: true, 
        precipitation: true
    };

    self.range = {
        from: 1881,
        to: 2006,
    };

    self.modeChangedCallback = null;
    self.rangeChangedCallback = null;

    //methods
    self.setRangeFrom = function (yearFrom) {
        if (yearFrom <= self.range.to) {
            if (yearFrom != self.range.from) {
                self.range.from = yearFrom;
                self.fireRangeChanged();
            }
        }
    };

     self.setRangeTo= function (yearTo) {
        if (yearTo >= self.range.from) {
            if (yearTo != self.range.to) {
                self.range.to = yearTo;
                self.fireRangeChanged();
            }
        }
    };

    self.setModeTemperature = function (temperature) {
        if (temperature != self.mode.temperature) {
            self.mode.temperature = temperature;
            self.fireModeChanged();
        }
    };

    self.setModePrecipitation = function (precipitation) {
        if (precipitation != self.mode.precipitation) {
            self.mode.precipitation = precipitation;
            self.fireModeChanged();
        }
    };

    self.setOnModeChangedCallback = function (callback) {
        self.modeChangedCallback = callback;
    };

    self.setOnRangeChangedCallback = function (callback) {
        self.rangeChangedCallback = callback;
    };

    self.fireModeChanged = function () {
        if (typeof self.modeChangedCallback === "function") {
            self.modeChangedCallback(self.mode); //todo: pass a new object
        }
    };

    self.fireRangeChanged = function () {
        if (typeof self.rangeChangedCallback === "function") {
            self.rangeChangedCallback(self.range); //todo: pass a new object
        }
    };

    self.resizeCanvas = function() {
        self.canvasElement.width = self.canvasElement.parentElement.clientWidth;
        self.canvasElement.height = self.canvasElement.parentElement.clientHeight;
        if (typeof self.canvasElement.onResizeCustomCallback === "function") {
            self.canvasElement.onResizeCustomCallback();
        };
    };

    self.initUIElements = function(appContainerId) {
        let appContainer = document.getElementById(appContainerId);
        if (appContainer) {
            //create containers
            let mainViewElement = document.createElement("div");
            mainViewElement.className = 'app-main-view';

            let controlsElement = document.createElement("div");
            controlsElement.className = 'app-controls';

            //create mode buttons
            let buttonTemperatureElement = document.createElement("div");
            buttonTemperatureElement.className = 'mode-button active';
            buttonTemperatureElement.innerHTML = 'Temperature';
            buttonTemperatureElement.onclick = (e) => {
                self.setModeTemperature(!self.mode.temperature);
                if (self.mode.temperature) {
                    e.target.classList.add("active");
                } else {
                    e.target.classList.remove("active");
                }
            };

            let buttonPrecipitationElement = document.createElement("div");
            buttonPrecipitationElement.className = 'mode-button active';
            buttonPrecipitationElement.innerHTML = 'Precipitation';
            buttonPrecipitationElement.onclick = (e) => {
                self.setModePrecipitation(!self.mode.precipitation);
                if (self.mode.precipitation) {
                    e.target.classList.add("active");
                } else {
                    e.target.classList.remove("active");
                }
            };

            controlsElement.appendChild(buttonTemperatureElement);
            controlsElement.appendChild(buttonPrecipitationElement);


            let chartElement = document.createElement("div");
            chartElement.className = 'app-chart';              
         
            let rangeElement = document.createElement("div");
            rangeElement.className = 'app-chart-range';

            // populate year combos
            let fromYearComboElement = document.createElement('select');
            fromYearComboElement.id = 'year-from';
            fromYearComboElement.className = 'year-select';
            fromYearComboElement.onchange = (e) => { 
                self.setRangeFrom(parseInt(e.target.value)); 
            };

            for (let i=1881; i<=2006; i++) {
                fromYearComboElement.options.add(new Option(i, i, true, i == 1881));
            }

            let toYearComboElement = document.createElement('select');
            toYearComboElement.id = 'year-to';
            toYearComboElement.className = 'year-select';
            toYearComboElement.onchange = (e) => { 
                self.setRangeTo(parseInt(e.target.value)); 
            };

            for (let i=1881; i<=2006; i++) {
                toYearComboElement.options.add(new Option(i, i, true, i == 2006));
            }

            rangeElement.appendChild(fromYearComboElement);
            rangeElement.appendChild(toYearComboElement);

            let chartAreaElement = document.createElement("div");
            chartAreaElement.className = 'app-chart-area';


            //create canvas element
            let canvas = document.createElement('canvas');
            canvas.id = "app-chart-canvas";
            
            //add elements to page
            chartAreaElement.appendChild(canvas);
            chartElement.appendChild(rangeElement);
            chartElement.appendChild(chartAreaElement);
            mainViewElement.appendChild(controlsElement);
            mainViewElement.appendChild(chartElement);
            appContainer.appendChild(mainViewElement);

            self.canvasElement = canvas;
            self.resizeCanvas();
            window.onresize = self.resizeCanvas;
        } else {
            throw "Element with id '" + appContainerId + "' not found";
        }
    };

    self.getCanvasElement = function() {
        return self.canvasElement;
    };

    //public
    return {
        init: initUIElements,
        getCanvasElement: getCanvasElement,
        setOnModeChanged: setOnModeChangedCallback,
        setOnRangeChanged: setOnRangeChangedCallback,
    };

})();