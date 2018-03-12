module.exports = function(app, connection){
  var express = require("express");
  var router = express.Router();

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
  router.post("/initProject", function(req, res){
    var queryText = "INSERT INTO `test_db`.`project` (`pj_id`, `pj_name`, `pj_teamname`, `pj_platform`) VALUES (DEFAULT, "+req.pj_name+", "+req.pj_teamname+", "+req.pj_platform+");";
    var resultQueryText = "select pj_id from project order by pj_id DESC limit 1";

    connection.query(queryText, function(err, rows){
      if(err){
        var now = new Date();
        console.log(now+" --- 500 Error occured in /inputData");
        console.log("The queryText : " + queryText);
        res.redirect("/500");
      }
      else{
        //result.data = row
        connection.query(resultQueryText, function(err, innerrows){
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

  router.delete("/deleteProject", function(req, res){
    var queryText = "DELETE FROM project WHERE pj_id = "+req.pj_id+";";

    connection.query(queryText, function(err, rows){
      if(err){
        var now = new Date();
        console.log(now+" --- 500 Error occured in /deleteData");
        console.log("The queryText : " + queryText);
        res.redirect("/500");
      }
      else{
        res.status(200).send({"success" : 1});
      }
    });
  });

  return router;
};
