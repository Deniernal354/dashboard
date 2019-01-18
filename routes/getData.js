module.exports = function(pool, maxLabel) {
  const express = require("express");
  const router = express.Router();
  const teamConfig = require("../config/teamConfig.json");
  const platformConfig = require("../config/platformConfig.json");
  let moment = require("moment");

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

    //firstrows
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

    //secondrows
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
  }

  router.get("/getFailChartData", (req, res) => {
    let mainData = "select b.pj_id, pj.pj_name, pj.pj_author, sum(ifnull(m.pass, 0)) pass, sum(ifnull(m.fail, 0)) fail, sum(ifnull(m.skip, 0)) skip, min(ifnull(m.start_t, 0)) start_t, sec_to_time(sum(ifnull(m.duration, 0))) duration from (select pj_id, build_id, buildno, @rn := IF(@prev = pj_id, @rn + 1, 1) AS rn, @prev := pj_id FROM buildno inner join (select @prev := NULL, @rn := 0) as vars order by pj_id, build_id DESC, buildno DESC) b right join ( select pj_id, build_id, count(Case when result = 1 then 1 end) pass, count(Case when result = 2 then 1 end) fail, count(Case when result = 3 then 1 end) skip, Date_format(min(start_t), '%Y/%m/%d %H:%i:%s') start_t,  unix_timestamp(max(end_t)) -unix_timestamp(min(start_t)) as duration from method where start_t > '" + req.query.start + "' and start_t < '" + req.query.end + "' group by pj_id, build_id)  m on b.build_id = m.build_id inner join project pj on pj.pj_id = b.pj_id group by pj_id, b.build_id;";
    let startTime = moment(req.query.start, "YYYY/MM/DD HH:mm:ss");
    let endTime = moment(req.query.end, "YYYY/MM/DD HH:mm:ss");

    pool.query(mainData, (err, rows) => {
      const now = moment().format("YYYY.MM.DD HH:mm:ss");

      if (err) {
        console.error("Error in /getFailChartData\n" + now + ", " + err.code + "\n---");
        res.redirect("/500");
      } else {
        res.status(200).json(processFailChartData(rows, endTime.diff(startTime, "days"), endTime));
      }
    });
  });

  router.get("/getIndexData", (req, res) => {
    let firstQuery = "select pj_id, pj_team, pj_platform from project;";
    let secondQuery = "select b.pj_id, pj.pj_name, pj.pj_author, sum(ifnull(m.pass, 0)) pass, sum(ifnull(m.fail, 0)) fail, sum(ifnull(m.skip, 0)) skip, min(ifnull(m.start_t, 0)) start_t, sec_to_time(sum(ifnull(m.duration, 0))) duration from (select pj_id, build_id, buildno, @rn := IF(@prev = pj_id, @rn + 1, 1) AS rn, @prev := pj_id FROM buildno inner join (select @prev := NULL, @rn := 0) as vars order by pj_id, build_id DESC, buildno DESC) b right join ( select pj_id, build_id, count(Case when result = 1 then 1 end) pass, count(Case when result = 2 then 1 end) fail, count(Case when result = 3 then 1 end) skip, Date_format(min(start_t), '%Y/%m/%d %H:%i:%s') start_t,  unix_timestamp(max(end_t)) -unix_timestamp(min(start_t)) as duration from method where start_t > '" + moment().subtract(6, "days").format("YYYY/MM/DD") + "' and start_t < '" + moment().add(1, "days").format("YYYY/MM/DD") + "' group by pj_id, build_id)  m on b.build_id = m.build_id inner join project pj on pj.pj_id = b.pj_id group by pj_id, b.build_id;";

    pool.query(firstQuery, (err, firstrows) => {
      const now = moment().format("YYYY.MM.DD HH:mm:ss");

      if (err) {
        console.error("Error in /getIndexData, 1st\n" + now + ", " + err.code + "\n---");
        res.redirect("/500");
      } else {
        pool.query(secondQuery, (inerr, secondrows) => {
          if (inerr) {
            console.error("Error in /getIndexData, 2nd\n" + now + ", " + inerr.code + "\n---");
            res.redirect("/500");
          } else {
            res.status(200).json(processIndexData(firstrows, secondrows));
          }
        });
      }
    });
  });

  router.get("/getChartData/:page/:detail?", (req, res) => {
    let mainData = "select b.pj_id, b.build_id, b.buildno, sum(ifnull(m.pass, 0)) pass, sum(ifnull(m.fail, 0)) fail, sum(ifnull(m.skip, 0)) skip, min(ifnull(m.start_t, 0)) start_t, sec_to_time(sum(ifnull(m.duration, 0))) duration from (select pj_id, build_id, buildno, @rn := IF(@prev = pj_id, @rn + 1, 1) AS rn, @prev := pj_id FROM buildno inner join (select @prev := NULL, @rn := 0) as vars order by pj_id, build_id DESC, buildno DESC) b left join ( select pj_id, build_id, class_id, count(Case when result = 1 then 1 end) pass, count(Case when result = 2 then 1 end) fail,  count(Case when result = 3 then 1 end) skip, Date_format(min(start_t), '%Y/%m/%d %H:%i:%s') start_t,  unix_timestamp(max(end_t)) - unix_timestamp(min(start_t)) as duration from method group by pj_id, build_id, class_id) m on b.build_id = m.build_id inner join project pj on pj.pj_id = b.pj_id where b.rn <=" + maxLabel.getMaxLabel();

    // 기본값을 바꾸어서 가독성 향상시킬것. where 절만 덧붙이면됨.
    let labelData = "";
    let result = {};

    // All page data
    if (req.params.page === "all") {
      labelData = "select pj_name, pj_id, pj_link from project;";
    } else if (req.params.page === "team") {
      let teamname = teamConfig.name[req.params.detail];

      mainData = mainData + " and pj.pj_team = '" + teamname + "'";
      labelData = "select pj_name, pj_id, pj_link from project where pj_team = '" + teamname + "';";
    } else if (req.params.page === "platform") {
      mainData = mainData + " and pj.pj_platform = '" + req.params.detail + "'";
      labelData = "select pj_name, pj_id, pj_link from project where pj_platform = '" + req.params.detail + "';";
    } else {
      mainData = "";
    }
    mainData += " group by pj_id, build_id;";

    pool.query(mainData, (err, rows) => {
      const now = moment().format("YYYY.MM.DD HH:mm:ss");

      if (err) {
        console.error("Error in /getChartData, main\n" + now + ", " + err.code + "\n" + mainData + "\n---");
        res.redirect("/500");
      } else {
        result.data = rows;
        pool.query(labelData, (inerr, inrows) => {
          if (inerr) {
            console.error("Error in /getChartData, label\n" + now + ", " + inerr.code + "\n" + labelData + "\n---");
            res.redirect("/500");
          } else {
            result.pj_label = inrows;
            result.totalChartCount = inrows.length;
            result.maxLabel = maxLabel.getMaxLabel();
            res.status(200).json(result);
          }
        });
      }
    });
  });

  router.get("/getCustomData", (req, res) => {
    let mainData = "";

    if (req.query.un === "pj") {
      mainData = "select pj_id, pj_name, pj_team from project";
    } else if (req.query.un === "bu") {
      mainData = "select build_id, buildno from buildno where pj_id = " + req.query.vi + ";";
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
        console.error("Error in /getCustomData\n" + now + ", " + err.code + "\n" + mainData + "\n---");
        res.redirect("/500");
      } else {
        res.status(200).json(rows);
      }
    });
  });

  router.get("/getInitialModalData", (req, res) => {
    let mainData = "select b.pj_id, b.build_id, b.buildno, sum(ifnull(m.pass, 0)) pass, sum(ifnull(m.fail, 0)) fail, sum(ifnull(m.skip, 0)) skip, min(ifnull(m.start_t, 0)) start_t, sec_to_time(sum(ifnull(m.duration, 0))) duration from (select pj_id, build_id, buildno, @rn := IF(@prev = pj_id, @rn + 1, 1) AS rn, @prev := pj_id FROM buildno inner join (select @prev := NULL, @rn := 0) as vars order by pj_id, build_id DESC, buildno DESC) b left join ( select pj_id, build_id, class_id, count(Case when result = 1 then 1 end) pass, count(Case when result = 2 then 1 end) fail,  count(Case when result = 3 then 1 end) skip, Date_format(min(start_t), '%Y/%m/%d %H:%i:%s') start_t,  unix_timestamp(max(end_t)) - unix_timestamp(min(start_t)) as duration from method group by pj_id, build_id, class_id) m on b.build_id = m.build_id inner join project pj on pj.pj_id = b.pj_id where b.rn <= " + maxLabel.getAbsoluteMaxLabel() + " and pj.pj_id = " + req.query.pi + " group by pj_id, build_id;";
    let labelData = "select pj_name, pj_team, pj_platform, pj_author, pj_id, pj_link from project where pj_id = '" + req.query.pi + "';";
    let result = {};

    pool.query(mainData, (err, rows) => {
      const now = moment().format("YYYY.MM.DD HH:mm:ss");

      if (err) {
        console.error("Error in /getModalData, main\n" + now + ", " + err.code + "\n" + mainData + "\n---");
        res.redirect("/500");
      } else {
        result.data = rows;
        pool.query(labelData, (inerr, inrows) => {
          if (inerr) {
            console.error("Error in /getModalData, label\n" + now + ", " + inerr.code + "\n" + labelData + "\n---");
            res.redirect("/500");
          } else {
            result.pj_label = inrows;
            result.totalChartCount = inrows.length;
            result.maxLabel = maxLabel.getAbsoluteMaxLabel();
            res.status(200).json(result);
          }
        });
      }
    });
  });

  router.get("/getModalDataDetail", (req, res) => {
    let mainData = "select c.class_id, c.class_name, c.package_name, m.pass, m.fail, m.skip, m.start_t from class c inner join (select pj_id, build_id, class_id, count(Case when result = 1 then 1 end) pass, count(Case when result = 2 then 1 end) fail, count(Case when result = 3 then 1 end) skip, Date_format(min(start_t), '%Y/%m/%d %H:%i:%s') start_t, unix_timestamp(max(end_t)) - unix_timestamp(min(start_t)) as duration from method group by pj_id, build_id, class_id) m on m.class_id=c.class_id where c.pj_id=" + req.query.pi + " and c.build_id=" + req.query.bi + ";";
    let result = {};

    pool.query(mainData, (err, rows) => {
      const now = moment().format("YYYY.MM.DD HH:mm:ss");

      if (err) {
        console.error("Error in /getModalDataDetail\n" + now + ", " + err.code + "\n" + mainData + "\n---");
        res.redirect("/500");
      } else {
        result.data = rows;
        result.classcount = rows.length;
        res.status(200).json(result);
      }
    });
  });

  return router;
};
