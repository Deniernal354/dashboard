module.exports = function(app, connection, passport, maxLabel){
  var express = require('express');
  var router = express.Router();

  router.get('/', function(req, res){
    if(req.session.user_id){
      res.redirect('/admin/adminPage');
    }
    else{
      res.status(200).render('admin_login.html');
    }
  });

  router.get('/getKnobData/', function(req, res){
    res.status(200).json(maxLabel.getMaxLabel());
  });

  router.post('/changeMaxLabel', function(req, res){
    if(req.body.newMaxLabel){
      var newLabel = req.body.newMaxLabel.substring(5, req.body.newMaxLabel.indexOf("개"))*1;

      if((newLabel >= 1 && newLabel <= 50) && (maxLabel.getMaxLabel() !== newLabel)){
        console.log("maxLabel is changed : "+maxLabel.getMaxLabel()+" -> "+newLabel);
        maxLabel.setMaxLabel(newLabel);
      }
    }
    res.status(200).redirect('/admin');
  });

  router.post('/checkAdmin', passport.authenticate('local',{
    successRedirect : '/admin/adminPage',
    failureRedirect : '/admin/403'
  }));

  router.get('/adminPage', isAuthenticated, function(req, res){
    if(!req.session.user_id){
      req.session.user_id = req.user.user_id;
    }
    res.status(200).render('admin.html');
  });

  router.get('/403', function(req, res){
    res.status(403).render('page_403.html',{title : "Forbidden"});
  });

  router.get('/logout', function(req, res){
    req.logout();
    if(req.session.user_id){
      req.session.destroy(function(err){
        if(err){
          console.log(err);
        }else{
          res.redirect('/');
        }
      });
    }else{
      res.redirect('/');
    }
  });

  function isAuthenticated(req, res, next){
    if(req.isAuthenticated()){
      return next();
    }
    else{
      res.redirect('/admin');
    }
  }
  return router;
};
