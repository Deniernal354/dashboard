module.exports = function(pool) {
  const express = require("express");
  const router = express.Router();
  const teamConfig = require("../config/teamConfig.json");
  const platformConfig = require("../config/platformConfig.json");
  const {
    body,
    validationResult
  } = require("express-validator/check");
  let moment = require("moment");

  function convertName(parameter, category) {
    let result = "";

    category.rules.map((value, idx) => {
      var tmp = new RegExp(value, "i");
      if (tmp.test(parameter)) {
        result = category.name[idx];
      }
    });

    return result;
  }

  // req에서 정보들가져와서 비교. -> project생성 -> buildno 생성 -> 새 buildid 리턴
  router.post("/beforeSuite", [
    body("pj_name").exists(),
    body("pj_team").exists(),
    body("pj_platform").exists(),
    body("pj_author").exists()
  ], (req, res, next) => {
    const now = moment().format("YYYY.MM.DD HH:mm:ss");
    const err = validationResult(req);
    const team = convertName(req.body.pj_team, teamConfig);
    const plat = convertName(req.body.pj_platform, platformConfig);

    if (!err.isEmpty()) {
      res.statusCode = 400;
      return next(JSON.stringify(err.array()));
    }

    if ((!team) || (!plat)) {
      res.statusCode = 400;
      return next("/beforeSuite : Wrong teamName or platName\n(team : " + req.body.pj_team + " / plat : " + req.body.pj_platform + ")");
    }

    const name = req.body.pj_name;
    const auth = req.body.pj_author;
    const env = (req.body.pj_env) ? req.body.pj_env : "Real";
    let link = "";

    if (req.body.pj_link) {
      link = req.body.pj_link;
      if (link.slice(0, 4) !== "http") {
        link = "http://" + link;
      }
    } else {
      link = "-";
    }

    const findProject = "select ifnull((select max(pj_id) from project where pj_name= '" + name + "' and pj_team= '" + team + "' and pj_platform='" + plat + "' and pj_author= '" + auth + "'), -1) pj_id;";
    const insertProject = "INSERT INTO `api_db`.`project` VALUES (default, '" + name + "', '" + team + "', '" + plat + "', '" + auth + "', '" + link + "');";

    pool.query(findProject, (err, rows) => {
      if (err) {
        return next(err);
      }

      // IF the project exists
      if (rows[0].pj_id !== -1) {
        // IF the project's link doesn't exists
        if (link === "-" || link === "") {
          insertBuildno(rows[0].pj_id, env);
        } else {
          const checkLink = "update project set pj_link= '" + link + "' where pj_id = " + rows[0].pj_id + " and pj_link != '" + link + "';";

          pool.query(checkLink, (inerr, inrows) => {
            if (inerr) {
              return next(inerr);
            }
            insertBuildno(rows[0].pj_id, env);
          });
        }
      } else {
        pool.query(insertProject, (inerr, inrows) => {
          if (inerr) {
            return next(inerr);
          }
          insertBuildno(inrows.insertId, env);
        });
      }

      function insertBuildno(pj_id, env) {
        const insertBuild = "insert into build values (default, (select ifnull((select max(buildno) from build b where pj_id = " + pj_id + "), 0)+1), '" + env + "', " + pj_id + ");";

        pool.query(insertBuild, (err, rows) => {
          if (err) {
            return next(err);
          } else {
            res.status(200).json({
              "pj_id": pj_id,
              "build_id": rows.insertId
            });
          }
        });
      }
    }); // findProject query END
  });

  // req에서 pj_id, Buildid가져와서 비교. -> class생성 -> 새 classid 리턴
  router.post("/beforeClass", [
    body("pj_id").exists(),
    body("build_id").exists(),
    body("class_name").exists(),
    body("package_name").exists()
  ], (req, res, next) => {
    const now = moment().format("YYYY.MM.DD HH:mm:ss");
    const err = validationResult(req);

    if (!err.isEmpty()) {
      res.statusCode = 400;
      return next(JSON.stringify(err.array()));
    }

    const pjId = req.body.pj_id;
    const buildId = req.body.build_id;
    const cname = req.body.class_name;
    const pname = req.body.package_name;
    const findBuild = "select ifnull((select build_id from build where pj_id = " + pjId + " and build_id = " + buildId + "), -1) build_id;";
    const insertClass = "INSERT into class values (default, '" + cname + "', '" + pname + "', " + buildId + ", " + pjId + ");";

    pool.query(findBuild, (err, rows) => {
      if (err) {
        return next(err);
      }

      if (rows[0].build_id === -1) {
        res.statusCode = 400;
        return next("/beforeClass : There is no such pj_id, build_id\n" + findBuild);
      } else {
        pool.query(insertClass, (inerr, inrows) => {
          if (inerr) {
            return next(inerr);
          } else {
            res.status(200).json({
              "class_id": inrows.insertId
            });
          }
        }); // insertClass query END
      }
    }); // findBuild query END
  });

  // req에서 buildno, pj_id, classid가져와서 비교 -> method 생성하기 -> insert 수행결과 success, fail로 리턴.
  router.post("/afterMethod", [
    body("pj_id").exists(),
    body("build_id").exists(),
    body("class_id").exists(),
    body("method_name").exists(),
    body("start_t").exists().matches(/^(19|20)\d{2}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[0-1])\s([01][0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9])$/),
    body("end_t").exists().matches(/^(19|20)\d{2}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[0-1])\s([01][0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9])$/),
    body("result").exists().matches(/^[1-3]$/),
  ], (req, res, next) => {
    const now = moment().format("YYYY.MM.DD HH:mm:ss");
    const err = validationResult(req);
    if (!err.isEmpty()) {
      res.statusCode = 400;
      return next(JSON.stringify(err.array()));
    }

    const pjId = req.body.pj_id;
    const buildId = req.body.build_id;
    const classId = req.body.class_id;
    const mname = req.body.method_name;
    const start_t = req.body.start_t;
    const end_t = req.body.end_t;
    const testResult = req.body.result;
    const findClass = "select ifnull((select class_id from class where pj_id = " + pjId + " and build_id = " + buildId + " and class_id = " + classId + "), -1) class_id;";
    const insertMethod = "INSERT into method values (default, '" + mname + "', '" + start_t + "', '" + end_t + "', " + testResult + ", " + classId + ", " + buildId + ", " + pjId + ");";

    pool.query(findClass, (err, rows) => {
      if (err) {
        return next(err);
      }

      if (rows[0].class_id === -1) {
        res.statusCode = 400;
        return next("/afterMethod : There is no such pj_id, build_id, class_id\n" + findClass);
      } else {
        pool.query(insertMethod, (inerr, innerrows) => {
          if (inerr) {
            return next(err);
          } else {
            res.status(200).json({
              "success": 1
            });
          }
        });
      }
    });
  });

  router.post("/deleteData", [
    body("selectId").exists()
  ], (req, res, next) => {
    const now = moment().format("YYYY.MM.DD HH:mm:ss");
    const err = validationResult(req);

    if (!req.session.userid) {
      return res.status(403).json({
        "error": "Forbidden"
      });
    }

    if (!err.isEmpty()) {
      res.statusCode = 400;
      return next(JSON.stringify(err.array()));
    }

    const selectId = req.body.selectId;
    const len = selectId.length;
    const tableName = ["project", "build", "class", "method"];
    const tableId = ["pj_id", "build_id", "class_id", "method_id"];
    let deleteData = "";

    if (len > 0 && len < 5) {
      deleteData = "delete from " + tableName[len - 1] + " where ";
      deleteData += tableId[len - 1] + " = " + selectId[len - 1] + ";";
    } else {
      res.statusCode = 400;
      return next("/deleteData : Wrong selectId request\n" + selectId);
    }

    pool.query(deleteData, (err, rows) => {
      if (err) {
        return next(err);
      } else {
        console.log("By " + req.session.userid + ", data is deleted : " + now + ", " + tableName[len - 1] + "(Id : " + selectId[len - 1] + ")");
        res.status(200).json({
          "success": "올바르게 삭제되었습니다."
        });
      }
    });
  });

  return router;
};
