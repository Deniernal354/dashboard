/*
get/post 터널링 조심(get은 get만, post는 post만) http://myweb/users?method=update&id=terry
res.download()	다운로드될 파일을 전송한다.
res.sendFile()	파일을 옥텟 스트림의 형태로 전송한다.(content-type의 application 형식 미지정Case)
*/
module.exports = function(pool) {
  const express = require("express");
  const router = express.Router();
  const teamConfig = require("../config/teamConfig.json");
  const {
    param,
    validationResult
  } = require("express-validator/check");
  let moment = require("moment");

  router.get("/", (req, res) => {
    res.redirect("/index");
  });
  router.get("/index.html", (req, res) => {
    res.redirect("/index");
  });
  router.get("/index", (req, res) => {
    res.status(200).render("index.ejs", {
      cnt: teamConfig.name.length - 1
    });
  });

  router.get("/all", (req, res) => {
    pool.query("select pj_id from project", (err, rows) => {
      const now = moment().format("YYYY.MM.DD HH:mm:ss");

      if (err) {
        console.error("Error in /all\n" + now + ", " + err.code + "\n---");
        res.redirect("/500");
      } else {
        res.status(200).render("all.ejs", {
          cnt: rows.length
        });
      }
    });
  });

  router.get("/team/:teamNo", [
    param("teamNo").exists().matches(/^[1-6]{1}$/)
  ], (req, res) => {
    const err = validationResult(req);

    if (!err.isEmpty()) {
      return res.redirect("/404");
    }

    let teamName = teamConfig.name[req.params.teamNo];

    pool.query("select pj_id from project where pj_team = '" + teamName + "';", (err, rows) => {
      const now = moment().format("YYYY.MM.DD HH:mm:ss");

      if (err) {
        console.error("Error in /team\n" + now + ", " + err.code + "\n---");
        res.redirect("/500");
      } else {
        res.status(200).render("team", {
          title: teamName,
          cnt: rows.length
        });
      }
    });
  });

  router.get("/platform/:category", [
    param("category").exists().matches(/^(pcWeb|mobileWeb|mobileApp)$/)
  ], (req, res) => {
    const err = validationResult(req);

    if (!err.isEmpty()) {
      return res.redirect("/404");
    }

    let title_left = "PC Web 환경";

    if (req.params.category === "mobileApp") {
      title_left = "Mobile App 환경";
    } else if (req.params.category === "mobileWeb") {
      title_left = "Mobile Web 환경";
    }

    pool.query("select pj_id from project where pj_platform = '" + req.params.category + "';", (err, rows) => {
      const now = moment().format("YYYY.MM.DD HH:mm:ss");

      if (err) {
        console.error("Error in /platform\n" + now + ", " + err.code + "\n---");
        res.redirect("/500");
      } else {
        res.status(200).render("platform", {
          title: title_left,
          cnt: rows.length
        });
      }
    });
  });

  router.get("/customSort", (req, res) => {
    res.status(200).render("customSort");
  });

  router.get("/guide", (req, res) => {
    res.status(200).render("guide");
  });

  router.get("/500", (req, res) => {
    res.status(500).render("page_500");
  });

  router.get("/404", (req, res) => {
    res.status(404).render("page_404");
  });
  return router;
};
