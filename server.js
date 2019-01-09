const express = require("express");
const path = require("path");
const db = require("mysql");
const bodyParser = require("body-parser");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const compression = require("compression");
const app = express();
const serverPortNo = 80;

// DB
const dbConfig = require("./config/dbConfig.json");
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

app.use("/", require("./routes/route.js")(pool));
app.use("/getData", require("./routes/getData.js")(pool, maxLabel));
app.use("/access", require("./routes/accessDB.js")(pool));
app.use("/admin", require("./routes/admin.js")(passport, maxLabel));
app.use((err, req, res, next) => {
  if (err.status === 400) {
    res.status(400).json({
      "error": "Bad Request"
    });
  } else {
    res.status(404).render("page_404");
  }
});

const server = app.listen(serverPortNo, () => {
  const now = new Date();

  console.log("Server Start Time : " + now);
});
