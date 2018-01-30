var chart = AmCharts.makeChart("chartdiv", {
  "type": "serial",
  "theme": "light",
  "height" : 800,
  "dataLoader" : {
    "url" : "/big_dummy"
  },
  "valueAxes": [{
    "stackType": "regular",
    "gridAlpha": 0.07,
    "position": "left"
  }],
  "graphs": [{
    'balloonText' : 'Pass [[value]]',
    'fillColors' : '#4669D7',
    "fillAlphas": 0.6,
    "lineAlpha": 0.4,
    "title": "Pass",
    "valueField": "pass"
  }, {
    'balloonText' : 'Fail [[value]]',
    'fillColors' : '#EA345B',
    "fillAlphas": 0.6,
    "lineAlpha": 0.4,
    "title": "Fail",
    "valueField": "fail"
  }, {
    'balloonText' : 'Skip [[value]]',
    'fillColors' : '#00C73C',
    "fillAlphas": 0.6,
    "lineAlpha": 0.4,
    "title": "Skip",
    "valueField": "skip"
  }],
  "plotAreaBorderAlpha": 0,
  "marginTop": 10,
  "marginLeft" : 30,
  "marginRight" : 30,
  "marginBottom" : 0,
  "chartCursor": {
    "cursorAlpha": 0
  },
  "categoryField": "start_t",
  "dataDateFormat" : "YYYY/MM/DD",
  "categoryAxis": {
    "equalSpacing" : true,
    "startOnAxis": true,
    "parseDates" : true,
    "minPeriod" : "DD",
    "axisColor": "#DADADA",
    "gridAlpha": 0.07
  }
});

var chart2 = AmCharts.makeChart("chartdiv2", {
  "type": "serial",
  "theme": "light",
  "height" : 800,
  "dataLoader" : {
    "url" : "/small_dummy"
  },
  "valueAxes": [{
    "stackType": "regular",
    "gridAlpha": 0.07,
    "position": "left"
  }],
  "graphs": [{
    'balloonText' : 'Pass [[value]]',
    'fillColors' : '#4669D7',
    "fillAlphas": 0.6,
    "lineAlpha": 0.4,
    "title": "Pass",
    "valueField": "pass"
  }, {
    'balloonText' : 'Fail [[value]]',
    'fillColors' : '#EA345B',
    "fillAlphas": 0.6,
    "lineAlpha": 0.4,
    "title": "Fail",
    "valueField": "fail"
  }, {
    'balloonText' : 'Skip [[value]]',
    'fillColors' : '#00C73C',
    "fillAlphas": 0.6,
    "lineAlpha": 0.4,
    "title": "Skip",
    "valueField": "skip"
  }],
  "plotAreaBorderAlpha": 0,
  "marginTop": 10,
  "marginLeft" : 30,
  "marginRight" : 30,
  "marginBottom" : 0,
  "chartCursor": {
    "cursorAlpha": 0
  },
  "categoryField": "start_t",
  "dataDateFormat" : "YYYY/MM/DD",
  "categoryAxis": {
    "equalSpacing" : true,
    "startOnAxis": true,
    "parseDates" : true,
    "minPeriod" : "DD",
    "axisColor": "#DADADA",
    "gridAlpha": 0.07
  }
});
