module.exports = function(passport, LocalStrategy){
  passport.use(new LocalStrategy({
    usernameField: "userid",
    passwordField: "password",
    passReqToCallback : true
  },
  function(req, userid, password, done){
    if(userid === "admin" && password === "admin"){
      var user = {
        "user_id" : userid
      };
      return done(null, user);
    }
    else{
      return done(null, false);
    }
  }));

  passport.serializeUser(function(user, done){
    console.log("serialize / User -- "+user.user_id);
    done(null, user);
  });
  passport.deserializeUser(function(user, done){
    //console.log("deserialize / User-- "+user.user_id);
    done(null, user);
  });
};
