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

// First written by Ariel
// https://stackoverflow.com/questions/12274748/
function setAttributes(el, attrs) {
    for (var key in attrs) {
        el.setAttribute(key, attrs[key]);
    }
}

(function() {
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
            mouseWheel: {
                preventDefault: true
            }
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
// ---- Menu component functions end

// initialize menu components
$(document).ready(function() {
    init_sidebar();
    init_panel();
    init_tooltip();
});

// Custom functions
function commonXMLHttpRequest() {
    var xhttp = new XMLHttpRequest();

    xhttp.onreadystatechange = function(){
        if (xhttp.status === 500) {
            window.location = "/500";
        }
    };

    return xhttp;
}

function updateProjectDetail(labels, data, idx) {
    return function() {
        var divFrag = document.createDocumentFragment();
        var uiParent = document.getElementById("failProject");

        while (uiParent.hasChildNodes()) {
            uiParent.removeChild(uiParent.firstChild);
        }

        document.getElementById("failProjectTitle").innerText = "Project 상세 - " + labels[idx];
        for (var i = 0; i < data[0][idx]; i++) {
            var rawdata = data[1][idx][i];
            var li = document.createElement("li");
            var a1 = document.createElement("a");
            var itmp = document.createElement("i");

            li.setAttribute("class", "media event");
            a1.setAttribute("class", "pull-left border-pass profile_thumb");
            itmp.setAttribute("class", "fa fa-archive pass");
            a1.appendChild(itmp);
            li.appendChild(a1);

            var divtmp = document.createElement("div");
            divtmp.setAttribute("class", "media-body");
            var a2 = document.createElement("a");
            setAttributes(a2, {
                "id": "failTitle" + i,
                "class": "title",
            });
            a2.innerText = rawdata.pj_name;
            var p1 = document.createElement("p");
            var tmpTotal = rawdata.pass + rawdata.skip + rawdata.fail;
            var tmprate = Math.round(rawdata.fail / tmpTotal * 100).toFixed(1);
            p1.setAttribute("id", "failp" + i);
            p1.innerText = tmpTotal + "개 TC중 " + rawdata.fail + "개 TC Fail (" + tmprate + "%)";
            var p2 = document.createElement("p");
            var sm = document.createElement("small");
            sm.setAttribute("id", "failauthor" + i);
            sm.innerText = rawdata.pj_author;

            p2.appendChild(sm);
            divtmp.appendChild(a2);
            divtmp.appendChild(p1);
            divtmp.appendChild(p2);
            li.appendChild(divtmp);
            divFrag.appendChild(li);
        }
        document.getElementById("failProject").appendChild(divFrag);
    };
}

function init_failChart(parsedResult, diff, endDate) {
    if (!document.getElementById("failChart")) {
        return;
    }
    if (typeof(Chart) === "undefined") {
        return;
    }

    var labels = [];
    var data = [
        [],
        []
    ];

    for (var i = diff; i > -1; i--) {
        data[0][i] = 0;
        data[1][i] = [];
        labels.push(moment(endDate, "YYYY/MM/DD").subtract(i, "day").format("MM/DD"));
    }

    parsedResult.data.forEach(function(value) {
        if (value.failrate * 1 > 10.0) {
            data[0][labels.indexOf(value.start_t.slice(5, 10))]++;
            data[1][labels.indexOf(value.start_t.slice(5, 10))].push(value);
        }
    });

    var failChart = new Chart(document.getElementById("failChart"), {
        type: "bar",
        data: {
            labels: labels,
            datasets: [{
                label: "Project수",
                backgroundColor: "rgba(102, 194, 255, 0.7)",
                data: data[0]
            }]
        },
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            },
            legend: false
        }
    });

    updateProjectDetail(labels, data, diff)();

    document.getElementById("failChart").addEventListener("click", function(evt) {
        var pointData = failChart.getElementsAtEventForMode(evt, "index", {
            intersect: false
        });

        if (pointData.length != 0) {
            updateProjectDetail(labels, data, pointData[0]._index)();
        }
    });
}

function change_failChart(start, end) {
    document.getElementById("failChartDiv").removeChild(document.getElementById("failChart"));
    var newChart = document.createElement("canvas");
    newChart.setAttribute("id", "failChart");
    document.getElementById("failChartDiv").appendChild(newChart);

    var uiParent = document.getElementById("failProject");
    while (uiParent.hasChildNodes()) {
        uiParent.removeChild(uiParent.firstChild);
    }

    var getFailChartData = commonXMLHttpRequest();

    getFailChartData.open("GET", "/getData/getFailChartData?start=" + start + "&end=" + end, true);
    getFailChartData.send();
    getFailChartData.addEventListener("load", function() {
        var parsedResult = JSON.parse(getFailChartData.responseText);

        init_failChart(parsedResult, parsedResult.diff, parsedResult.end);
    });
}

function init_platformChart(parsedResult) {
    if (!document.getElementById("platformChartDiv")) {
        return;
    }
    if (typeof(Chart) === "undefined") {
        return;
    }

    for (var i = 0; i < 5; i++) {
        document.getElementById("plat_info" + i).innerHTML += "(" + parsedResult.platResult[2][i] + "%)";
    }

    var platformChart = new Chart(document.getElementById("platformChartDiv"), {
        type: "doughnut",
        data: {
            labels: ["PC Web", "PC App", "Mobile Web", "Mobile App", "API"],
            datasets: [{
                data: parsedResult.platResult[1],
                backgroundColor: [
                    "rgba(102, 194, 255, 0.7)",
                    "rgba(155, 89, 182, 0.7)",
                    "rgba(255, 115, 115, 0.7)",
                    "rgba(255, 236, 80, 0.7)",
                    "rgba(180, 238, 180, 0.7)"
                ],
                hoverBackgroundColor: [
                    "rgba(102, 194, 255, 1.0)",
                    "rgba(155, 89, 182, 1.0)",
                    "rgba(255, 115, 115, 1.0)",
                    "rgba(255, 236, 80, 1.0)",
                    "rgba(180, 238, 180, 1.0)"
                ],
                label: [
                    "PC Web", "PC App", "Mobile Web", "Mobile App", "API"
                ]
            }]
        },
        options: {
            legend: false,
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

function init_indexData() {
    console.log("init_indexData");
    var getIndexData = commonXMLHttpRequest();

    getIndexData.open("GET", "/getData/getIndexData", true);
    getIndexData.send();
    getIndexData.addEventListener("load", function() {
        var parsedResult = JSON.parse(getIndexData.responseText);
        var tmppass = parsedResult.data.reduce(function(acc, value, i, array) {
            return acc + value.passrate * 1;
        }, 0.0);

        document.getElementById("allCnt").innerText = parsedResult.allCnt;
        document.getElementById("todayCnt").innerText = parsedResult.todayCnt;
        if (parsedResult.data.length === 0) {
            document.getElementById("passCnt").innerText = "0.0%";
        } else {
            document.getElementById("passCnt").innerText = Math.round(tmppass / parsedResult.data.length).toFixed(1) + "%";
        }
        $("#todayProject").html(moment().format("YYYY.MM.DD") + " 기준");

        for (var i = 0; i < parsedResult.teamResult[0].length; i++) {
            document.getElementById("teamleft" + i).innerText = parsedResult.teamResult[0][i];
            document.getElementById("teamright" + i).innerText = parsedResult.teamResult[1][i] + " 개";
            setAttributes(document.getElementById("teamcenter" + i), {
                "aria-valuenow": parsedResult.teamResult[1][i],
                "aria-valuemax": parsedResult.allCnt,
                "style": "width: " + parsedResult.teamResult[2][i] + "%"
            });
        }
        init_platformChart(parsedResult);
        init_failChart(parsedResult, 6, moment().format("YYYY/MM/DD"));
    //init_duChart(parsedResult, 6, moment().format("YYYY/MM/DD"));
    });
}

/* COMPOSE */
function init_compose() {
    if (typeof($.fn.slideToggle) === "undefined") {
        return;
    }
    console.log("init_compose");

    $("#compose, .compose-close").click(function() {
        $(".compose").slideToggle();
    });
}

/* global moment */
function init_daterangepicker() {

    if (typeof($.fn.daterangepicker) === "undefined") {
        return;
    }
    console.log("init_daterangepicker");

    var cb = function(start, end, label) {
        $("#reportrange span").html(start.format("MMMM D, YYYY") + " - " + end.format("MMMM D, YYYY"));
    };

    var optionSet1 = {
        startDate: moment().subtract(29, "days"),
        endDate: moment(),
        minDate: "01/01/2017",
        maxDate: moment().add(1, "years"),
        showDropdowns: true,
        timePicker: false,
        timePickerIncrement: 1,
        ranges: {
            "Today": [moment(), moment()],
            "Yesterday": [moment().subtract(1, "days"), moment().subtract(1, "days")],
            "Last 7 Days": [moment().subtract(6, "days"), moment()],
            "Last 30 Days": [moment().subtract(29, "days"), moment()],
            "This Month": [moment().startOf("month"), moment().endOf("month")],
            "Last Month": [moment().subtract(1, "month").startOf("month"), moment().subtract(1, "month").endOf("month")]
        },
        opens: "left",
        buttonClasses: ["btn btn-default"],
        applyClass: "btn-small btn-primary",
        cancelClass: "btn-small",
        format: "MM/DD/YYYY",
        separator: " to ",
        locale: {
            applyLabel: "Submit",
            cancelLabel: "Clear",
            fromLabel: "From",
            toLabel: "To",
            customRangeLabel: "Custom",
            daysOfWeek: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
            monthNames: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
            firstDay: 1
        }
    };

    $("#reportrange span").html(moment().subtract(6, "days").format("MMMM D, YYYY") + " - " + moment().format("MMMM D, YYYY"));
    $("#reportrange").daterangepicker(optionSet1, cb);
    $("#reportrange").on("apply.daterangepicker", function(ev, picker) {
        change_failChart(picker.startDate.format("YYYY/MM/DD HH:mm:ss"), picker.endDate.format("YYYY/MM/DD HH:mm:ss"));
    });

    /*
  $("#reportrange").on("show.daterangepicker", function() {
    console.log("show event fired");
  });
  $("#reportrange").on("hide.daterangepicker", function() {
    console.log("hide event fired");
  });
  $("#reportrange").on("cancel.daterangepicker", function(ev, picker) {
    console.log("cancel event fired");
  });
  $("#options1").click(function() {
    $("#reportrange").data("daterangepicker").setOptions(optionSet1, cb);
  });
  $("#options2").click(function() {
    $("#reportrange").data("daterangepicker").setOptions(optionSet2, cb);
  });
  $("#destroy").click(function() {
    $("#reportrange").data("daterangepicker").remove();
  });*/
}

$(document).ready(function() {
    init_compose();
    init_indexData();
    init_daterangepicker();
});

$(window).on("load", function() {
    NProgress.done();
});
