module.exports = function(app, pool) {
  const express = require("express");
  const router = express.Router();
  const { body, validationResult } = require("express-validator/check");

  // req에서 정보들가져와서 비교. -> project생성 -> buildno 생성 -> 새 buildid 리턴
  router.post("/beforeSuite", [
    body("pj_name").exists(),
    body("pj_team").exists().matches(/^[NL]T[1-4]?$/),
    body("pj_platform").exists().matches(/^(pcWeb|mobileWeb|mobileApp)$/),
    body("pj_author").exists()
  ], (req, res) => {
    const err = validationResult(req);
    if(!err.isEmpty()){
      return res.status(400).json({"error": "Bad Request"});
    }

    const name = req.body.pj_name;
    const team = req.body.pj_team;
    const plat = req.body.pj_platform;
    const auth = req.body.pj_author;
    const queryText = "select ifnull((select max(pj_id) from project where pj_name= '" + name +
    "' and pj_team= '" + team + "' and pj_platform='" + plat + "' and pj_author= '" + auth + "'), -1) pj_id;";
    const insertQueryText = "INSERT INTO `api_db`.`project` VALUES (default, '" + name + "', '" + team + "', '" + plat + "', '" + auth + "', default); ";

    pool.query(queryText, (err, rows) => {
      const now = new Date();

      function insertBuildno(pj_id){
        const insertQueryTextBuild = "insert into buildno values (default, (select ifnull((select max(buildno) from buildno b where pj_id = " + pj_id + "), 0)+1), " + pj_id + ");";

        pool.query(insertQueryTextBuild, (err, rows) => {
          if (err) {
            console.error("---Error : /access/beforeSuite/ -> Buildno Insert :" + err.code + "\n---Error Time : " + now);
            return res.status(500).json({"error": "Internal Server Error"});
          } else {
            res.status(200).json({
              "pj_id": pj_id,
              "build_id": rows.insertId
            });
          }
        });
      }

      if (err) {
        console.error("---Error : /access/beforeSuite/ -> Project Search : " + err.code + "\n---Error Time : " + now);
        return res.status(500).json({"error": "Internal Server Error"});
      }

      if (rows[0].pj_id !== -1) {
        insertBuildno(rows[0].pj_id);
      } else {
        pool.query(insertQueryText, (innererr, innerrows) => {
          if (innererr) {
            console.error("---Error : /access/beforeSuite/ -> Project Insert : " + innererr.code + "\n---Error Time : " + now);
            return res.status(500).json({"error": "Internal Server Error"});
          }
          insertBuildno(innerrows.insertId);
        });
      }
    }); // 1st pool.query end
  });

  // req에서 pj_id, Buildid가져와서 비교. -> class생성 -> 새 classid 리턴
  router.post("/beforeClass", [
    body("pj_id").exists(),
    body("build_id").exists(),
    body("class_name").exists(),
    body("package_name").exists()
  ], (req, res) => {
    const err = validationResult(req);
    if(!err.isEmpty()){
      return res.status(400).json({"error": "Bad Request"});
    }

    const pjId = req.body.pj_id;
    const buildId = req.body.build_id;
    const cname = req.body.class_name;
    const pname = req.body.package_name;
    const queryText = "select ifnull((select build_id from buildno where pj_id = " + pjId + " and build_id = " + buildId + "), -1) build_id;";
    const insertQueryText = "INSERT into class values (default, '" + cname + "', '" + pname + "', " + buildId + ", " + pjId + ");";

    pool.query(queryText, (err, rows) => {
      const now = new Date();

      if (err) {
        console.error("---Error : /access/beforeClass -> Search : " + err.code + "\n---Error Time : " + now);
        return res.status(500).json({"error": "Internal Server Error"});
      }

      if (rows[0].pj_id !== -1) {
        pool.query(insertQueryText, (innererr, innerrows) => {
          if (innererr) {
            console.error("---Error : /access/beforeClass -> Insert : " + innererr.code + "\n---Error Time : " + now);
            return res.status(500).json({"error": "Internal Server Error"});
          } else {
            res.status(200).json({"class_id": innerrows.insertId});
          }
        });
      } else {
        console.error("---Error : /access/beforeClass -> Not Found : " + "\n---Error Time : " + now);
        res.status(500).json({"error": "There is no such pj_id, build_id"});
      }
    });
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
    const err = validationResult(req);
    if(!err.isEmpty()){
      return res.status(400).json({"error": "Bad Request"});
    }

    const pjId = req.body.pj_id;
    const buildId = req.body.build_id;
    const classId = req.body.class_id;
    const mname = req.body.method_name;
    const start_t = req.body.start_t;
    const end_t = req.body.end_t;
    const testResult = req.body.result;
    const queryText = "select ifnull((select class_id from class where pj_id = " + pjId + " and build_id = " + buildId + " and class_id = " + classId + "), -1) build_id;";
    const insertQueryText = "INSERT into method values (default, '" + mname + "', '" + start_t + "', '" + end_t + "', " + testResult + ", " + classId + ", " + buildId + ", " + pjId + ");";

    pool.query(queryText, (err, rows) => {
      const now = new Date();

      if (err) {
        console.error("---Error : /access/afterMethod -> Search : " + err.code + "\n---Error Time : " + now);
        return res.status(500).json({"error": "Internal Server Error"});
      }

      if (rows[0].pj_id !== -1) {
        pool.query(insertQueryText, (innererr, innerrows) => {
          if (innererr) {
            console.error("---Error : /access/afterMethod -> Insert : " + innererr.code + "\n---Error Time : " + now);
            return res.status(500).json({"error": "Internal Server Error"});
          } else {
            res.status(200).json({"success": 1});
          }
        });
      } else {
        console.error("---Error : /access/afterMethod -> Not Found : " + "\n---Error Time : " + now);
        res.status(500).json({"error": "There is no such pj_id, build_id, class_id"});
      }
    });
  });

  router.post("/deleteData", [
    body("selectId").exists()
  ], (req, res) => {
    const err = validationResult(req);
    if(!err.isEmpty()){
      return res.status(400).json({"error": "Bad Request"});
    }

    const selectId = req.body.selectId;
    const len = selectId.length;
    const tableName = ["project", "buildno", "class", "method"];
    const tableId = ["pj_id", "build_id", "class_id", "method_id"];
    let queryText = "";

    if (len > 0 && len < 5) {
      queryText = "delete from " + tableName[len-1] + " where ";
      queryText += tableId[len-1] + " = " + selectId[len-1] + ";";
    } else {
      return res.status(400).json({"error": "Bad Request"});
    }

    pool.query(queryText, (err, rows) => {
      const now = new Date();

      if (err) {
        console.error("---Error : /access/deleteData : " + err.code + "\n---Error Time : " + now);
        return res.status(500).json({"error": "Internal Server Error"});
      } else {
        console.log("Delete At " + tableName[len-1] + "(Id : " + selectId[len-1] + ")\n---Time : "+ now);
        res.status(200).send("올바르게 삭제되었습니다.");
      }
    });
  });

  return router;
};
