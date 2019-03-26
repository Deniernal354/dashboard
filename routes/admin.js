module.exports = function(passport, redisClient) {
  const express = require("express");
  const router = express.Router();

  function isAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    } else {
      res.redirect("/admin/login");
    }
  }

  router.post("/checkAdmin", passport.authenticate("local", {
    successRedirect: "/admin",
    failureRedirect: "/admin/403"
  }));

  router.get("/", isAuthenticated, (req, res) => {
    if (!req.session.userid) {
      req.session.userid = req.user.userid;
    }
    res.header("Cache-Control", "no-cache, private, no-store, must-revalidate");
    res.status(200).render("admin");
  });

  router.get("/login", (req, res) => {
    res.status(200).render("admin_login");
  });

  router.get("/getKnobData", (req, res) => {
    redisClient.get("maxLabel", (err, reply) => {
      redisClient.get("abmaxLabel", (err2, reply2) => {
        res.header("Cache-Control", "no-cache, private, no-store, must-revalidate");
        res.status(200).json({
          "cur": reply,
          "absolute": reply2
        });
      });
    });
  });

  router.post("/changeMaxLabel", (req, res) => {
    if (req.body.newMaxLabel && req.session.userid) {
      const newLabel = req.body.newMaxLabel.substring(5, req.body.newMaxLabel.indexOf("개")) * 1;

      redisClient.get("maxLabel", (err, reply) => {
        redisClient.get("abmaxLabel", (err2, reply2) => {
          const preLabel = reply * 1;

          if ((newLabel >= 1) && (newLabel <= reply2 * 1) && (preLabel !== newLabel)) {
            console.log("By " + req.session.userid + ", maxLabel is changed : " + preLabel + " -> " + newLabel);
            redisClient.set("maxLabel", newLabel);
          }
          res.status(200).redirect("/admin");
        });
      });
    }
  });

  router.get("/logout", (req, res) => {
    if (req.session.userid) {
      req.session.destroy(err => {
        if (err) {
          console.error("logout session destroy failed" + err);
        }
      });
    }
    req.logout();
    res.redirect("/");
  });

  router.get("/403", (req, res) => {
    res.status(403).render("page_403", {
      title: "Forbidden"
    });
  });

  return router;
};
