module.exports = function(passport, LocalStrategy, userControl) {
  const bcrypt = require("bcrypt-nodejs");
  let moment = require("moment");

  passport.use(new LocalStrategy({
    usernameField: "userid",
    passwordField: "password",
    passReqToCallback: true,
  },
  (req, userid, password, done) => {
    const useridx = userControl.getUserid().indexOf(userid);

    if (useridx !== -1) {
      bcrypt.compare(password, userControl.getPassword()[useridx], (err, res) => {
        if (res) {
          const user = {
            "userid": userid,
            "idx": useridx
          };

          return done(null, user);
        } else {
          return done(null, false);
        }
      });
    } else {
      return done(null, false);
    }
  }));

  passport.serializeUser((user, done) => {
    const now = moment().format("YYYY.MM.DD HH:mm:ss");

    console.log("Serialize-User : " + user.userid + " / " + now);
    done(null, user);
  });

  // Called 3 times per 1 reload : /adminPage, /getKnobData, /getCustomData
  passport.deserializeUser((user, done) => {
    done(null, user);
  });
};
