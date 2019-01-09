const express = require("express");
const path = require("path");
const db = require("mysql");
const bodyParser = require("body-parser");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const compression = require("compression");

// DB
const dbConfig = require("./config/dbConfig.json");
const teamConfig = require("./config/teamConfig.json");
const platformConfig = require("./config/platformConfig.json");
let pool;

function handleDisconnect() {
  let now = new Date();
  pool = db.createPool(dbConfig);

  pool.on("connection", (err) => {
    now = new Date();

    if (err) {
      console.log("Error in Making a connection : " + now);
      setTimeout(handleDisconnect, 3000);
    }
  });

  pool.on("error", (err) => {
    now = new Date();

    if (err.code === "PROTOCOL_CONNECTION_LOST") {
      console.log("Connection Lost : " + now);
      handleDisconnect();
    } else {
      throw err;
    }
  });
}
handleDisconnect();

const app = express();

app.use(compression());

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
  cookie: {
    maxAge: 8 * 60 * 60 * 1000 // 8 hours
  }
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
    getAbsoluteMaxLabel: () => 20,
    setMaxLabel: value => {
      realMaxLabel = value;
    },
  };
})();

app.use("/", require("./routes/route.js")(app, pool, teamConfig));
app.use("/getData", require("./routes/getData.js")(app, pool, maxLabel, teamConfig, platformConfig));
app.use("/admin", require("./routes/admin.js")(app, passport, maxLabel));
app.use("/access", require("./routes/accessDB.js")(app, pool, teamConfig));

app.use((req, res) => {
  res.status(404).render("page_404");
});

const server = app.listen(80, () => {
  const now = new Date();

  console.log("Server Start Time : " + now);
});
