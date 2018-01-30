function init_chart_doughnut(){

  if( typeof (Chart) === 'undefined'){ return; }

  console.log('init_chart_doughnut');

  if ($('.canvasDoughnut').length){

    var chart_doughnut_settings = {
      type: 'doughnut',
      tooltipFillColor: "rgba(51, 51, 51, 0.55)",
      data: {
        labels: [
          "Symbian",
          "Blackberry",
          "Other",
          "Android",
          "IOS"
        ],
        datasets: [{
          data: [15, 20, 30, 10, 30],
          backgroundColor: [
            "#BDC3C7",
            "#9B59B6",
            "#E74C3C",
            "#26B99A",
            "#3498DB"
          ],
          hoverBackgroundColor: [
            "#CFD4D8",
            "#B370CF",
            "#E95E4F",
            "#36CAAB",
            "#49A9EA"
          ]
        }]
      },
      options: {
        legend: false,
        responsive: false
      }
    };

    $('.canvasDoughnut').each(function(){

      var chart_element = $(this);
      var chart_doughnut = new Chart( chart_element, chart_doughnut_settings);

    });

  }

}
