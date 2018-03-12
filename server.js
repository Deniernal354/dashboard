var express = require("express");
var path = require("path");
var db = require("mysql");
var bodyParser = require("body-parser");
var session = require("express-session");
var passport = require("passport");
var LocalStrategy = require("passport-local").Strategy;

//DB
var connection;
function handleDisconnect(){
  connection = db.createConnection({
    host : "localhost",
    user : "root",
    password : "eotlqhem",
    database : "test_db",
    //  multipleStatements : true
  });

  var now = new Date();
  connection.connect(function(err){
    if(err){
      console.log("At "+now+" Error connect -- Reconnect after 3 seconds");
      setTimeout(handleDisconnect, 3000);
    }
  });
  connection.on("error", function(err){
    console.log("At "+now+" Error on Connection -- Reconnect after 3 seconds");
    if(err.code === "PROTOCOL_CONNECTION_LOST"){
      handleDisconnect();
    } else{
      throw err;
    }
  });
}
handleDisconnect();

var app = express();
app.set("views", path.join( __dirname, "/views"));
app.use("/scripts", express.static(path.join(__dirname, "/node_modules")));
app.use(express.static(path.join(__dirname, "/public")));

//ejs template
app.set("view engine", "ejs");
// html template
//app.set("view engine", "html");
app.engine("html", require("ejs").renderFile);

//middlewares
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(session({
  secret: "!@#nts#@!",
  resave: false,
  saveUninitialized: true
}));

//passport
var passport_config = require("./config/passport")(passport, LocalStrategy);
app.use(passport.initialize());
app.use(passport.session());

//router
var maxLabel = (function(){
  var realMaxLabel = 9;
  return {
    getMaxLabel : function(){
      return realMaxLabel;
    },
    setMaxLabel : function(value){
      realMaxLabel = value;
    }
  };
})();
app.use("/", require("./routes/route.js")(app, connection, maxLabel));
app.use("/admin", require("./routes/admin.js")(app, connection, passport, maxLabel));

app.use(function(req, res){
  res.status(404).render("page_404.html",{title : "NOT FOUND"});
});

var server = app.listen(8000, function(){
  var now = new Date();
  console.log("Server Start : portNo. " + server.address().port);
  console.log("Start time is : "+now);
});
