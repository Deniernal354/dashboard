module.exports = function(app, pool) {
  const express = require("express");
  const router = express.Router();

  // input valid 한지 확인 하는 로직 필요함! -> 현재는 일단 중복값 체크만 하고 있음.
  // pj_name : 제한없음
  // pj_teamname : [NL]T[1-4]?
  // pj_platform : pcWeb|mobileWeb|mobileApp
  router.post("/beforeSuite/project", (req, res) => {
    const queryText = "select ifnull((select max(pj_id) from project where pj_name= '" + req.body.pj_name +
    "' and pj_team= '" + req.body.pj_team + "' and pj_platform='" + req.body.pj_platform + "' and pj_author= '" + req.body.pj_author + "'), -1) pj_id;";
    const insertQueryText = "INSERT INTO `api_db`.`project` (`pj_name`, `pj_team`, `pj_platform`, `pj_author`) VALUES ('" + req.body.pj_name + "', '" + req.body.pj_team + "', '" + req.body.pj_platform + "', '" + req.body.pj_author + "'); ";

    pool.query(queryText, (err, rows) => {
      const now = new Date();

      if (err) {
        console.error("---Error : /access/beforeSuite/project -> Search : " + err.code + "\n---Error Time : " + now);
        res.redirect("/500");
      } else {
        console.log(queryText);
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
      }
    });
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
