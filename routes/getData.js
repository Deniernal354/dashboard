module.exports = function(pool, redisClient) {
    const express = require("express");
    const router = express.Router();
    const teamConfig = require("../config/teamConfig.json");
    const platformConfig = require("../config/platformConfig.json");
    let moment = require("moment");

    function processModalData(data, classcount) {
        // return values
        var nameData = [];
        var pieChartData = [];

        // temporary arrays for progressData
        var class_pass = [];
        var class_fail = [];
        var class_skip = [];
        var class_sum = [];
        var class_passr = [];
        var class_failr = [];
        var class_skipr = [];
        var build_pass = 0;
        var build_fail = 0;
        var build_skip = 0;
        var build_sum = 0;


        data.forEach(function(value) {
            var tmpsum = value.pass + value.fail + value.skip;

            class_pass.push(value.pass);
            class_fail.push(value.fail);
            class_skip.push(value.skip);
            class_passr.push(Math.round(value.pass / tmpsum * 100).toFixed(1));
            class_failr.push(Math.round(value.fail / tmpsum * 100).toFixed(1));
            class_skipr.push(Math.round(value.skip / tmpsum * 100).toFixed(1));
            class_sum.push(tmpsum);

            build_pass += value.pass;
            build_fail += value.fail;
            build_skip += value.skip;

            nameData.push([value.package_name, value.class_name]);
        });

        build_sum = build_pass + build_fail + build_skip;

        pieChartData = {
            labels: ["Fail", "Skip", "Pass"],
            datasets: [{
                data: [
                    Math.round(build_fail / build_sum * 100).toFixed(1),
                    Math.round(build_skip / build_sum * 100).toFixed(1),
                    Math.round(build_pass / build_sum * 100).toFixed(1)
                ],
                backgroundColor: [
                    "rgba(255, 115, 115, 0.7)",
                    "rgba(130, 130, 130, 0.7)",
                    "rgba(102, 194, 255, 0.7)"
                ],
                hoverBackgroundColor: [
                    "rgba(255, 115, 115, 1.0)",
                    "rgba(130, 130, 130, 1.0)",
                    "rgba(102, 194, 255, 1.0)"
                ],
                label: [
                    "Fail", "Skip", "Pass"
                ]
            }]
        };

        return {
            "buildTime": moment(data[0].start_t).format("YYYY/MM/DD HH:mm:ss"),
            "classCount": classcount,
            "nameData": nameData,
            "pieChartData": pieChartData,
            "progressData": {
                "pass": class_pass,
                "fail": class_fail,
                "skip": class_skip,
                "sum": class_sum,
                "passrate": class_passr,
                "failrate": class_failr,
                "skiprate": class_skipr
            }
        };
    } //processModalData end

    function processdata(rows, inrows, totalChartCount, maxLabelCount, isInitial) {
        var pfsColor = ["rgba(102, 194, 255,", "rgba(255, 115, 115,", "rgba(130, 130, 130,"];

        // return values
        var pjLabel = inrows.slice(); // UI info - pj_name / pj_id / pj_link / build_id
        var innerData = [];
        var buildTime = [];
        var duration = [];
        var pjlink = [];

        // temporary arrays for innerData
        var labels = [];
        var chartData = [];
        var pjIndex = [];
        var env = [];

        // initialModalData - pj_platform / pj_team / pj_author
        var initialModalData = [];

        if (totalChartCount && isInitial === 1) {
            var platformtmp = pjLabel[0].pj_platform;

            if (platformtmp === "pcWeb") {
                platformtmp = "PC Web";
            } else if (platformtmp === "pcApp") {
                platformtmp = "PC App";
            } else if (platformtmp === "mobileWeb") {
                platformtmp = "Mobile Web";
            } else if (platformtmp === "mobileApp") {
                platformtmp = "Mobile App";
            } else if (platformtmp === "API") {
                platformtmp = "API";
            } else {
                platformtmp = "Error";
            }
            initialModalData.push(platformtmp);
            initialModalData.push(pjLabel[0].pj_team);
            initialModalData.push(pjLabel[0].pj_author);
        }

        for (var k = 0; k < totalChartCount; k++) {
            labels[k] = [];
            env[k] = [];
            chartData[k] = [];
            chartData[k][0] = [];
            chartData[k][1] = [];
            chartData[k][2] = [];
            pjIndex[k] = pjLabel[k].pj_id;
            pjlink[k] = pjLabel[k].pj_link;
            buildTime[k] = [];
            buildTime[k][0] = []; // buildno
            buildTime[k][1] = []; // start_t
            duration[k] = [];
            pjLabel[k].build_id = [];
        }

        rows.forEach(function(value) {
            var idx = pjIndex.indexOf(value.pj_id);

            pjLabel[idx].build_id.push(value.build_id);

            if (!value.start_t) {
                value.start_t = "0";
            }

            if (labels[idx].length < maxLabelCount) {
                if (value.start_t === "0") {
                    labels[idx].push("Failed");
                } else {
                    labels[idx].push(value.start_t.slice(5, 10));
                }
                env[idx].push(value.buildenv);
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

        for (var h = 0; h < totalChartCount; h++) {
            innerData[h] = {
                labels: labels[h],
                datasets: [{
                    label: "Fail",
                    backgroundColor: pfsColor[1] + " 0.7)",
                    borderColor: pfsColor[1] + " 0.7)",
                    pointHoverBackgroundColor: "#fff",
                    pointHoverBorderColor: pfsColor[1] + " 1)",
                    data: chartData[h][1]
                }, {
                    label: "Skip",
                    backgroundColor: pfsColor[2] + " 0.7)",
                    borderColor: pfsColor[2] + " 0.7)",
                    pointHoverBackgroundColor: "#fff",
                    pointHoverBorderColor: pfsColor[2] + " 1)",
                    data: chartData[h][2]
                }, {
                    label: "Pass",
                    backgroundColor: pfsColor[0] + " 0.7)",
                    borderColor: pfsColor[0] + " 0.7)",
                    pointHoverBackgroundColor: "#fff",
                    pointHoverBorderColor: pfsColor[0] + " 1)",
                    data: chartData[h][0]
                }],
                tooltip: env[h]
            };
        }

        return {
            "totalChartCount": totalChartCount,
            "initialModalData": initialModalData,
            "innerData": innerData,
            "pjLabel": pjLabel,
            "buildTime": buildTime,
            "duration": duration,
            "pjLink": pjlink
        };
    } // processdata end

    function processFailChartData(rows, diff, endTime) {
        let result = {};
        let data = rows.slice();

        data.forEach(function(value) {
            value.passrate = Math.round(value.pass / (value.pass + value.skip + value.fail) * 100).toFixed(1);
            value.failrate = Math.round(value.fail / (value.pass + value.skip + value.fail) * 100).toFixed(1);
        });

        result.data = data;
        result.diff = diff;
        result.end = endTime;

        return result;
    }

    function processIndexData(firstrows, secondrows) {
        const now = moment().format("YYYY/MM/DD");
        let result = {};
        let teamResult = [
            [],
            [],
            []
        ];
        let platResult = [
            [],
            [],
            []
        ];
        let data = secondrows.slice();
        let todayCnt = 0;
        let prevProject = -1;

        // firstrows
        result.allCnt = firstrows.length;
        for (let i = 1; i < teamConfig.name.length; i++) {
            teamResult[0].push(teamConfig.name[i]);
            teamResult[1].push(0);
        }

        for (let i = 0; i < platformConfig.name.length; i++) {
            platResult[0].push(platformConfig.name[i]);
            platResult[1].push(0);
        }

        firstrows.forEach(function(value) {
            teamResult[1][teamResult[0].indexOf(value.pj_team)]++;
            platResult[1][platResult[0].indexOf(value.pj_platform)]++;
        });

        teamResult[1].forEach(function(value) {
            teamResult[2].push(Math.round(value / result.allCnt * 100).toFixed(1));
        });
        platResult[1].forEach(function(value) {
            platResult[2].push(Math.round(value / result.allCnt * 100).toFixed(1));
        });

        result.teamResult = teamResult;
        result.platResult = platResult;

        // secondrows
        data.forEach(function(value) {
            if (value.start_t.slice(0, 10) === now) {
                todayCnt++;
            }
            value.passrate = Math.round(value.pass / (value.pass + value.skip + value.fail) * 100).toFixed(1);
            value.failrate = Math.round(value.fail / (value.pass + value.skip + value.fail) * 100).toFixed(1);
        });

        result.todayCnt = todayCnt;
        result.data = data;

        return result;
    } // processIndexData end

    router.get("/getFailChartData", (req, res, next) => {
        let mainData = "select pj.pj_id, pj.pj_name, pj.pj_author, sum(ifnull(m.pass, 0)) pass, sum(ifnull(m.fail, 0)) fail, sum(ifnull(m.skip, 0)) skip, min(ifnull(m.start_t, 0)) start_t from project pj right join (select pj_id, build_id, count(Case when result = 1 then 1 end) pass, count(Case when result = 2 then 1 end) fail, count(Case when result = 3 then 1 end) skip, Date_format(min(start_t), '%Y/%m/%d %H:%i:%s') start_t from method where start_t > '" + req.query.start + "' and start_t < '" + req.query.end + "' group by pj_id, build_id) m on pj.pj_id = m.pj_id group by pj_id, build_id;";
        let startTime = moment(req.query.start, "YYYY/MM/DD HH:mm:ss");
        let endTime = moment(req.query.end, "YYYY/MM/DD HH:mm:ss");

        pool.query(mainData, (err, rows) => {
            const now = moment().format("YYYY.MM.DD HH:mm:ss");

            if (err) {
                return next(err);
            } else {
                res.status(200).json(processFailChartData(rows, endTime.diff(startTime, "days"), endTime));
            }
        });
    });

    router.get("/getIndexData", (req, res, next) => {
        let firstQuery = "select pj_id, pj_team, pj_platform from project;";
        let secondQuery = "select pj.pj_id, pj.pj_name, pj.pj_author, sum(ifnull(m.pass, 0)) pass, sum(ifnull(m.fail, 0)) fail, sum(ifnull(m.skip, 0)) skip, min(ifnull(m.start_t, 0)) start_t from project pj right join (select pj_id, build_id, count(Case when result = 1 then 1 end) pass, count(Case when result = 2 then 1 end) fail, count(Case when result = 3 then 1 end) skip, Date_format(min(start_t), '%Y/%m/%d %H:%i:%s') start_t from method where start_t > '" + moment().subtract(6, "days").format("YYYY/MM/DD") + "' and start_t < '" + moment().add(1, "days").format("YYYY/MM/DD") + "' group by pj_id, build_id) m on pj.pj_id = m.pj_id group by pj_id, build_id;";

        pool.query(firstQuery, (err, firstrows) => {
            const now = moment().format("YYYY.MM.DD HH:mm:ss");

            if (err) {
                return next(err);
            } else {
                pool.query(secondQuery, (inerr, secondrows) => {
                    if (inerr) {
                        return next(inerr);
                    } else {
                        res.status(200).json(processIndexData(firstrows, secondrows));
                    }
                });
            }
        });
    });

    router.get("/getChartData/:page/:detail?", (req, res, next) => {
        redisClient.get("maxLabel", (err, reply) => {
            const maxLabel = reply * 1;
            let labelData = "select pj_name, pj_id, pj_link from project";
            let mainData = "select b.pj_id, b.build_id, b.buildno, b.buildenv, ifnull(m.pass, 0) pass, ifnull(m.fail, 0) fail, ifnull(m.skip, 0) skip, min(ifnull(m.start_t, 0)) start_t, sec_to_time(ifnull(m.duration, 0)) duration from (select pj_id, build_id, buildno, buildenv FROM build where build_id in (select build_id from buildrank where rank<=" + maxLabel + ") order by pj_id, build_id DESC) b left join (select build_id, count(Case when result = 1 then 1 end) pass, count(Case when result = 2 then 1 end) fail, count(Case when result = 3 then 1 end) skip, Date_format(min(start_t), '%Y/%m/%d %H:%i:%s') start_t, unix_timestamp(max(end_t)) - unix_timestamp(min(start_t)) as duration from method where build_id in (select build_id from buildrank) group by build_id) m on b.build_id=m.build_id inner join project pj on pj.pj_id=b.pj_id";

            if (req.params.page === "team") {
                let teamname = teamConfig.name[req.params.detail];

                mainData = mainData + " and pj.pj_team = '" + teamname + "'";
                labelData += " where pj_team = '" + teamname + "';";
            } else if (req.params.page === "platform") {
                mainData = mainData + " and pj.pj_platform = '" + req.params.detail + "'";
                labelData += " where pj_platform = '" + req.params.detail + "';";
            }
            mainData += " group by pj_id, build_id;";

            pool.query(mainData, (err, rows) => {
                const now = moment().format("YYYY.MM.DD HH:mm:ss");

                if (err) {
                    return next(err);
                } else {
                    pool.query(labelData, (inerr, inrows) => {
                        if (inerr) {
                            return next(inerr);
                        } else {
                            res.header("Cache-Control", "no-cache, private, no-store, must-revalidate");
                            res.status(200).json(processdata(rows, inrows, inrows.length, maxLabel, 0));
                        }
                    });
                }
            });
        });
    });

    router.get("/getCustomData", (req, res, next) => {
        let teamname = teamConfig.name[req.user.idx] ? teamConfig.name[req.user.idx] : "SQA";
        let mainData = "";

        if (req.query.un === "pj") {
            mainData = "select pj_id, pj_name, pj_team from project";
            if (teamname === "SQA") {
                mainData += ";";
            } else {
                mainData += " where pj_team = '" + teamname + "';";
            }
        } else if (req.query.un === "bu") {
            mainData = "select build_id, buildno, buildenv from build where pj_id = " + req.query.vi + ";";
        } else if (req.query.un === "cl") {
            mainData = "select class_id, package_name, class_name from class where build_id = " + req.query.vi + ";";
        } else if (req.query.un === "te") {
            mainData = "select method_id, method_name from method where class_id = " + req.query.vi + ";";
        } else {
            mainData = "";
        }

        pool.query(mainData, (err, rows) => {
            const now = moment().format("YYYY.MM.DD HH:mm:ss");

            if (err) {
                return next(err);
            } else {
                res.status(200).json(rows);
            }
        });
    });

    router.get("/getInitialModalData", (req, res, next) => {
        redisClient.get("abmaxLabel", (err, reply) => {
            const abmaxLabel = reply * 1;
            let labelData = "select pj_name, pj_team, pj_platform, pj_author, pj_id, pj_link from project where pj_id = '" + req.query.pi + "';";
            let mainData = "select b.pj_id, b.build_id, b.buildno, b.buildenv, ifnull(m.pass, 0) pass, ifnull(m.fail, 0) fail, ifnull(m.skip, 0) skip, min(ifnull(m.start_t, 0)) start_t, sec_to_time(ifnull(m.duration, 0)) duration from (select pj_id, build_id, buildno, buildenv FROM build where build_id in (select build_id from buildrank where rank<=" + abmaxLabel + " and pj_id = " + req.query.pi + ") order by pj_id, build_id DESC) b left join (select build_id, count(Case when result = 1 then 1 end) pass, count(Case when result = 2 then 1 end) fail, count(Case when result = 3 then 1 end) skip, Date_format(min(start_t), '%Y/%m/%d %H:%i:%s') start_t, unix_timestamp(max(end_t)) - unix_timestamp(min(start_t)) as duration from method where build_id in (select build_id from buildrank where pj_id=" + req.query.pi + ") group by build_id) m on b.build_id=m.build_id inner join project pj on pj.pj_id= b.pj_id group by pj_id, build_id;";

            pool.query(mainData, (err, rows) => {
                const now = moment().format("YYYY.MM.DD HH:mm:ss");

                if (err) {
                    return next(err);
                } else {
                    pool.query(labelData, (inerr, inrows) => {
                        if (inerr) {
                            return next(inerr);
                        } else {
                            res.header("Cache-Control", "no-cache, private, no-store, must-revalidate");
                            res.status(200).json(processdata(rows, inrows, inrows.length, abmaxLabel, 1));
                        }
                    });
                }
            });
        });
    });

    router.get("/getModalDataDetail", (req, res, next) => {
        let mainData = "select c.class_id, c.class_name, c.package_name, count(Case when m.result = 1 then 1 end) pass, count(Case when m.result = 2 then 1 end) fail, count(Case when m.result = 3 then 1 end) skip, min(m.start_t) start_t from class c inner join method m on m.class_id=c.class_id and m.pj_id=" + req.query.pi + " and c.build_id=" + req.query.bi + " group by class_id;";

        pool.query(mainData, (err, rows) => {
            const now = moment().format("YYYY.MM.DD HH:mm:ss");

            if (err) {
                return next(err);
            } else {
                if (rows.length === 0) {
                    res.status(200).json({
                        "classCount": 0
                    });
                } else {
                    res.status(200).json(processModalData(rows, rows.length));
                }
            }
        });
    });

    return router;
};
