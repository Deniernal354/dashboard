/* SPARKLINES */

function init_sparklines() {

  if(typeof (jQuery.fn.sparkline) === 'undefined'){ return; }
  console.log('init_sparklines');


  $(".sparkline_one").sparkline([2, 4, 3, 4, 5, 4, 5, 4, 3, 4, 5, 6, 4, 5, 6, 3, 5, 4, 5, 4, 5, 4, 3, 4, 5, 6, 7, 5, 4, 3, 5, 6], {
    type: 'bar',
    height: '125',
    barWidth: 13,
    colorMap: {
      '7': '#a1a1a1'
    },
    barSpacing: 2,
    barColor: '#26B99A'
  });


  $(".sparkline_two").sparkline([2, 4, 3, 4, 5, 4, 5, 4, 3, 4, 5, 6, 7, 5, 4, 3, 5, 6], {
    type: 'bar',
    height: '40',
    barWidth: 9,
    colorMap: {
      '7': '#a1a1a1'
    },
    barSpacing: 2,
    barColor: '#26B99A'
  });


  $(".sparkline_three").sparkline([2, 4, 3, 4, 5, 4, 5, 4, 3, 4, 5, 6, 7, 5, 4, 3, 5, 6], {
    type: 'line',
    width: '200',
    height: '40',
    lineColor: '#26B99A',
    fillColor: 'rgba(223, 223, 223, 0.57)',
    lineWidth: 2,
    spotColor: '#26B99A',
    minSpotColor: '#26B99A'
  });


  $(".sparkline11").sparkline([2, 4, 3, 4, 5, 4, 5, 4, 3, 4, 6, 2, 4, 3, 4, 5, 4, 5, 4, 3], {
    type: 'bar',
    height: '40',
    barWidth: 8,
    colorMap: {
      '7': '#a1a1a1'
    },
    barSpacing: 2,
    barColor: '#26B99A'
  });


  $(".sparkline22").sparkline([2, 4, 3, 4, 7, 5, 4, 3, 5, 6, 2, 4, 3, 4, 5, 4, 5, 4, 3, 4, 6], {
    type: 'line',
    height: '40',
    width: '200',
    lineColor: '#26B99A',
    fillColor: '#ffffff',
    lineWidth: 3,
    spotColor: '#34495E',
    minSpotColor: '#34495E'
  });


  $(".sparkline_bar").sparkline([2, 4, 3, 4, 5, 4, 5, 4, 3, 4, 5, 6, 4, 5, 6, 3, 5], {
    type: 'bar',
    colorMap: {
      '7': '#a1a1a1'
    },
    barColor: '#26B99A'
  });


  $(".sparkline_area").sparkline([5, 6, 7, 9, 9, 5, 3, 2, 2, 4, 6, 7], {
    type: 'line',
    lineColor: '#26B99A',
    fillColor: '#26B99A',
    spotColor: '#4578a0',
    minSpotColor: '#728fb2',
    maxSpotColor: '#6d93c4',
    highlightSpotColor: '#ef5179',
    highlightLineColor: '#8ba8bf',
    spotRadius: 2.5,
    width: 85
  });


  $(".sparkline_line").sparkline([2, 4, 3, 4, 5, 4, 5, 4, 3, 4, 5, 6, 4, 5, 6, 3, 5], {
    type: 'line',
    lineColor: '#26B99A',
    fillColor: '#ffffff',
    width: 85,
    spotColor: '#34495E',
    minSpotColor: '#34495E'
  });


  $(".sparkline_pie").sparkline([1, 1, 2, 1], {
    type: 'pie',
    sliceColors: ['#26B99A', '#ccc', '#75BCDD', '#D66DE2']
  });


  $(".sparkline_discreet").sparkline([4, 6, 7, 7, 4, 3, 2, 1, 4, 4, 2, 4, 3, 7, 8, 9, 7, 6, 4, 3], {
    type: 'discrete',
    barWidth: 3,
    lineColor: '#26B99A',
    width: '85',
  });


}
