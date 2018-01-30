function init_gauge() {

  if( typeof (Gauge) === 'undefined'){ return; }

  console.log('init_gauge [' + $('.gauge-chart').length + ']');

  console.log('init_gauge');


  var chart_gauge_settings = {
    lines: 12,
    angle: 0,
    lineWidth: 0.4,
    pointer: {
      length: 0.75,
      strokeWidth: 0.042,
      color: '#1D212A'
    },
    limitMax: 'false',
    colorStart: '#1ABC9C',
    colorStop: '#1ABC9C',
    strokeColor: '#F0F3F3',
    generateGradient: true
  };


  if ($('#chart_gauge_01').length){

    var chart_gauge_01_elem = document.getElementById('chart_gauge_01');
    var chart_gauge_01 = new Gauge(chart_gauge_01_elem).setOptions(chart_gauge_settings);

  }


  if ($('#gauge-text').length){

    chart_gauge_01.maxValue = 6000;
    chart_gauge_01.animationSpeed = 32;
    chart_gauge_01.set(3200);
    chart_gauge_01.setTextField(document.getElementById("gauge-text"));

  }

  if ($('#chart_gauge_02').length){

    var chart_gauge_02_elem = document.getElementById('chart_gauge_02');
    var chart_gauge_02 = new Gauge(chart_gauge_02_elem).setOptions(chart_gauge_settings);

  }


  if ($('#gauge-text2').length){

    chart_gauge_02.maxValue = 9000;
    chart_gauge_02.animationSpeed = 32;
    chart_gauge_02.set(2400);
    chart_gauge_02.setTextField(document.getElementById("gauge-text2"));

  }


}
