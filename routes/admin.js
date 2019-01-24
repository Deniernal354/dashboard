module.exports = function(passport, maxLabel) {
  const express = require("express");
  const router = express.Router();

  function isAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    } else {
      res.redirect("/admin");
    }
  }

  router.get("/", (req, res) => {
    if (req.session.userid) {
      res.redirect("/admin/adminPage");
    } else {
      res.status(200).render("admin_login");
    }
  });

  router.post("/checkAdmin", passport.authenticate("local", {
    successRedirect: "/admin/adminPage",
    failureRedirect: "/admin/403"
  }));

  router.get("/adminPage", isAuthenticated, (req, res) => {
    if (!req.session.userid) {
      req.session.userid = req.user.userid;
    }
    res.status(200).render("admin");
  });

  router.get("/getKnobData", (req, res) => {
    res.status(200).json(maxLabel.getMaxLabel());
  });

  router.post("/changeMaxLabel", (req, res) => {
    if (req.body.newMaxLabel) {
      const newLabel = req.body.newMaxLabel.substring(5, req.body.newMaxLabel.indexOf("개")) * 1;

      if ((newLabel >= 1 && newLabel <= maxLabel.getAbsoluteMaxLabel()) && (maxLabel.getMaxLabel() !== newLabel)) {
        console.log("maxLabel is changed : " + maxLabel.getMaxLabel() + " -> " + newLabel);
        maxLabel.setMaxLabel(newLabel);
      }
    }
    res.status(200).redirect("/admin");
  });

  router.get("/logout", (req, res) => {
    req.logout();
    if (req.session.userid) {
      req.session.destroy(err => {
        if (err) {
          console.log(err);
        } else {
          res.redirect("/");
        }
      });
    } else {
      res.redirect("/");
    }
  });

  router.get("/403", (req, res) => {
    res.status(403).render("page_403", {
      title: "Forbidden"
    });
  });

  return router;
};
