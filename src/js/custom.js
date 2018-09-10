/* Resize function without multiple trigger
 * $(window).smartresize(function(){
 *     // code
 * });
 */

(function($, sr) {
// debouncing function from John Hann
// http://unscriptable.com/index.php/2009/03/20/debouncing-javascript-methods/
  var debounce = function(func, threshold, execAsap) {
    var timeout;

    return function debounced() {
      var obj = this;
      var args = arguments;
      function delayed() {
        if (!execAsap) {
          func.apply(obj, args);
        }
        timeout = null;
      }

      if (timeout) {
        clearTimeout(timeout);
      } else if (execAsap) {
        func.apply(obj, args);
      }
      timeout = setTimeout(delayed, threshold || 100);
    };
  };

  // Smartresize
  jQuery.fn[sr] = function(fn) {
    return fn ? this.bind("resize", debounce(fn)) : this.trigger(sr);
  };
})(jQuery, "smartresize");

/**
* To change this license header, choose License Headers in Project Properties.
* To change this template file, choose Tools | Templates and open the template in the editor.
*/

(function(){
  // NProgress
  if (typeof NProgress !== "undefined") {
    NProgress.start();
  }
})();

var CURRENT_URL = window.location.href.split("#")[0].split("?")[0];
var $BODY = $("body");
var $MENU_TOGGLE = $("#menu_toggle");
var $SIDEBAR_MENU = $("#sidebar-menu");
var $SIDEBAR_FOOTER = $(".sidebar-footer");
var $LEFT_COL = $(".left_col");
var $RIGHT_COL = $(".right_col");
var $NAV_MENU = $(".nav_menu");
var $FOOTER = $("footer");

// Menu components functions
function init_sidebar() {
  var setContentHeight = function() {
    // reset height
    $RIGHT_COL.css("min-height", $(window).height());

    var bodyHeight = $BODY.outerHeight();
    var footerHeight = $BODY.hasClass("footer_fixed") ? -10 : $FOOTER.height();
    var leftColHeight = $LEFT_COL.eq(1).height() + $SIDEBAR_FOOTER.height();
    var contentHeight = bodyHeight < leftColHeight ? leftColHeight : bodyHeight;

    // normalize content
    contentHeight -= $NAV_MENU.height() + footerHeight;

    $RIGHT_COL.css("min-height", contentHeight);
  };

  $SIDEBAR_MENU.find("a").on("click", function(ev) {
    // console.log("clicked - sidebar_menu");
    var $li = $(this).parent();

    if ($li.is(".active")) {
      $li.removeClass("active active-sm");
      $("ul:first", $li).slideUp(function() {
        setContentHeight();
      });
    } else {
      // prevent closing menu if we are on child menu
      if (!$li.parent().is(".child_menu")) {
        $SIDEBAR_MENU.find("li").removeClass("active active-sm");
        $SIDEBAR_MENU.find("li ul").slideUp();
      } else {
        if ($BODY.is(".nav-sm")) {
          $SIDEBAR_MENU.find("li").removeClass("active active-sm");
          $SIDEBAR_MENU.find("li ul").slideUp();
        }
      }
      $li.addClass("active");

      $("ul:first", $li).slideDown(function() {
        setContentHeight();
      });
    }
  });

  // toggle small or large menu
  $MENU_TOGGLE.on("click", function() {
    // console.log("clicked - menu toggle");

    if ($BODY.hasClass("nav-md")) {
      $SIDEBAR_MENU.find("li.active ul").hide();
      $SIDEBAR_MENU.find("li.active").addClass("active-sm").removeClass("active");
    } else {
      $SIDEBAR_MENU.find("li.active-sm ul").show();
      $SIDEBAR_MENU.find("li.active-sm").addClass("active").removeClass("active-sm");
    }

    $BODY.toggleClass("nav-md nav-sm");

    setContentHeight();

    $(".dataTable").each(function() {
      $(this).dataTable().fnDraw();
    });
  });

  // check active menu
  $SIDEBAR_MENU.find("a[href='" + CURRENT_URL + "']").parent("li").addClass("current-page");

  $SIDEBAR_MENU.find("a").filter(function() {
    return this.href == CURRENT_URL;
  }).parent("li").addClass("current-page").parents("ul").slideDown(function() {
    setContentHeight();
  }).parent().addClass("active");

  // recompute content when resizing
  $(window).smartresize(function() {
    setContentHeight();
  });

  setContentHeight();

  // fixed sidebar
  if ($.fn.mCustomScrollbar) {
    $(".menu_fixed").mCustomScrollbar({
      autoHideScrollbar: true,
      theme: "minimal",
      mouseWheel: {preventDefault: true}
    });
  }
}

// init Panel toolbox
function init_panel() {
  $(".collapse-link").on("click", function() {
    var $BOX_PANEL = $(this).closest(".x_panel");
    var $ICON = $(this).find("i");
    var $BOX_CONTENT = $BOX_PANEL.find(".x_content");

    // fix for some div with hardcoded fix class
    if ($BOX_PANEL.attr("style")) {
      $BOX_CONTENT.slideToggle(200, function() {
        $BOX_PANEL.removeAttr("style");
      });
    } else {
      $BOX_CONTENT.slideToggle(200);
      $BOX_PANEL.css("height", "auto");
    }

    $ICON.toggleClass("fa-chevron-up fa-chevron-down");
  });

  $(".close-link").click(function() {
    var $BOX_PANEL = $(this).closest(".x_panel");

    $BOX_PANEL.remove();
  });
}

// Tooltip
function init_tooltip() {
  $("[data-toggle='tooltip']").tooltip({
    container: "body"
  });
}

// Progressbar
function init_progressbar() {
  if ($(".progress .progress-bar")[0]) {
    $(".progress .progress-bar").progressbar();
  }
}
// ---- Menu component functions end

// initialize menu components
$(document).ready(function() {
  init_sidebar();
  init_panel();
  init_tooltip();
  init_progressbar();
});

// Custom functions
function urlByBrowser() {
  var agent = navigator.userAgent.toLowerCase();

  // IE Case
  if (agent.indexOf("msie") > -1 || agent.indexOf("trident" > -1)) {
    return document.URL;
  } else {
    return document.documentURI;
  }
}

function selectDataApi(category, params) {
  var apiResult = "";
  var url = urlByBrowser();
  url = url.substring(url.indexOf(":")+3);

  if (category === "chart") {
    apiResult = "/getChartData" + url.substring(url.indexOf("/"));
  } else if (category === "knob") {
    apiResult = "/admin/getKnobData/";
  } else if (category === "custom") {
    apiResult = "/getCustomData/" + params.unit + "/" + params.preValId;
  } else if(category === "modal") {
    apiResult = "/getModalData/" + params.pj_id + "/" + params.build_id;
  }
  return apiResult;
}

function processdata(responseText) {
  var labels = []; var chartData = []; var innerData = [];
  var pjIndex = [];

  // UI info - pj_name / pj_id / pj_link / build_id
  var pjLabel = [];
  var pjlink = [];  var buildTime = []; var duration = [];

  var totalChartCount = responseText.totalChartCount;
  pjLabel = responseText.pj_label.slice();

  for (var k = 0; k < totalChartCount; k++) {
    labels[k] = [];
    chartData[k] = [];
    chartData[k][0] = [];
    chartData[k][1] = [];
    chartData[k][2] = [];
    pjIndex[k] = responseText.pj_label[k].pj_id;
    pjlink[k] = responseText.pj_label[k].pj_link;
    buildTime[k] = [];
    buildTime[k][0] = []; // buildno
    buildTime[k][1] = []; // start_t
    duration[k] = []; // duration
    pjLabel[k].build_id = [];
  }

  responseText.data.forEach(function(value) {
    var idx = pjIndex.indexOf(value.pj_id);

    pjLabel[idx].build_id.push(value.build_id);

    if (!value.start_t) { value.start_t = "0"; }

    if (labels[idx].length < responseText.maxLabel) {
      if (value.start_t === "0"){
        labels[idx].push("Failed");
      } else {
        labels[idx].push(value.start_t.slice(5, 10));
      }
    }

    chartData[idx][0].push(value.pass);
    chartData[idx][1].push(value.fail);
    chartData[idx][2].push(value.skip);

    if (buildTime[idx][0]) {
      if (buildTime[idx][0] < value.buildno * 1) {
        buildTime[idx][0] = value.buildno;
        buildTime[idx][1] = (value.start_t === "0") ? "Build Failed" : value.start_t;
        duration[idx] = value.duration.slice(0, 2) + "h " + value.duration.slice(3, 5) + "m " + value.duration.slice(6, 8) + "s";
      }
    } else {
      buildTime[idx][0] = -1;
      buildTime[idx][1] = "1453/05/29 09:00:00";
    }
  });

  var pass = "rgba(102, 194, 255,";  var fail = "rgba(255, 115, 115,";  var skip = "rgba(130, 130, 130,";
  for (var h = 0; h < totalChartCount; h++) {
    innerData[h] = {
      labels: labels[h],
      datasets: [
        {
          label: "Fail",
          backgroundColor: fail+" 0.7)",
          borderColor: fail+" 0.7)",
          pointBorderColor: fail+" 0.7)",
          pointBackgroundColor: fail+" 0.7)",
          pointHoverBackgroundColor: "#fff",
          pointHoverBorderColor: fail+" 1)",
          data: chartData[h][1]
        }, {
          label: "Skip",
          backgroundColor: skip+" 0.7)",
          borderColor: skip+" 0.7)",
          pointBorderColor: skip+" 0.7)",
          pointBackgroundColor: skip+" 0.7)",
          pointHoverBackgroundColor: "#fff",
          pointHoverBorderColor: skip+" 1)",
          data: chartData[h][2]
        }, {
          label: "Pass",
          backgroundColor: pass+" 0.7)",
          borderColor: pass+" 0.7)",
          pointBorderColor: pass+" 0.7)",
          pointBackgroundColor: pass+" 0.7)",
          pointHoverBackgroundColor: "#fff",
          pointHoverBorderColor: pass+" 1)",
          data: chartData[h][0]
        }
      ]
    };
  }

  return {
    getInnerData: function() {
      return innerData;
    },
    getPjLabel: function() {
      return pjLabel;
    },
    getBuildTime: function() {
      return buildTime;
    },
    getDuration: function() {
      return duration;
    },
    getPjLink: function() {
      return pjlink;
    },
    getTotalChartCount: function() {
      return totalChartCount;
    }
  };
}// processdata end
// My functions end

/* KNOB */
function init_knob() {
  if (typeof ($.fn.knob) === "undefined") { return; }
  if (!document.getElementById("knobInput")) { return; }
  console.log("init_knob");

  var knobData = new XMLHttpRequest();
  var doc = document;

  doc.getElementById("labelSubmit").addEventListener("click", function() {
    doc.getElementById("newMaxLabel").value = doc.getElementById("newMaxLabel_text").innerText;
  });

  knobData.open("GET", selectDataApi("knob", null), true);
  knobData.send();
  knobData.addEventListener("load", function() {
    var result = JSON.parse(knobData.responseText);

    doc.getElementById("knobInput").value = result;
    doc.getElementById("MaxLabel_text").innerText = "현재 : " + result + "개";

    $(".knob").knob({
      "min": 1,
      "max": 20,
      "thickness": 0.2,
      "displayPrevious": true,
      "inputColor": "#34495E",
      "fgColor": "#34495E",
      change: function(value) {
        // console.log("change : " + value);
      },
      release: function(value) {
        // console.log(this.$.attr("value"));
        // console.log("release : " + value);
        doc.getElementById("newMaxLabel_text").innerText = "변경 : " + value + "개";
      },
      cancel: function() {
        console.log("cancel : ", this);
      },
      draw: function() {
        this.cursorExt = 0.3;

        // a = Arc, pa = Previous arc
        var a = this.arc(this.cv);
        var pa;
        var r = 1;

        this.g.lineWidth = this.lineWidth;

        if (this.o.displayPrevious) {
          pa = this.arc(this.v);
          this.g.beginPath();
          this.g.strokeStyle = this.pColor;
          this.g.arc(this.xy, this.xy, this.radius - this.lineWidth, pa.s, pa.e, pa.d);
          this.g.stroke();
        }

        this.g.beginPath();
        this.g.strokeStyle = r ? this.o.fgColor : this.fgColor;
        this.g.arc(this.xy, this.xy, this.radius - this.lineWidth, a.s, a.e, a.d);
        this.g.stroke();

        this.g.lineWidth = 2;
        this.g.beginPath();
        this.g.strokeStyle = this.o.fgColor;
        this.g.arc(this.xy, this.xy, this.radius - this.lineWidth + 1 + this.lineWidth * 2 / 3, 0, 2 * Math.PI, false);
        this.g.stroke();

        return false;
      }
    });
  }); // knobData listener end
}

/* SMART WIZARD */
function init_SmartWizard() {
  if (typeof ($.fn.smartWizard) === "undefined") { return; }
  console.log("init_SmartWizard");

  $("#wizard").smartWizard();

  $("#wizard_verticle").smartWizard({
    transitionEffect: "slide"
  });

  $(".buttonNext").addClass("btn btn-success");
  $(".buttonPrevious").addClass("btn btn-primary");
  // $(".buttonFinish").addClass("btn btn-default");
}

/* SELECT2 */
function init_select2() {
  if (!document.getElementById("select2Div0")) { return; }
  console.log("init_select2");

  var result = [[], [], [], []];
  var selectId = [];
  var doc = document;
  var divFrag = document.createDocumentFragment();

  // Select2 Custom Functions
  function eachSelect2GetData(idx) {
    return function() {
      //console.log(result);
      var previousValue = $("#select2_multiple" + idx).val();
      var selectedIndex = $("#select2_multiple" + idx)[0].selectedIndex;

      if ($.isEmptyObject(previousValue) || previousValue === "Project 명") {
        for (var q = 3; q > idx; q--) {
          $("#select2_multiple" + (q)).attr("disabled", true);
        }
        selectId.splice(idx);
      } else {
        var preValId;
        if (idx === 0) {
          preValId = result[0][selectedIndex-1].pj_id;
        } else if (idx === 1) {
          preValId = result[1][selectedIndex].build_id;
        } else if (idx === 2) {
          preValId = result[2][selectedIndex].class_id;
        } else {
          preValId = result[3][selectedIndex].method_id;
        }
        selectId[idx] = preValId;


        var unitPool = ["buildno", "class", "testcase"];

        if (idx >=0 && idx <=2) {
          var selectCustomData = new XMLHttpRequest();
          selectCustomData.open("GET", selectDataApi("custom", {
            "unit": unitPool[idx],
            "preValId": preValId
          }), true);
          selectCustomData.send();
          selectCustomData.addEventListener("load", function() {
            var divFragMini = document.createDocumentFragment();

            // Delete previous select info
            result[idx + 1] = [];
            $("#select2_multiple" + (idx + 1)).empty();

            // New
            result[idx + 1] = JSON.parse(selectCustomData.responseText);
            result[idx + 1].forEach(function(value) {
              var optionTmp = doc.createElement("option");
              if (value.buildno) {
                optionTmp.innerText = "(Build No." + value.buildno + ") ";
              } else if (value.class_name) {
                optionTmp.innerText = value.package_name + " / " + value.class_name;
              } else if (value.method_name) {
                optionTmp.innerText = value.method_name;
              }
              divFragMini.append(optionTmp);
            });
            $("#select2_multiple" + (idx + 1)).append(divFragMini);
          });
          $("#select2_multiple" + (idx + 1)).removeAttr("disabled");
        } // if (idx >=0 && idx <=2) End
      } // Null check else End
    };
  }

  function customSubmitBtnListener() {
    return function() {
      if ($("#select2_multiple0").val() === "Project 명") { return; }
      var divFrag = document.createDocumentFragment();
      var deleteData = new XMLHttpRequest();

      deleteData.open("POST", "/access/deleteData", true);
      deleteData.setRequestHeader("Content-type", "application/json");
      deleteData.onreadystatechange = function() {
        if (deleteData.status === 404) {
          window.location = "/404";
        } else if (deleteData.status === 500) {
          window.location = "/500";
        }
      };

      deleteData.send(JSON.stringify({ "selectId" : selectId }));
      deleteData.addEventListener("load", function() {
        var panel = doc.createElement("div");
        var title = doc.createElement("div");
        var h2 = doc.createElement("h2");
        var clearfix = doc.createElement("div");
        var content = doc.createElement("div");
        var resultDiv = doc.createElement("div");

        panel.setAttribute("class", "x_panel");
        title.setAttribute("class", "x_title");
        h2.innerText = "결과";
        h2.setAttribute("text-align", "center");
        clearfix.setAttribute("class", "clearfix");
        content.setAttribute("class", "x_content");
        resultDiv.setAttribute("id", "resultDiv");

        panel.appendChild(title);
        title.appendChild(h2);
        title.appendChild(clearfix);
        panel.appendChild(content);
        content.appendChild(resultDiv);
        resultDiv.innerHTML = deleteData.responseText;
        divFrag.appendChild(panel);
        document.getElementById("customSortDiv").appendChild(divFrag);
      });
    };
  }
  // Select2 Custom Functions End

  // draw select2
  for (var i = 0; i < 4; i++) {
    $("#select2_multiple" + i).select2({
      maximumSelectionLength: 2,
      placeholder: "이전 항목을 선택해주세요",
      containerCssClass: ":all:",
      allowClear: true,
      dropdownParent: $("#select2Div" + i)
    });
  }

  var tmp = doc.createElement("option");
  tmp.innerText = "Project 명";
  tmp.setAttribute("display", "none");
  divFrag.appendChild(tmp);

  var customInit = new XMLHttpRequest();

  customInit.onreadystatechange = function() {
    if (customInit.status === 404) {
      window.location = "/404";
    } else if (customInit.status === 500) {
      window.location = "/500";
    }
  };
  customInit.open("GET", selectDataApi("custom", {
    "unit": "project",
    "preValId": -1
  }), true);
  customInit.send();
  customInit.addEventListener("load", function() {
    result[0] = JSON.parse(customInit.responseText);
    result[0].forEach(function(value) {
      var optionTmp = doc.createElement("option");

      optionTmp.innerText = value.pj_name;
      divFrag.appendChild(optionTmp);
    });
    document.getElementById("select2_multiple0").appendChild(divFrag);
  });
  // Custom Page initialization complete

  // Add Event Listener to each select2, submitBtn
  for (var j = 0; j < 4; j++) {
    $("#select2_multiple" + j).on("change", eachSelect2GetData(j));
  }
  document.getElementById("customSubmitBtn").addEventListener("click", customSubmitBtnListener());
}

function init_modal(pj_id, build_id) {
  return function() {
    if (!document.getElementById("detailPage")) { return; }

    //document.getElementById("chartTitle").innerText = "pj_id : " + pj_id + ", build_id : " + build_id;

    var getModalData = new XMLHttpRequest();

    getModalData.onreadystatechange = function() {
      if (getModalData.status === 404) {
        window.location = "/404";
      } else if (getModalData.status === 500) {
        window.location = "/500";
      }
    };

    getModalData.open("GET", selectDataApi("modal", {
      "pj_id": pj_id,
      "build_id": build_id
    }), true);
    getModalData.send();
    getModalData.addEventListener("load", function() {
      var parsedResult = processdata(JSON.parse(getModalData.responseText));

      //console.log(parsedResult.getInnerData()[0]);

      var lineChart = new Chart(document.getElementById("lineChart_mo"), {
        type: "line",
        data: parsedResult.getInnerData()[0],
        options: {
          hover: {
            intersect: false
          },
          tooltips: {
            mode: "index",
            intersect: false,
            itemSort: function(a, b) {
              return b.datasetIndex - a.datasetIndex;
            }
          },
          scales: {
            yAxes: [{
              stacked: true
            }]
          },
          elements: {
            line: {
              tension: 0,
              borderWidth: 1
            },
            point: {
              radius: 0,
              borderWidth: 2,
              hitRadius: 20,
            }
          }
          /*animation: {
            duration: 0
          },
          hover: {
            animationDuration: 0
          },
          responsiveAnimationDuration: 0*/
        }
      });
    });
  };
}

function init_charts() {
  if (!document.getElementById("chartDiv")) { return; }
  if (typeof (Chart) === "undefined") { return; }

  console.log("init_charts");

  Chart.defaults.global.legend = false;

  var getChartData = new XMLHttpRequest();

  getChartData.onreadystatechange = function() {
    if (getChartData.status === 404) {
      window.location = "/404";
    } else if (getChartData.status === 500) {
      window.location = "/500";
    }
  };

  getChartData.open("GET", selectDataApi("chart", null), true);
  getChartData.send();
  getChartData.addEventListener("load", function() {
    var parsedResult = processdata(JSON.parse(getChartData.responseText));
    var chartloop = parsedResult.getTotalChartCount();
    var doc = document;

    for (var i = 0; i < chartloop; i++) {
      doc.getElementById("title"+i).innerText = parsedResult.getPjLabel()[i].pj_name;
      doc.getElementById("build"+i).innerText = "Last Build : No." + parsedResult.getBuildTime()[i][0] + " (" + parsedResult.getBuildTime()[i][1] + ")";
      doc.getElementById("duration"+i).innerText = "Duration : " + parsedResult.getDuration()[i];
      doc.getElementById("link"+i).setAttribute("href", parsedResult.getPjLink()[i]);
      // link.setAttribute("href", "http://10.12.45.150:8080/jenkins/view/" + result.pj_label[i].pj_name);
    }// Add DOM Fragment for Loop End

    function lineEventListener(lineChart, idx) {
      document.getElementById("lineChart"+i).addEventListener("click", function(evt) {
        var pointData = lineChart.getElementsAtEventForMode(evt, "index", {
          intersect: false
        });
        if (pointData.length != 0){
          $("#detailPage").modal("show");
          init_modal(parsedResult.getPjLabel()[idx].pj_id, parsedResult.getPjLabel()[idx].build_id[pointData[0]._index])();
          $("#detailPage").on("hidden.bs.modal", function () {
            document.getElementById("panel_mo").removeChild(document.getElementById("lineChart_mo"));
            var newChart = document.createElement("canvas");
            newChart.setAttribute("id", "lineChart_mo");
            newChart.setAttribute("height", "50%");
            document.getElementById("panel_mo").appendChild(newChart);
          });
        }
      });
    }

    for (i = 0; i < chartloop; i++) {
      var lineChartTarget = document.getElementById("lineChart"+i);
      var lineChart = new Chart(lineChartTarget, {
        type: "line",
        data: parsedResult.getInnerData()[i],
        options: {
          hover: {
            intersect: false
          },
          tooltips: {
            mode: "index",
            intersect: false,
            itemSort: function(a, b) {
              return b.datasetIndex - a.datasetIndex;
            }
          },
          scales: {
            yAxes: [{
              stacked: true
            }]
          },
          elements: {
            line: {
              tension: 0,
              borderWidth: 1
            },
            point: {
              radius: 0,
              borderWidth: 2,
              hitRadius: 20,
            }
          }
          /*animation: {
            duration: 0
          },
          hover: {
            animationDuration: 0
          },
          responsiveAnimationDuration: 0*/
        }
      });

      lineEventListener(lineChart, i);
    } // add chart forloop end
  }); // EventListener end
}

/* COMPOSE */
function init_compose() {
  if (typeof ($.fn.slideToggle) === "undefined") { return; }
  console.log("init_compose");

  $("#compose, .compose-close").click(function() {
    $(".compose").slideToggle();
  });
}

$(document).ready(function() {
  init_knob();
  init_SmartWizard();
  init_charts();
  init_select2();
  init_compose();
});

$(window).on("load", function(){
  NProgress.done();
});
