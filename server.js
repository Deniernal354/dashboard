const express = require("express");
const path = require("path");
const db = require("mysql");
const bodyParser = require("body-parser");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

// DB
let pool = db.createPool({
  host: "localhost",
  user: "root",
  password: "eotlqhem",
  //database: "test_db",
  database: "api_db",
  multipleStatements : true
});

const app = express();

app.set("views", path.join(__dirname, "/views"));
app.use("/scripts", express.static(path.join(__dirname, "/node_modules")));
app.use(express.static(path.join(__dirname, "/public")));

// ejs template
// Template HTML -> app.set("view engine", "html");
app.set("view engine", "ejs");
app.engine("html", require("ejs").renderFile);

// middlewares
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true,
}));
app.use(session({
  secret: "!@#nts#@!",
  resave: false,
  saveUninitialized: true,
}));

// passport
const passportConfig = require("./config/passport")(passport, LocalStrategy);

app.use(passport.initialize());
app.use(passport.session());

// router
const maxLabel = (() => {
  let realMaxLabel = 5;

  return {
    getMaxLabel: () => realMaxLabel,
    setMaxLabel: value => {
      realMaxLabel = value;
    },
  };
})();

app.use("/", require("./routes/route.js")(app, pool, maxLabel));
app.use("/admin", require("./routes/admin.js")(app, passport, maxLabel));
app.use("/access", require("./routes/accessDB.js")(app, pool));

app.use((req, res) => {
  res.status(404).render("page_404");
});

const server = app.listen(8000, () => {
  const now = new Date();

  console.log("Server Start --- portNo : " + server.address().port + " / Time : " + now);
});
