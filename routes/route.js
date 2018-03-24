/*
get/post 터널링 조심(get은 get만, post는 post만)
http://myweb/users?method=update&id=terry

res 메소드	설명///////////////////////////////////////////////////
res.download()	다운로드될 파일을 전송한다.
res.jsonp()	JSONP 지원을 통해 JSON 응답을 전송한다.
res.redirect()	요청 경로를 재지정한다.
res.sendFile()	파일을 옥텟 스트림의 형태로 전송한다.
(이메일이나 http에서 사용되는 content-type에서 application의 형식이 지정되어 있지 않은 경우)
res.sendStatus()	응답 상태 코드를 설정한 후 해당 코드를 문자열로 표현한 내용을 응답 본문으로서 전송한다.

////////////////////////////////////////////////////////////////
*/
module.exports = function(app, connection, maxLabel){
  var express = require("express");
  var router = express.Router();

  router.get("/", function(req, res){
    res.redirect("/index");
  });
  router.get("/index.html", function(req, res){
    res.redirect("/index");
  });
  router.get("/index", function(req, res){
    res.status(200).render("index.ejs");
  });

  router.get("/customSort", function(req, res){
    res.status(200).render("customSort");
  });

  router.get("/getCustomData/:category/:previousValue?", function(req, res){
    var queryText = "";
    if(req.params.category === "project"){
      queryText = "select pj_id, pj_name, pj_teamname from project";
    }
    else if(req.params.category === "package"){
      queryText = "select package_id, package_name, buildno from package where pj_id = "+req.params.previousValue+";";
    }
    else if(req.params.category === "suite"){
      queryText = "select su_id, su_name from suite where package_id = "+req.params.previousValue+";";
    }
    else if(req.params.category === "testcase"){
      queryText = "select case_id, case_name from testcase where su_id = "+ req.params.previousValue+";";
    }
    else{
      queryText = "";
    }

    connection.query(queryText, function(err, rows){
      if(err){
        var now = new Date();
        console.log(now+" --- 500 Error occured in /getCustomData");
        res.redirect("/500");
      }
      else{
        res.status(200).json(rows);
      }
    });
  });

  router.get("/guide", function(req, res){
    res.status(200).render("guide");
  });

  router.get("/team/:teamNo", function(req, res){
    var teamNameTemp = "team"+ req.params.teamNo;
    res.status(200).render(teamNameTemp);
  });

  router.get("/platform/:platform_category", function(req, res){
    res.status(200).render(req.params.platform_category);
  });

  router.get("/getChartData/:page/:detail?", function(req, res){
    var queryText = "select s.pj_id pj_id, t.buildno buildno, sum(t.pass) pass, sum(t.fail) fail, sum(t.skip) skip, min(t.start_t) start_t, sec_to_time(sum(t.duration)) duration from suite s inner join (select pj_id, su_id, package_id, buildno, sum(pass) pass, sum(fail) fail, sum(skip) skip, Date_format(min(start_t), '%Y/%m/%d %H:%i:%s') start_t, unix_timestamp(max(end_t)) - unix_timestamp(min(start_t)) as duration from testcase group by pj_id, package_id, buildno, su_id) t on s.su_id=t.su_id inner join 	(select pj_id, package_name, package_id, buildno, @rn := IF(@prev = pj_id, @rn + 1, 1) AS rn, @prev := pj_id FROM package inner JOIN (SELECT @prev := NULL, @rn := 0) AS vars order by pj_id, package_id DESC, buildno DESC ) p on p.package_id= t.package_id inner join project pj on pj.pj_id = t.pj_id where p.rn<=" + maxLabel.getMaxLabel();
    var queryText_label = ""; var result = {};

    //index page data
    if(req.params.page === "index"){
      queryText_label = "select pj_name, pj_id, pj_link from project;";
    }
    //team page data
    else if(req.params.page === "team"){
      var teamname = "NT"+req.params.detail;
      if(req.params.detail === "5"){ teamname = "LT"; }
      queryText = queryText + " and pj.pj_teamname = '" + teamname + "'";
      queryText_label = "select pj_name, pj_id, pj_link from project where pj_teamname = '"+teamname+"';";
    }
    //environment page data
    else if(req.params.page === "platform"){
      queryText = queryText + " and pj.pj_platform = '" + req.params.detail + "'";
      queryText_label = "select pj_name, pj_id, pj_link from project where pj_platform = '" + req.params.detail + "';";
    }
    else{
      queryText = "";
    }

    queryText += " group by pj_id, buildno;";

    connection.query(queryText, function(err, rows){
      if(err){
        var now = new Date();
        console.log(now+" --- 500 Error occured in /getChartData");
        console.log("The queryText : " + queryText);
        res.redirect("/500");
      }
      else{
        result.data = rows;
        connection.query(queryText_label, function(err, innerrows){
          result.pj_label = innerrows;
          result.totalChartCount = innerrows.length;
          result.maxLabel = maxLabel.getMaxLabel();
          res.status(200).json(result);
        });
      }
    });
  });

  router.get("/500", function(req, res){
    res.status(500).render("page_500");
  });
  return router;
};


/* post예제

app.post('/addUser/:username', function(req, res){
  var result = {  };
  var username = req.params.username;

  // CHECK REQ VALIDITY
  if(!(req.body.password && req.body.name)){
    result.success= 0;
    result.error = "invalid request";
    res.json(result);
    return;
  }

  // LOAD DATA & CHECK DUPLICATION
  fs.readFile( __dirname + "/../data/user.json", 'utf8',  function(err, data){
    var users = JSON.parse(data);
    //ducplication check -> !만 달아주면 delete의 Not found로 사용 가능
    if(users[username]){
      result.success = 0;
      result.error = "duplicate";
      res.json(result);
      return;
    }
    // ADD TO DATA
    users[username] = req.body;

    // SAVE DATA
    fs.writeFile(__dirname + "/../data/user.json", JSON.stringify(users, null, '\t'), "utf8", function(err, data){
      result = {"success": 1};
      res.json(result);
    });
  });//readFile end
});//post end
*/
