module.exports = function(passport, LocalStrategy) {
  let moment = require("moment");

  passport.use(new LocalStrategy({
    usernameField: "userid",
    passwordField: "password",
    passReqToCallback: true,
  },
  (req, userid, password, done) => {
    if (userid === "admin" && password === "admin") {
      const user = {
        "user_id": userid,
      };

      return done(null, user);
    } else {
      return done(null, false);
    }
  }));

  passport.serializeUser((user, done) => {
    const now = moment().format("YYYY.MM.DD HH:mm:ss");

    console.log("Serialize-User : " + user.user_id + " / " + now);
    done(null, user);
  });
  passport.deserializeUser((user, done) => {
    done(null, user);
  });
};
