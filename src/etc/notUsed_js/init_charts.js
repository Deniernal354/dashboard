function init_charts() {
  if( typeof (Chart) === 'undefined'){ return; }

  console.log('init_charts');
  var db_data = init_data();

  alert("Data is : "+db_data);

  var ctx; var chart_data;
  Chart.defaults.global.legend = {
    enabled: false
  };

  if ($('#canvas_line').length ){

    var canvas_line_00 = new Chart(document.getElementById("canvas_line"), {
      type: 'line',
      data: {
        labels: ["January", "February", "March", "April", "May", "June", "July"],
        datasets: [{
          label: "My First dataset",
          backgroundColor: "rgba(38, 185, 154, 0.31)",
          borderColor: "rgba(38, 185, 154, 0.7)",
          pointBorderColor: "rgba(38, 185, 154, 0.7)",
          pointBackgroundColor: "rgba(38, 185, 154, 0.7)",
          pointHoverBackgroundColor: "#fff",
          pointHoverBorderColor: "rgba(220,220,220,1)",
          pointBorderWidth: 1,
          data: [31, 74, 6, 39, 20, 85, 7]
        }, {
          label: "My Second dataset",
          backgroundColor: "rgba(3, 88, 106, 0.3)",
          borderColor: "rgba(3, 88, 106, 0.70)",
          pointBorderColor: "rgba(3, 88, 106, 0.70)",
          pointBackgroundColor: "rgba(3, 88, 106, 0.70)",
          pointHoverBackgroundColor: "#fff",
          pointHoverBorderColor: "rgba(151,187,205,1)",
          pointBorderWidth: 1,
          data: [82, 23, 66, 9, 99, 4, 2]
        }]
      },
    });

  }
  // Line chart
  //dashboard;
  if ($('#lineChart').length ){

    ctx = document.getElementById("lineChart");
    var lineChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ["January", "February", "March", "April", "May", "June", "July"],
        datasets: [{
          label: "My First",
          backgroundColor: "rgba(52, 152, 219, 0.31)",
          borderColor: "rgba(52, 152, 219, 0.7)",
          pointBorderColor: "rgba(52, 152, 219, 0.7)",
          pointBackgroundColor: "rgba(52, 152, 219, 0.7)",
          pointHoverBackgroundColor: "#fff",
          pointHoverBorderColor: "rgba(52, 152, 219, 1)",
          pointBorderWidth: 2,
          pointHitRadius : 5,
          data: [1, 11, 11, 11, 13, 13, 13]
        }, {
          label: "My Second",
          backgroundColor: "rgba(3, 88, 106, 0.3)",
          borderColor: "rgba(3, 88, 106, 0.70)",
          pointBorderColor: "rgba(3, 88, 106, 0.70)",
          pointBackgroundColor: "rgba(3, 88, 106, 0.70)",
          pointHoverBackgroundColor: "#fff",
          pointHoverBorderColor: "rgba(3, 88, 106, 1)",
          pointBorderWidth: 2,
          pointHitRadius : 5,
          data: [15, 15, 14, 18, 10, 13, 15]
        },{
          label: "My Third",
          backgroundColor: "rgba(155, 89, 182, 0.3)",
          borderColor: "rgba(155, 89, 182, 0.70)",
          pointBorderColor: "rgba(155, 89, 182, 0.70)",
          pointBackgroundColor: "rgba(155, 89, 182, 0.70)",
          pointHoverBackgroundColor: "#fff",
          pointHoverBorderColor: "rgba(155, 89, 182, 1)",
          pointBorderWidth: 2,
          pointHitRadius : 5,
          data: [20, 30, 17, 24, 5, 31, 10]
        }]
      },
    });

    //lineChart.data.datasets[0].data = ;
  }

  // Bar chart
  if ($('#mybarChart').length ){

    ctx = document.getElementById("mybarChart");
    var mybarChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ["January", "February", "March", "April", "May", "June", "July"],
        datasets: [{
          label: '# of Votes',
          backgroundColor: "#26B99A",
          data: [51, 30, 40, 28, 92, 50, 45]
        }, {
          label: '# of Votes',
          backgroundColor: "#03586A",
          data: [41, 56, 25, 48, 72, 34, 12]
        }]
      },

      options: {
        scales: {
          yAxes: [{
            ticks: {
              beginAtZero: true
            }
          }]
        }
      }
    });

  }


  // Doughnut chart

  if ($('#canvasDoughnut').length ){

    ctx = document.getElementById("canvasDoughnut");
    chart_data = {
      labels: [
        "Dark Grey",
        "Purple Color",
        "Gray Color",
        "Green Color",
        "Blue Color"
      ],
      datasets: [{
        data: [120, 50, 140, 180, 100],
        backgroundColor: [
          "#455C73",
          "#9B59B6",
          "#BDC3C7",
          "#26B99A",
          "#3498DB"
        ],
        hoverBackgroundColor: [
          "#34495E",
          "#B370CF",
          "#CFD4D8",
          "#36CAAB",
          "#49A9EA"
        ]

      }]
    };

    var canvasDoughnut = new Chart(ctx, {
      type: 'doughnut',
      tooltipFillColor: "rgba(51, 51, 51, 0.55)",
      data: chart_data
    });

  }

  // Radar chart

  if ($('#canvasRadar').length ){

    ctx = document.getElementById("canvasRadar");
    chart_data = {
      labels: ["Eating", "Drinking", "Sleeping", "Designing", "Coding", "Cycling", "Running"],
      datasets: [{
        label: "My First dataset",
        backgroundColor: "rgba(3, 88, 106, 0.2)",
        borderColor: "rgba(3, 88, 106, 0.80)",
        pointBorderColor: "rgba(3, 88, 106, 0.80)",
        pointBackgroundColor: "rgba(3, 88, 106, 0.80)",
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor: "rgba(220,220,220,1)",
        data: [65, 59, 90, 81, 56, 55, 40]
      }, {
        label: "My Second dataset",
        backgroundColor: "rgba(38, 185, 154, 0.2)",
        borderColor: "rgba(38, 185, 154, 0.85)",
        pointColor: "rgba(38, 185, 154, 0.85)",
        pointStrokeColor: "#fff",
        pointHighlightFill: "#fff",
        pointHighlightStroke: "rgba(151,187,205,1)",
        data: [28, 48, 40, 19, 96, 27, 100]
      }]
    };

    var canvasRadar = new Chart(ctx, {
      type: 'radar',
      data: chart_data,
    });

  }


  // Pie chart
  if ($('#pieChart').length ){

    ctx = document.getElementById("pieChart");
    chart_data = {
      datasets: [{
        data: [120, 50, 140, 180, 100],
        backgroundColor: [
          "#455C73",
          "#9B59B6",
          "#BDC3C7",
          "#26B99A",
          "#3498DB"
        ],
        label: 'My dataset' // for legend
      }],
      labels: [
        "Dark Gray",
        "Purple",
        "Gray",
        "Green",
        "Blue"
      ]
    };

    var pieChart = new Chart(ctx, {
      data: chart_data,
      type: 'pie',
      otpions: {
        legend: false
      }
    });

  }
}
