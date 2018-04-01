module.exports = function(app, connection) {
  const express = require("express");
  const router = express.Router();

  // If the project is valid, just return pj_id
  // Else, make project and return pj_id
  router.get("/getProjectId", (req, res) => {

  });
  router.post("/addProjectId", (req, res) => {

  });

  // Add buildno
  router.post("/addBuildno", (req, res) => {

  });

  router.post("/beforeSuite", (req, res) => {

  });
  router.post("/afterSuite", (req, res) => {

  });
  router.post("/beforeMethod", (req, res) => {

  });
  router.post("/afterMethod", (req, res) => {

  });

  router.get("/afterMethod2", (req, res) => {
    res.send("There is no cow level;");
  });

  /* req 형태
    {
      pj_name
      pj_teamname
      pj_platform
    }
    res 형태
    {
      pj.id
    }
  */
  // input valid 한지 확인 하는 로직 필요함!
  // build가 없는 경우 insert수행, 있는 경우 buildid돌려주기.
  // pj_name : 제한없음
  // pj_teamname : [NL]T[1-4]?
  // pj_platform : pc_web|mobile_web|mobile_app
  router.post("/initProject", (req, res) => {
    console.log(req.body.pj_name + "///" + req.body.pj_teamname + "///" + req.body.pj_platform);
    console.log(req.body);
    res.status(200).send({"success": 1});
  });

  router.post("/initProject2", (req, res) => {
    const queryText = "INSERT INTO `test_db`.`project` (`pj_id`, `pj_name`, `pj_teamname`, `pj_platform`) VALUES (DEFAULT, '" + req.body.pj_name + "', '" + req.body.pj_teamname + "', '" + req.body.pj_platform + "');";
    const resultQueryText = "select pj_id from project where pj_name = '" + req.body.pj_name + "'order by pj_id DESC limit 1";

    connection.query(queryText, (err, rows) => {
      if (err) {
        const now = new Date();

        console.log(now + " --- 500 Error occured in /inputData");
        console.log("The queryText : " + queryText);
        res.status(500).send({"success": 0});
      } else {
        // result.data = row
        connection.query(resultQueryText, (innererr, innerrows) => {
          res.status(200).json(innerrows);
        });
      }
    });
  });

  /* req 형태
    {
      pj_id
    }
  */

  router.delete("/deleteProject", (req, res) => {
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
  });

  return router;
};
