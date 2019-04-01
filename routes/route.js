// get/post 터널링 조심!! (get은 get만, post는 post만) http://myweb/users?method=update&id=terry
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

  router.get("/all", (req, res, next) => {
    pool.query("select count(*) cnt from project", (err, rows) => {
      const now = moment().format("YYYY.MM.DD HH:mm:ss");

      if (err) {
        return next(err);
      } else {
        res.status(200).render("all.ejs", {
          cnt: rows[0].cnt
        });
      }
    });
  });

  router.get("/team/:teamNo", [
    param("teamNo").exists().matches(/^[1-6]{1}$/)
  ], (req, res, next) => {
    const err = validationResult(req);

    if (!err.isEmpty()) {
      res.statusCode = 404;
      return next(JSON.stringify(err.array()));
    }

    let teamName = teamConfig.name[req.params.teamNo];

    pool.query("select count(*) cnt from project where pj_team = '" + teamName + "';", (err, rows) => {
      const now = moment().format("YYYY.MM.DD HH:mm:ss");

      if (err) {
        return next(err);
      } else {
        res.status(200).render("team", {
          title: teamName,
          cnt: rows[0].cnt
        });
      }
    });
  });

  router.get("/platform/:category", [
    param("category").exists().matches(/^(pcWeb|pcApp|mobileWeb|mobileApp|API)$/)
  ], (req, res, next) => {
    const err = validationResult(req);

    if (!err.isEmpty()) {
      res.statusCode = 404;
      return next(JSON.stringify(err.array()));
    }

    let title_left = "PC Web 환경";

    if (req.params.category === "pcApp") {
      title_left = "PC App 환경";
    } else if (req.params.category === "mobileApp") {
      title_left = "Mobile App 환경";
    } else if (req.params.category === "mobileWeb") {
      title_left = "Mobile Web 환경";
    } else if (req.params.category === "API") {
      title_left = "API Test";
    }

    pool.query("select count(*) cnt from project where pj_platform = '" + req.params.category + "';", (err, rows) => {
      const now = moment().format("YYYY.MM.DD HH:mm:ss");

      if (err) {
        return next(err);
      } else {
        res.status(200).render("platform", {
          title: title_left,
          cnt: rows[0].cnt
        });
      }
    });
  });

  router.get("/guide", (req, res) => {
    res.status(200).render("guide");
  });

  // When the client get 500 status in the /getData
  router.get("/500", (req, res) => {
    res.status(500).render("page_500");
  });
  return router;
};
