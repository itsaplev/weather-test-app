var math = require('mathjs');

var appRouter = function(app) {
    var getRandomValues = function(yearFrom, yearTo, add) {
        var result = [];
        for (var i = yearFrom; i <= yearTo;  i++) {
            for (var j = 1; j <= 12; j++) {
                var record = {
                    year: i,
                    month: j,
                    daysValues: [] 
                };
                for (var k = 1; k <= 31; k++) {
                    record.daysValues.push(((math.random() * ((12 - math.abs(6-j)))) * add).toFixed(2));
                }
                result.push(record);
            }
        }
        return result;
    };

    app.get("/temperature", function(req, res) {
        var yearFrom = parseInt(req.query.yearFrom);
        var yearTo = parseInt(req.query.yearTo);
        res.send(getRandomValues(yearFrom, yearTo, 4));
    });
    app.get("/precipitation", function(req, res) {
        var yearFrom = parseInt(req.query.yearFrom);
        var yearTo = parseInt(req.query.yearTo);
        res.send(getRandomValues(yearFrom, yearTo, 10));
    });
}

module.exports = appRouter;