module.exports = function(app, connection){
  var express = require("express");
  var router = express.Router();

  router.post("/", function(req, res){
    var queryText = ""; var result = {};
    connection.query(queryText, function(err, rows){
      if(err){
        var now = new Date();
        console.log(now+" --- 500 Error occured in /inputData");
        console.log("The queryText : " + queryText);
        res.redirect("/500");
      }
      else{
        //result.data = rows;
        res.status(200).json(result);
      }
    });
  });

  return router;
};
