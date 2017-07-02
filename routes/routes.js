const express =  require('express');
const router = express.Router();
const models = require('../models');
const sequelize = require("sequelize");
const session = require("express-session");

router.use(session({
  secret: 'aswd',
  resave: false,
  saveUninitialized: false
}));

const checkUser = function(req, res, next){
  if(req.session.username){
    next();
  } else {
    res.redirect('/')
  }
}

const getUserId = function (req, res, next) {
  models.users.findById(req.params.id).then(function(userId){
    if(userId) {
      req.userId = userId;
    } else {
      res.status(404).send("Not Found");
    }
  })
}

router.get('/', function(req, res) {
  res.render('index')
});

router.get('/createAccount', function(req, res){
  res.render('createAccount')
});

router.get('/home', checkUser, function(req, res){
  models.messages.findAll({
    order: [['createdAt', 'DESC']]
  }).then(function(messages){
  res.render('home', {username: req.session.username, messages: messages})
})
});

router.get('/createGab', checkUser, function(req, res){
  res.render('createGab');
})

router.post('/createAccount', function(req, res){
  const userData = {
    username: req.body.username,
    password: req.body.password
  }
  models.users.create(userData).then(res.redirect('/'));
});

router.post('/', function(req, res){
  req.checkBody('username', 'You must enter a username').notEmpty();
  req.checkBody('password', 'You must enter a password').notEmpty();

  const loginInfo = {
    username: req.body.username,
    password: req.body.password
  }

  req.getValidationResult().then(function(result){
    if(result.isEmpty()){
      models.users.findOne({
        where: {
          username: req.body.username,
          password: req.body.password
        }
      }).then(function(users){
        if(users){
          req.session.username = req.body.username;

          res.redirect('/home');
        }
        else {
          let noMatch = {
            message: "This Username or Password does not exist"
          }
          res.render('index', {noMatch: noMatch});
        }
      })
    }
    else {
      const errors = result.mapped();
      console.log(errors);
      res.render('index', {errors: errors})
    }
  })
});

router.post('/createGab',function(req, res){

  req.checkBody('newGab', 'You Must Enter a New Gab').notEmpty();

  newGab = {
    body: req.body.newGab,
    userId: 1
  };

  req.getValidationResult().then(function(result){
    if(result.isEmpty()){
      models.messages.create(newGab).then(function(){
        res.redirect('/home');
      })
    }
    else {
      const gabErrors = result.mapped();
      console.log(gabErrors);
      res.render('createGab', {gabErrors: gabErrors});
    }
  })

  models.messages.findOne({
  include: [
    {
       model: models.users,
       as : 'users'
    }
  ]
}).then(function(message){
   console.log(message)
});
});

router.post('/logout', function(req, res){
  req.session.destroy();
    res.redirect("/");
})

module.exports = router;
