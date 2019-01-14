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

  router.post("/nametest", [body("plat").exists()], (req, res) => {
    const err = validationResult(req);
    const team = convertName(req.body.plat, platformConfig);
    if ((!err.isEmpty()) || (team === "")) {
      return res.status(400).json({
        "error": "Bad Request"
      });
    }

    return res.status(200).json({
      "team": team
    });
  });

  // req에서 정보들가져와서 비교. -> project생성 -> buildno 생성 -> 새 buildid 리턴
  router.post("/beforeSuite", [
    body("pj_name").exists(),
    body("pj_team").exists(),
    body("pj_platform").exists(),
    body("pj_author").exists()
  ], (req, res) => {
    const now = moment().format("YYYY.MM.DD HH:mm:ss");
    const err = validationResult(req);
    const team = convertName(req.body.pj_team, teamConfig);
    const plat = convertName(req.body.pj_platform, platformConfig);

    if ((!err.isEmpty()) || (!team) || (!plat)) {
      return res.status(400).json({
        "error": "Bad Request"
      });
    }

    const name = req.body.pj_name;
    const auth = req.body.pj_author;
    const findProject = "select ifnull((select max(pj_id) from project where pj_name= '" + name + "' and pj_team= '" + team + "' and pj_platform='" + plat + "' and pj_author= '" + auth + "'), -1) pj_id;";
    const insertProject = "INSERT INTO `api_db`.`project` VALUES (default, '" + name + "', '" + team + "', '" + plat + "', '" + auth + "', default); ";

    pool.query(findProject, (err, rows) => {
      if (err) {
        console.error("Error in /beforeSuite/findProject\n" + now + ", " + err.code + "\n" + findProject + "\n---");
        return res.status(500).json({
          "error": "Internal Server Error"
        });
      }

      if (rows[0].pj_id !== -1) {
        insertBuildno(rows[0].pj_id);
      } else {
        pool.query(insertProject, (inerr, inrows) => {
          if (inerr) {
            console.error("Error in /beforeSuite/insertProject\n" + now + ", " + inerr.code + "\n" + insertProject + "\n---");
            return res.status(500).json({
              "error": "Internal Server Error"
            });
          }
          insertBuildno(inrows.insertId);
        });
      }

      function insertBuildno(pj_id) {
        const insertBuild = "insert into buildno values (default, (select ifnull((select max(buildno) from buildno b where pj_id = " + pj_id + "), 0)+1), " + pj_id + ");";

        pool.query(insertBuild, (err, rows) => {
          if (err) {
            console.error("Error in /beforeSuite/insertBuild\n" + now + ", " + err.code + "\n" + insertBuild + "\n---");
            return res.status(500).json({
              "error": "Internal Server Error"
            });
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
  ], (req, res) => {
    const now = moment().format("YYYY.MM.DD HH:mm:ss");
    const err = validationResult(req);

    if (!err.isEmpty()) {
      return res.status(400).json({
        "error": "Bad Request"
      });
    }

    const pjId = req.body.pj_id;
    const buildId = req.body.build_id;
    const cname = req.body.class_name;
    const pname = req.body.package_name;
    const findBuild = "select ifnull((select build_id from buildno where pj_id = " + pjId + " and build_id = " + buildId + "), -1) build_id;";
    const insertClass = "INSERT into class values (default, '" + cname + "', '" + pname + "', " + buildId + ", " + pjId + ");";

    pool.query(findBuild, (err, rows) => {
      if (err) {
        console.error("Error in /beforeClass/findBuild\n" + now + ", " + err.code + "\n" + findBuild + "\n---");
        return res.status(500).json({
          "error": "Internal Server Error"
        });
      }

      if (rows[0].pj_id === -1) {
        console.error("Error in /beforeClass/findBuild\n" + now + ", No suitable Id");
        res.status(400).json({
          "error": "There is no such pj_id, build_id"
        });
      } else {
        pool.query(insertClass, (inerr, inrows) => {
          if (inerr) {
            console.error("Error in /beforeClass/insertClass\n" + now + ", " + inerr.code + "\n" + insertClass + "\n---");
            return res.status(500).json({
              "error": "Internal Server Error"
            });
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
  ], (req, res) => {
    const now = moment().format("YYYY.MM.DD HH:mm:ss");
    const err = validationResult(req);
    if (!err.isEmpty()) {
      return res.status(400).json({
        "error": "Bad Request"
      });
    }

    const pjId = req.body.pj_id;
    const buildId = req.body.build_id;
    const classId = req.body.class_id;
    const mname = req.body.method_name;
    const start_t = req.body.start_t;
    const end_t = req.body.end_t;
    const testResult = req.body.result;
    const findClass = "select ifnull((select class_id from class where pj_id = " + pjId + " and build_id = " + buildId + " and class_id = " + classId + "), -1) build_id;";
    const insertMethod = "INSERT into method values (default, '" + mname + "', '" + start_t + "', '" + end_t + "', " + testResult + ", " + classId + ", " + buildId + ", " + pjId + ");";

    pool.query(findClass, (err, rows) => {
      if (err) {
        console.error("Error in /afterMethod/findClass\n" + now + ", " + err.code + "\n" + findClass + "\n---");
        return res.status(500).json({
          "error": "Internal Server Error"
        });
      }

      if (rows[0].pj_id === -1) {
        console.error("Error in /afterMethod/findClass\n" + now + ", No suitable Id");
        res.status(400).json({
          "error": "There is no such pj_id, build_id, class_id"
        });
      } else {
        pool.query(insertMethod, (inerr, innerrows) => {
          if (inerr) {
            console.error("Error in /afterMethod/insertMethod\n" + now + ", " + inerr.code + "\n" + insertMethod + "\n---");
            return res.status(500).json({
              "error": "Internal Server Error"
            });
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
  ], (req, res) => {
    const now = moment().format("YYYY.MM.DD HH:mm:ss");
    const err = validationResult(req);
    if (!err.isEmpty()) {
      return res.status(400).json({
        "error": "Bad Request"
      });
    }

    const selectId = req.body.selectId;
    const len = selectId.length;
    const tableName = ["project", "buildno", "class", "method"];
    const tableId = ["pj_id", "build_id", "class_id", "method_id"];
    let deleteData = "";

    if (len > 0 && len < 5) {
      deleteData = "delete from " + tableName[len - 1] + " where ";
      deleteData += tableId[len - 1] + " = " + selectId[len - 1] + ";";
    } else {
      return res.status(400).json({
        "error": "Bad Request"
      });
    }

    pool.query(deleteData, (err, rows) => {
      if (err) {
        console.error("Error in /deleteData\n" + now + ", " + err.code + "\n" + deleteData + "\n---");
        return res.status(500).json({
          "error": "Internal Server Error"
        });
      } else {
        console.log("Delete At " + tableName[len - 1] + "(Id : " + selectId[len - 1] + ") ---Time : " + now);
        res.status(200).send("올바르게 삭제되었습니다.");
      }
    });
  });

  return router;
};
