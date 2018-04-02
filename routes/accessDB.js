module.exports = function(app, connection) {
  const express = require("express");
  const router = express.Router();

  // input valid 한지 확인 하는 로직 필요함!
  // pj_name : 제한없음
  // pj_teamname : [NL]T[1-4]?
  // pj_platform : pcWeb|mobileWeb|mobileApp

  router.get("/beforeSuite/project", (req, res) => {
    let queryText;

    /*
    if (project존재하면) {
      //pj_id 리턴
    } else {
      //project 생성해서 pj_id 리턴
    }*/
  });

  // build가 없는 경우 insert수행, 있는 경우 buildid돌려주기.
  router.post("/beforeSuite/buildno", (req, res) => {
    //req에서 pj_id가져와서 비교.
    //이전 Buildno 최신값 가져오고, 그 다음 거 insert수행
    //insert 수행 결과 새 buildno 리턴
  });

  router.post("/beforeClass", (req, res) => {
    //req에서 pj_id, Buildno가져와서 비교.
    //class생성하기.-> classname packagename입력받을것.
    //insert 수행 결과 새 classid 리턴
  });

  router.post("/afterMethod", (req, res) => {
    //req에서 buildno, pj_id, classid가져와서 비교
    //method 생성하기 -> methodname, end_t, start_t, result입력받을것.
    //pass:1 / fail:-1 / skip:0
    //insert 수행결과 success, fail로 리턴.

  });

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
        res.status(500).send({"Error occured": 0});
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
