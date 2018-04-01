const express = require("express");
const path = require("path");
const db = require("mysql");
const bodyParser = require("body-parser");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

// DB
let connection;

function handleDisconnect() {
  connection = db.createConnection({
    host: "localhost",
    user: "root",
    password: "eotlqhem",
    database: "test_db",
    //  multipleStatements : true
  });

  const now = new Date();

  connection.connect(err => {
    if (err) {
      console.log("At " + now + " Error connect -- Reconnect after 3 seconds!!");
      setTimeout(handleDisconnect, 3000);
    }
  });
  connection.on("error", err => {
    console.log("At " + now + " Error on Connection -- Reconnect after 3 seconds");
    if (err.code === "PROTOCOL_CONNECTION_LOST") {
      handleDisconnect();
    } else {
      throw err;
    }
  });
}
handleDisconnect();

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
  let realMaxLabel = 9;

  return {
    getMaxLabel: () => realMaxLabel,
    setMaxLabel: value => {
      realMaxLabel = value;
    },
  };
})();

app.use("/", require("./routes/route.js")(app, connection, maxLabel));
app.use("/admin", require("./routes/admin.js")(app, connection, passport, maxLabel));
app.use("/access", require("./routes/accessDB.js")(app, connection));

app.use((req, res) => {
  res.status(404).render("page_404");
});

const server = app.listen(8000, () => {
  const now = new Date();

  console.log("Server Start : portNo. " + server.address().port);
  console.log("Start time is : " + now);
});
