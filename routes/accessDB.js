module.exports = function(app, pool) {
  const express = require("express");
  const router = express.Router();

  // input valid 한지 확인 하는 로직 필요함! -> 현재는 일단 중복값 체크만 하고 있음.
  // pj_name : 제한없음
  // pj_teamname : [NL]T[1-4]?
  // pj_platform : pcWeb|mobileWeb|mobileApp

  // Project Insert API
  router.post("/beforeSuite/project", (req, res) => {
    const name = req.body.pj_name;
    const team = req.body.pj_team;
    const plat = req.body.pj_platform;
    const auth = req.body.pj_author;
    const queryText = "select ifnull((select max(pj_id) from project where pj_name= '" + name +
    "' and pj_team= '" + team + "' and pj_platform='" + plat + "' and pj_author= '" + auth + "'), -1) pj_id;";
    const insertQueryText = "INSERT INTO `api_db`.`project` (`pj_name`, `pj_team`, `pj_platform`, `pj_author`) VALUES ('" + name + "', '" + team + "', '" + plat + "', '" + auth + "'); ";

    pool.query(queryText, (err, rows) => {
      const now = new Date();

      if (err) {
        console.error("---Error : /access/beforeSuite/project -> Search : " + err.code + "\n---Error Time : " + now);
        res.redirect("/500");
      }

      if (rows[0].pj_id !== -1) {
        res.status(200).json(rows[0]);
      } else {
        pool.query(insertQueryText, (innererr, innerrows) => {
          if (innererr) {
            console.error("---Error : /access/beforeSuite/project -> Insert : " + innererr.code + "\n---Error Time : " + now);
            res.redirect("/500");
          } else {
            res.status(200).json({"pj_id" : innerrows.insertId});
          }
        });
      }
    });
  });

  // Get buildno from buildId
  router.get("/beforeSuite/getbuildno/:build_id", (req, res) => {
    const buildId = req.params.build_id;
    const queryText = "select buildno from buildno where build_id = " + buildId + ";";

    pool.query(queryText, (err, rows) => {
      const now = new Date();

      if (err) {
        console.error("---Error : /access/beforeSuite/buildno -> Search : " + err.code + "\n---Error Time : " + now);
        res.redirect("/500");
      }
      else{
        res.status(200).json(rows[0]);
      }
    });
  });

  // Buildno Insert API
  router.post("/beforeSuite/buildno/", (req, res) => {
    const id = req.body.pj_id;
    const queryText = "select ifnull((select pj_id from project where pj_id = " + id + "), -1) pj_id;";
    const insertQueryText = "insert into buildno values (default, (select max(buildno) from buildno b where pj_id = " + id + ")+1, " + id + ");";

    pool.query(queryText, (err, rows) => {
      const now = new Date();

      if (err) {
        console.error("---Error : /access/beforeSuite/buildno -> Search : " + err.code + "\n---Error Time : " + now);
        res.redirect("/500");
      }

      if (rows[0].pj_id !== -1) {
        pool.query(insertQueryText, (innererr, innerrows) => {
          if (innererr) {
            console.error("---Error : /access/beforeSuite/buildno -> Insert : " + innererr.code + "\n---Error Time : " + now);
            res.redirect("/500");
          } else {
            res.status(200).json({"build_id": innerrows});
          }
        });
      } else {
        console.error("---Error : /access/beforeSuite/buildno -> Not Found : " + "\n---Error Time : " + now);
        res.status(500).json({"error": "Wrong pj_id"});
      }
    });
  });

  router.post("/beforeClass", (req, res) => {
    //req에서 pj_id, Buildid가져와서 비교.
    //class생성하기.-> classname packagename입력받을것.
    //insert 수행 결과 새 classid 리턴
    const pjId = req.body.pj_id;
    const buildId = req.body.build_id;
    const cname = req.body.class_name;
    const pname = req.body.package_name;
    const queryText = "select ifnull((select build_id from buildno where pj_id = " + pjId + " and build_id = " + buildId + "), -1) build_id;";
    const insertQueryText = "INSERT into class values (default, " + cname + ", " + pname + ", " + buildId + ", " + pjId + ");";

    pool.query(queryText, (err, rows) => {
      const now = new Date();

      if (err) {
        console.error("---Error : /access/beforeClass -> Search : " + err.code + "\n---Error Time : " + now);
        res.redirect("/500");
      }

      if (rows[0].pj_id !== -1) {
        pool.query(insertQueryText, (innererr, innerrows) => {
          if (innererr) {
            console.error("---Error : /access/beforeClass -> Insert : " + innererr.code + "\n---Error Time : " + now);
            res.redirect("/500");
          } else {
            res.status(200).json({"class_id": innerrows});
          }
        });
      } else {
        console.error("---Error : /access/beforeClass -> Not Found : " + "\n---Error Time : " + now);
        res.status(500).json({"error": "Wrong pj_id or build_id"});
      }
    });
  });

  router.post("/afterMethod", (req, res) => {
    //req에서 buildno, pj_id, classid가져와서 비교
    //method 생성하기 -> methodname, end_t, start_t, result입력받을것.
    //pass:1 / fail:-1 / skip:0
    //insert 수행결과 success, fail로 리턴.

    const pjId = req.body.pj_id;
    const buildId = req.body.build_id;
    const classId = req.body.class_id;
    const mname = req.body.method_name;
    const start_t = req.body.start_t;
    const end_t = req.body.end_t;
    const testResult = req.body.result;
    const queryText = "select ifnull((select class_id from class where pj_id = " + pjId + " and build_id = " + buildId + " and class_id = " + classId + "), -1) build_id;";
    const insertQueryText = "INSERT into class values (default, " + mname + ", " + start_t + ", " + end_t + ", " + testResult + ", " + classId + ", " + buildId + ", " + pjId + ");";

    pool.query(queryText, (err, rows) => {
      const now = new Date();

      if (err) {
        console.error("---Error : /access/afterMethod -> Search : " + err.code + "\n---Error Time : " + now);
        res.redirect("/500");
      }

      if (rows[0].pj_id !== -1) {
        pool.query(insertQueryText, (innererr, innerrows) => {
          if (innererr) {
            console.error("---Error : /access/afterMethod -> Insert : " + innererr.code + "\n---Error Time : " + now);
            res.redirect("/500");
          } else {
            res.status(200).json({"success": 1});
          }
        });
      } else {
        console.error("---Error : /access/afterMethod -> Not Found : " + "\n---Error Time : " + now);
        res.status(500).json({"error": "Wrong pj_id or build_id or class_id"});
      }
    });
  });

  /*router.delete("/deleteProject", (req, res) => {
    const queryText = "DELETE FROM project WHERE pj_id = " + req.pj_id + ";";

    connection.query(queryText, (err, rows) => {
      if (err) {
        const now = new Date();

        console.log(now + " --- 500 Error occured in /deleteData");
        console.log("The queryText : " + queryText);
        res.redirect("/500");
      } else {
        res.status(200).send({"success": 1});
      }
    });
  });*/

  return router;
};
