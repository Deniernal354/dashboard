function init_chartCanvas(){
  if( !document.getElementById("chartDiv") ){ return; }

  var chart_data = new XMLHttpRequest();

  chart_data.onreadystatechange = function(){
    if(chart_data.status == 404){
      window.location = "/404";
    }
    else if(chart_data.status == 500){
      window.location = "/500";
    }
  };

  chart_data.open('GET', selectDataApi(urlByBrowser(), "chart"), true);
  chart_data.send();
  chart_data.addEventListener('load', function(){
    var result = JSON.parse(chart_data.responseText);
    var doc = document;
    var divFrag = document.createDocumentFragment();
    //console.log(result);
    for(var i=0;i<result.totalChartCount;i++){
      var div = doc.createElement("div");
      var panel = doc.createElement("div");
      var title = doc.createElement("div");
      var h3 = doc.createElement("h3");
      var clearfix = doc.createElement("div");
      var content = doc.createElement("div");
      var canvas = doc.createElement("canvas");
      var build = doc.createElement("div");
      var duration = doc.createElement("div");
      var moreinfo = doc.createElement("div");
      var h4_b = doc.createElement("h4");
      var h4_d = doc.createElement("h4");
      var h4_m = doc.createElement("h4");
      var link = doc.createElement("a");

      div.setAttribute("class", "col-lg-3 col-md-6 col-sm-6 col-xs-12");
      panel.setAttribute("class", "x_panel");
      title.setAttribute("class", "x_title");
      h3.innerText = result.pj_label[i].pj_name;
      clearfix.setAttribute("class", "clearfix");
      content.setAttribute("class", "x_content");
      canvas.setAttribute("id", "lineChart"+i);
      h4_b.setAttribute("id", "h4_b"+i);
      h4_d.setAttribute("id", "h4_d"+i);
      h4_m.setAttribute("id", "h4_m"+i);
      h4_b.innerText = "Last Build : ";
      h4_d.innerText = "Duration : ";
      h4_m.innerText = "More Info : ";
      link.setAttribute("target", "_blank");
      link.setAttribute("href", "http://10.12.45.150:8080/jenkins/view/NT1_%EB%B8%94%EB%A1%9C%EA%B7%B8_SE2_PC%EC%9B%B9_Real/");
      //link.setAttribute("href", "http://10.12.45.150:8080/jenkins/view/" + result.pj_label[i].pj_name);
      link.innerText = "Report Link";

      div.appendChild(panel);
      panel.appendChild(title);
      title.appendChild(h3);
      title.appendChild(clearfix);
      panel.appendChild(content);
      content.appendChild(canvas);
      content.appendChild(build);
      content.appendChild(duration);
      content.appendChild(moreinfo);
      build.appendChild(h4_b);
      duration.appendChild(h4_d);
      moreinfo.appendChild(h4_m);
      h4_m.appendChild(link);

      divFrag.appendChild(div);
    }
    document.getElementById("chartDiv").appendChild(divFrag);
    init_charts(result);
  });
}

function init_charts(result) {
  if( typeof (Chart) === 'undefined'){ return; }
  //if( !document.getElementById("lineChart0") ){ return; }

  console.log('init_charts');

  var labels = []; var chart_data = []; var pj_index = [];
  var buildTime = []; var duration = [];

  Chart.defaults.global.legend = {
    enabled: false
  };

  for(var k=0;k<result.totalChartCount;k++){
    labels[k] = [];
    chart_data[k] = [];
    chart_data[k][0] = [];
    chart_data[k][1] = [];
    chart_data[k][2] = [];
    pj_index[k] = result.pj_label[k].pj_id;
    buildTime[k] = [];
    buildTime[k][0] = [];//buildno
    buildTime[k][1] = [];//start_t
    duration[k] = [];//duration
  }

  result.data.forEach(function(value){
    var idx = pj_index.indexOf(value.pj_id);

    if(!value.start_t){ value.start_t = '0'; }
    if(labels[idx].length < result.maxLabel){
      labels[idx].push(value.start_t.slice(5, 10));
    }
    chart_data[idx][0].push(value.pass);
    chart_data[idx][1].push(value.fail);
    chart_data[idx][2].push(value.skip);
    if(buildTime[idx][0]){
      if(buildTime[idx][0] < value.buildno*1){
        buildTime[idx][0] = value.buildno;
        buildTime[idx][1] = value.start_t;
        duration[idx] = value.duration.slice(0,2)+"h "+value.duration.slice(3,5)+"m "+value.duration.slice(6,8)+"s";
      }
    }
    else{
      buildTime[idx][0] = -1;
      buildTime[idx][1] = "1453/05/29 09:00:00";
    }
  });

  if ($('#lineChart0').length ){
    for(var i=0;i<result.totalChartCount;i++){
      document.getElementById("h4_b"+i).innerText += " No."+buildTime[i][0]+" ("+buildTime[i][1]+")";
      document.getElementById("h4_d"+i).innerText += " "+duration[i];
      //Extern Report, HTML Report 구분 필요
      //document.getElementById("h4_m"+i).innerText += " "+reportLink[i];

      var ctx = document.getElementById("lineChart"+i).getContext("2d");
      var innerData = {
        labels: labels[i],
        datasets: [{
          label: "Pass",
          backgroundColor: "rgba(52, 152, 219, 0.31)",
          borderColor: "rgba(52, 152, 219, 0.7)",
          pointBorderColor: "rgba(52, 152, 219, 0.7)",
          pointBackgroundColor: "rgba(52, 152, 219, 0.7)",
          pointHoverBackgroundColor: "#fff",
          pointHoverBorderColor: "rgba(52, 152, 219, 1)",
          pointBorderWidth: 2,
          pointHitRadius : 50,
          data: chart_data[i][0]
        }, {
          label: "Fail",
          backgroundColor: "rgba(3, 88, 106, 0.3)",
          borderColor: "rgba(3, 88, 106, 0.70)",
          pointBorderColor: "rgba(3, 88, 106, 0.70)",
          pointBackgroundColor: "rgba(3, 88, 106, 0.70)",
          pointHoverBackgroundColor: "#fff",
          pointHoverBorderColor: "rgba(3, 88, 106, 1)",
          pointBorderWidth: 2,
          pointHitRadius : 50,
          data: chart_data[i][1]
        },{
          label: "Skip",
          backgroundColor: "rgba(155, 89, 182, 0.3)",
          borderColor: "rgba(155, 89, 182, 0.70)",
          pointBorderColor: "rgba(155, 89, 182, 0.70)",
          pointBackgroundColor: "rgba(155, 89, 182, 0.70)",
          pointHoverBackgroundColor: "#fff",
          pointHoverBorderColor: "rgba(155, 89, 182, 1)",
          pointBorderWidth: 2,
          pointHitRadius : 50,
          data: chart_data[i][2]
        }]
      };

      var lineChart = new Chart(ctx, {
        type : 'line',
        data : innerData,
        options : {
          tooltips : {
            mode : 'label',
            intersect : true
          }
          /*animation : {
            duration : 0
          },
          hover : {
            animationDuration : 0
          },
          responsiveAnimationDuration : 0,
          elements : {
            line : {
              tension : 0
            }
          }Improve Chart performance options */
        }
      });
    } //for end
  } //if end
}
