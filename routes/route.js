/*
get/post 터널링 조심(get은 get만, post는 post만) http://myweb/users?method=update&id=terry
res.download()	다운로드될 파일을 전송한다.
res.sendFile()	파일을 옥텟 스트림의 형태로 전송한다.(content-type의 application 형식 미지정Case)
*/
module.exports = function(app, pool, maxLabel) {
  const express = require("express");
  const router = express.Router();
  const { param, validationResult } = require("express-validator/check");

  router.get("/", (req, res) => {
    res.redirect("/index");
  });
  router.get("/index.html", (req, res) => {
    res.redirect("/index");
  });
  router.get("/index", (req, res) => {
    pool.query("select pj_id from project", (err, rows) => {
      const now = new Date();

      if (err) {
        console.error("---Error : /indexCnt " + err.code + "\n---Error Time : " + now);
        res.redirect("/500");
      } else {
        res.status(200).render("index.ejs", {
          cnt: rows.length
        });
      }
    });
  });

  router.get("/team/:teamNo", [
    param("teamNo").exists().matches(/^[1-5]{1}$/)
  ], (req, res) => {
    const err = validationResult(req);

    if(!err.isEmpty()){
      return res.redirect("/404");
    }
    if (req.params.teamNo <= 5 && req.params.teamNo >= 1) {
      let title_left = "네이버테스트 " + req.params.teamNo + "팀";
      let teamname = "NT" + req.params.teamNo;

      if (req.params.teamNo == 5) {
        title_left = "라인테스트팀";
        teamname = "LT";
      }

      pool.query("select pj_id from project where pj_team = '" + teamname + "';", (err, rows) => {
        const now = new Date();

        if (err) {
          console.error("---Error : /teamCnt " + err.code + "\n---Error Time : " + now);
          res.redirect("/500");
        } else {
          res.status(200).render("team", {
            title : title_left,
            cnt: rows.length
          });
        }
      });
    }
  });

  router.get("/platform/:category", [
    param("category").exists().matches(/^(pcWeb|mobileWeb|mobileApp)$/)
  ], (req, res) => {
    const err = validationResult(req);

    if(!err.isEmpty()){
      return res.redirect("/404");
    }

    let title_left = "PC Web 환경";

    if (req.params.category === "mobileApp") {
      title_left = "Mobile App 환경";
    } else if (req.params.category === "mobileWeb") {
      title_left = "Mobile Web 환경";
    }

    pool.query("select pj_id from project where pj_platform = '" + req.params.category + "';", (err, rows) => {
      const now = new Date();

      if (err) {
        console.error("---Error : /platfromCnt " + err.code + "\n---Error Time : " + now);
        res.redirect("/500");
      } else {
        res.status(200).render("platform", {
          title : title_left,
          cnt: rows.length
        });
      }
    });
  });

  router.get("/getChartData/:page/:detail?", (req, res) => {
    let queryText = "select b.pj_id, b.build_id, b.buildno, sum(ifnull(m.pass, 0)) pass, sum(ifnull(m.fail, 0)) fail, sum(ifnull(m.skip, 0)) skip, min(ifnull(m.start_t, 0)) start_t, sec_to_time(sum(ifnull(m.duration, 0))) duration from (select pj_id, build_id, buildno, @rn := IF(@prev = pj_id, @rn + 1, 1) AS rn, @prev := pj_id FROM buildno inner join (select @prev := NULL, @rn := 0) as vars order by pj_id, build_id DESC, buildno DESC) b left join ( select pj_id, build_id, class_id, count(Case when result = 1 then 1 end) pass, count(Case when result = 2 then 1 end) fail,  count(Case when result = 3 then 1 end) skip, Date_format(min(start_t), '%Y/%m/%d %H:%i:%s') start_t,  unix_timestamp(max(end_t)) - unix_timestamp(min(start_t)) as duration from method group by pj_id, build_id, class_id) m on b.build_id = m.build_id inner join project pj on pj.pj_id = b.pj_id where b.rn <=" + maxLabel.getMaxLabel();
    let queryTextLabel = "";
    const result = {};

    // index page data
    if (req.params.page === "index") {
      queryTextLabel = "select pj_name, pj_id, pj_link from project;";
    } else if (req.params.page === "team") {
      let teamname = "NT" + req.params.detail;

      if (req.params.detail === "5") { teamname = "LT"; }
      queryText = queryText + " and pj.pj_team = '" + teamname + "'";
      queryTextLabel = "select pj_name, pj_id, pj_link from project where pj_team = '" + teamname + "';";
    } else if (req.params.page === "platform") {
      queryText = queryText + " and pj.pj_platform = '" + req.params.detail + "'";
      queryTextLabel = "select pj_name, pj_id, pj_link from project where pj_platform = '" + req.params.detail + "';";
    } else {
      queryText = "";
    }
    queryText += " group by pj_id, build_id;";

    pool.query(queryText, (err, rows) => {
      const now = new Date();

      if (err) {
        console.error("---Error : /getChartData " + err.code + "\n---Error Time : " + now + "\n---Error query : " + queryText);
        res.redirect("/500");
      } else {
        result.data = rows;
        pool.query(queryTextLabel, (innererr, innerrows) => {
          if (innererr) {
            console.error("---Error : /getChartData " + innererr.code + "\n---Error Time : " + now + "\n---Error query : " + queryTextLabel);
            res.redirect("/500");
          } else {
            result.pj_label = innerrows;
            result.totalChartCount = innerrows.length;
            result.maxLabel = maxLabel.getMaxLabel();
            res.status(200).json(result);
          }
        });
      }
    });
  });

  router.get("/customSort", (req, res) => {
    res.status(200).render("customSort");
  });

  router.get("/getCustomData/:category/:previousValue?", (req, res) => {
    let queryText = "";

    if (req.params.category === "project") {
      queryText = "select pj_id, pj_name, pj_team from project";
    } else if (req.params.category === "buildno") {
      queryText = "select build_id, buildno from buildno where pj_id = " + req.params.previousValue + ";";
    } else if (req.params.category === "class") {
      queryText = "select class_id, package_name, class_name from class where build_id = " + req.params.previousValue + ";";
    } else if (req.params.category === "testcase") {
      queryText = "select method_id, method_name from method where class_id = " + req.params.previousValue + ";";
    } else {
      queryText = "";
    }

    pool.query(queryText, (err, rows) => {
      const now = new Date();

      if (err) {
        console.error("---Error : /getCustomData " + err.code + "\n---Error Time : " + now + "\n---Error query : " + queryText);
        res.redirect("/500");
      } else {
        res.status(200).json(rows);
      }
    });
  });

  router.get("/getModalData/:pj_id/:build_id", (req, res) => {
    let queryText = "select b.pj_id, b.build_id, b.buildno, sum(ifnull(m.pass, 0)) pass, sum(ifnull(m.fail, 0)) fail, sum(ifnull(m.skip, 0)) skip, min(ifnull(m.start_t, 0)) start_t, sec_to_time(sum(ifnull(m.duration, 0))) duration from (select pj_id, build_id, buildno, @rn := IF(@prev = pj_id, @rn + 1, 1) AS rn, @prev := pj_id FROM buildno inner join (select @prev := NULL, @rn := 0) as vars order by pj_id, build_id DESC, buildno DESC) b left join ( select pj_id, build_id, class_id, count(Case when result = 1 then 1 end) pass, count(Case when result = 2 then 1 end) fail,  count(Case when result = 3 then 1 end) skip, Date_format(min(start_t), '%Y/%m/%d %H:%i:%s') start_t,  unix_timestamp(max(end_t)) - unix_timestamp(min(start_t)) as duration from method group by pj_id, build_id, class_id) m on b.build_id = m.build_id inner join project pj on pj.pj_id = b.pj_id where b.rn <= " + maxLabel.getAbsoluteMaxLabel() + " and pj.pj_id = " + req.params.pj_id + " group by pj_id, build_id;";
    let queryTextLabel = "select pj_name, pj_id, pj_link from project where pj_id = '" + req.params.pj_id + "';";
    const result = {};

    pool.query(queryText, (err, rows) => {
      const now = new Date();

      if (err) {
        console.error("---Error : /getModalData " + err.code + "\n---Error Time : " + now + "\n---Error query : " + queryText);
        res.redirect("/500");
      } else {
        result.data = rows;
        pool.query(queryTextLabel, (innererr, innerrows) => {
          if (innererr) {
            console.error("---Error : /getModalData " + innererr.code + "\n---Error Time : " + now + "\n---Error query : " + queryTextLabel);
            res.redirect("/500");
          } else {
            result.pj_label = innerrows;
            result.totalChartCount = innerrows.length;
            result.maxLabel = maxLabel.getAbsoluteMaxLabel();
            res.status(200).json(result);
          }
        });
      }
    });
  });

  router.get("/guide", (req, res) => {
    res.status(200).render("guide");
  });

  router.get("/500", (req, res) => {
    res.status(500).render("page_500");
  });

  router.use("/404", (req, res) => {
    res.status(404).render("page_404");
  });
  return router;
};
