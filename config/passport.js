module.exports = function(passport, LocalStrategy) {
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
    const now = new Date();

    console.log("Time : " + now + " / Serialize-User -- " + user.user_id);
    done(null, user);
  });
  passport.deserializeUser((user, done) => {
    done(null, user);
  });
};
