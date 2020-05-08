module.exports = function(passport, LocalStrategy) {
    const bcrypt = require("bcryptjs");
    const moment = require("moment");
    const adminID = require("./adminUser.json").userid;
    const adminPass = [];

    adminID.forEach(value => {
        adminPass.push(bcrypt.hashSync(value, bcrypt.genSaltSync()));
    });

    passport.use(new LocalStrategy({
        usernameField: "userid",
        passwordField: "password",
        passReqToCallback: true,
    },
    (req, userid, password, done) => {
        const useridx = adminID.indexOf(userid);

        if (useridx !== -1) {
            bcrypt.compare(password, adminPass[useridx], (err, res) => {
                if (res) {
                    const user = {
                        "userid": userid,
                        "idx": useridx,
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

        console.log(`Serialize-User : ${user.userid} / ${now}`);
        done(null, user);
    });

    // Called 3 times per 1 reload : /adminPage, /getKnobData, /getCustomData
    passport.deserializeUser((user, done) => {
        done(null, user);
    });
};
