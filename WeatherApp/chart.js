var weatherChart = (function() {

    //variables
    let self = this;
    self.canvas = null;
    self.context = null;
    self.colorsTable = ['green', 'blue'];
    
    self.topBound = 0;
    self.lowerBound = 0;
    self.boundsStepsCount = 10;
    self.boundsColor = 'gray';

    self.graphMargin = 40;
    
    self.fontSize = 10;
    self.fontName = 'Arial';
    self.fontColor = 'gray';
    self.labelColor = 'gray';
    
    self.availableWidth = 0;
    self.availableHeight = 0;
    self.xFactor = 0;
    self.yFactor = 0;

    self.series = [];
    //methods    

    self.recalcFactors = function(){
        availableWidth = canvas.width - graphMargin * 2; 
        xFactor = availableWidth / 11;
        availableHeight = self.canvas.height - graphMargin * 2;
        yFactor = availableHeight / (self.topBound - self.lowerBound);
    };

    self.setCanvas = function (canvas) {
        self.canvas = canvas;  
        self.context = canvas.getContext("2d");
        self.context.font = fontSize + "px " + fontName;
        self.canvas.onResizeCustomCallback = () => {
            recalcFactors();
            redraw();
        };
        recalcFactors();
        redraw();
    };

    self.addSeries = function(name, dataSource, visible) {
        let series = {
            name: name,
            data: dataSource,
            color: colorsTable[self.series.length],
            visible: visible,
        };
        checkBounds(series);
        drawSeries(series);
        self.series.push(series);
    };

    self.projectPoint = function(x, y,) {
        return {
            x: graphMargin + x * xFactor,
            y: graphMargin + (availableHeight - y * yFactor)
        };
    };

    self.redrawBounds = function() {
        context.fillStyle = boundsColor;
        context.strokeStyle = boundsColor;
        let range = topBound - lowerBound;
        if (Math.abs(range) !== 0) {
            let dStep = (topBound - lowerBound) / boundsStepsCount;
            for (let i = 0; i <= boundsStepsCount; i++) {
                let curY = Math.floor(i * dStep)
                let label = Math.floor(lowerBound + curY);
                let p = projectPoint(0, curY);
                context.fillText(label, p.x - graphMargin + 5, p.y); 
                context.beginPath();
                context.setLineDash([5, 15]);
                context.moveTo(p.x, p.y);
                let ep = projectPoint(11, curY);
                context.lineTo(ep.x, ep.y);
                context.stroke();
            }
        }
    };

    self.drawSeries = function(series) {
        let data =  series.data;
        let correctVal = (val) => val - lowerBound;
        let textRectMargin = 2;

        //draw point label
        let drawPointText = (val, p) => {
            let x = p.x + 3;
            let y = p.y + 3;
            let text = val.toFixed(2);
            let textWidth = context.measureText(text).width;
            context.beginPath();
            context.strokeStyle = labelColor;
            context.rect(x - textRectMargin, y - textRectMargin, textWidth + textRectMargin * 2, fontSize + textRectMargin * 2);
            context.stroke();
            context.fillStyle = fontColor;
            context.fillText(text, x, y + fontSize); 
        };

        let drawDot = (p, color) => {
            context.beginPath();
            context.fillStyle = color;
            context.arc(p.x,p.y,3,0,2*Math.PI);
            context.fill();
        }

        context.setLineDash([]);
        //points except first
        for (let i = 1; i < series.data.length; i++) {
            context.strokeStyle = series.color;
            let prev = projectPoint(i - 1, correctVal(data[i - 1]));
            let curr = projectPoint(i, correctVal(data[i]));
            context.beginPath();
            context.moveTo(prev.x, prev.y);
            context.lineTo(curr.x, curr.y);
            context.stroke();
            drawPointText(data[i], curr);
            drawDot(curr, series.color);
        }
        //first point
        let firstP = projectPoint(0, correctVal(data[0]));
        drawPointText(data[0], firstP);        
        drawDot(firstP, series.color);
    };

    self.checkBounds = function(series) {
        // Check whether are required new range of coordinates for new series data
        if (self.series.length == 0) {
            self.lowerBound = 100;
            self.topBound = -100;
        }
        let min = self.lowerBound;
        let max = self.topBound;
        series.data.forEach((val) => {
            if (val < min) min = val;
            if (val > max) max = val;
        });
        if (min < self.lowerBound || max > self.topBound) {
            self.lowerBound = min < self.lowerBound ? min : self.lowerBound;
            self.topBound = max > self.topBound ? max : self.topBound;
            recalcFactors();
            redraw(); //with new bounds
        } 
    };

    self.setSeriesVisible = function(name, visible) {
        for (let i=0; i < series.length; i++) {
            if (series[i].name == name) {
                series[i].visible = visible;
                redraw();
                break;
            }
        }
    };

    self.redraw = function() {
        context.clearRect(0, 0, canvas.width, canvas.height);
        redrawBounds();
        series.forEach((ser) => {
            if (ser.visible) {
                drawSeries(ser);
            }
        });
    };

    self.clear = function() {
        series = [];
        redraw();
    };

    //public
    return {
        setCanvas: setCanvas,
        addSeries: addSeries,
        setSeriesVisible: setSeriesVisible,
        clear: clear,
        redraw: redraw,
    };
})();