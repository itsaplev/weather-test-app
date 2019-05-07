function convertDataForChart (data) {
    //getting summary by monthes in all years
    let summaryByMonthes = {};
    data.forEach((item) => {
        let dSum = item.daysValues.reduce((p, c) => parseFloat(p) + parseFloat(c));
        let mAvg = dSum / item.daysValues.length;
        if (summaryByMonthes[item.month]) {
            summaryByMonthes[item.month] += parseFloat(mAvg);
        } else {
            summaryByMonthes[item.month] = parseFloat(mAvg);
        }
    });
    //calculating average per years for every month
    let average = [];
    Object.keys(summaryByMonthes).forEach((key) => {
        average.push(summaryByMonthes[key] / (data.length / 12));
    })
    return average;
};

onmessage = function(e) {
    postMessage(convertDataForChart(e.data));    
};
