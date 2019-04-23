const express = require("express");
const path = require("path");
const db = require("mysql");
const bodyParser = require("body-parser");
const compression = require("compression");
const serverPortNo = 8000;
const coreNo = 2;
let moment = require("moment");
// Passport + session
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt-nodejs");
const userControl = (() => {
  let userid = ["thepower", "conadmin", "poradmin", "woradmin", "comadmin", "seradmin", "cloadmin"];
  let password = [];

  userid.forEach((value) => {
    password.push(bcrypt.hashSync(value, bcrypt.genSaltSync()));
  });

  return {
    getUserid: () => userid,
    getPassword: () => password
  };
})();
const passportConfig = require("./config/passport")(passport, LocalStrategy, userControl);
// DB
const dbConfig = require("./config/dbConfig.json");
let pool;
// Cluster
const cluster = require("cluster");
// Redis
const redis = require("redis");
const redisClient = redis.createClient();
const RedisStore = require("connect-redis")(session);

function handleDisconnect() {
  pool = db.createPool(dbConfig);

  pool.on("connection", (err) => {
    const now = moment().format("YYYY.MM.DD HH:mm:ss");

    if (err) {
      console.log("Connecting... : " + now);
      setTimeout(handleDisconnect, 3000);
    }
  });

  pool.on("error", (err) => {
    const now = moment().format("YYYY.MM.DD HH:mm:ss");

    if (err.code === "PROTOCOL_CONNECTION_LOST") {
      console.log("Connection Lost : " + now);
      handleDisconnect();
    } else {
      throw err;
    }
  });
}

if (cluster.isMaster) {
  console.log("Master started(PID : " + process.pid + ")");
  for (let i = 0; i < coreNo; i++) {
    let worker = cluster.fork();

    console.log("Worker started(PID : " + worker.process.pid + ")");
  }

  redisClient.on("error", (err) => {
    console.error("Redis error : " + err);
  });
  redisClient.set("abmaxLabel", "20");
  redisClient.set("maxLabel", "5");

  cluster.on("exit", (worker, code, signal) => {
    let newworker = cluster.fork();

    console.log("Worker died(PID : " + worker.process.pid + ") -> Worker started(PID : " + newworker.process.pid + ")");
  });
} else {
  const app = express();

  handleDisconnect();
  app.use(compression());
  app.set("views", path.join(__dirname, "/views"));
  app.use("/scripts", express.static(path.join(__dirname, "/node_modules")));
  app.use(express.static(path.join(__dirname, "/public")));
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
    saveUninitialized: false,
    store: new RedisStore({
      client: redisClient,
      logErrors: true
    }),
    cookie: {
      maxAge: 30 * 60 * 1000 // 30 min
    }
  }));

  // passport
  app.use(passport.initialize());
  app.use(passport.session());

  // routes
  app.use("/auto", require("./routes/route.js")(pool));
  app.use("/getData", require("./routes/getData.js")(pool, redisClient));
  app.use("/access", require("./routes/accessDB.js")(pool));
  app.use("/admin", require("./routes/admin.js")(passport, redisClient));
  app.use((req, res, next) => {
    res.statusCode = 404;
    next(new Error(req.url + " NOT FOUND"));
  });
  app.use((err, req, res, next) => {
    const now = moment().format("YYYY.MM.DD HH:mm:ss");

    console.error("---\n" + res.statusCode + " Error occured : " + now);
    console.error(err);

    if (res.statusCode === 400) {
      res.status(400).json({
        "error": "Bad Request - Please Check your input values"
      });
    } else if (res.statusCode === 404) {
      res.status(404).render("page_404");
    } else {
      res.status(500).render("page_500");
    }
  });

  const server = app.listen(serverPortNo, () => {
    const now = moment().format("YYYY.MM.DD HH:mm:ss");

    console.log("Server Start : " + now);
  });
}
