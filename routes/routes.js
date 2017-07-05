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

let likes = 0;
let messageCreator;
let creators = [];

const checkUser = function(req, res, next){
  if(req.session.username){
    next();
  } else {
    res.redirect('/')
  }
}

const getGab = function (req, res, next) {
  models.messages.findById(req.params.gabId).then(function(gab){
    if(gab) {
      req.gab = gab;
      next();
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
  creators = [];
  models.messages.findAll({
    order: [['createdAt', 'DESC']],
    include: [{
      model: models.users,
      as: 'users'
    }, {model: models.likes, as:'likes'}]
  }).then(function(messages){
    // console.log(messages[0].users.dataValues.username);
    // console.log(messages[0]);
    messages.forEach(function(message) {

     messageCreator = {
       messageUser: message.users.dataValues.username,
       body: message.body,
       createdAt: message.createdAt,
       userId: message.userId,
       id: message.id
     }
     creators.push(messageCreator);
    //  console.log(messageCreator);
    if (req.session.userId === message.dataValues.userId) {
      messageCreator.delete = true;
    }
    });

    // let messageUser = messages[0].users.dataValues.username;
  res.render('home', {username: req.session.username, messages: creators, likes: likes, })
});

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
      }).then(function(user){
        if(user){
          req.session.username = user.username;
          req.session.userId = user.id;
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
      // console.log(errors);
      res.render('index', {errors: errors})
    }
  })
});

router.post('/createGab',function(req, res){

  req.checkBody('newGab', 'You Must Enter a New Gab').notEmpty();

  const newGab = {
    body: req.body.newGab,
    userId: req.session.userId
  };
// console.log(newGab);
  req.getValidationResult().then(function(result){
    if(result.isEmpty()){
      models.messages.create(newGab).then(function(){
        res.redirect('/home');
      })
    }
    else {
      const gabErrors = result.mapped();
      // console.log(gabErrors);
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
  //  console.log(message)
});
});

router.post('/like', function(req, res){
  likes = likes + 1;
  res.redirect('/home');
})

router.post('/logout', function(req, res){
  req.session.destroy();
    res.redirect("/");
})

router.post("/home/:gabId/delete", getGab, function(req, res) {
  // if(models.messages.userId === req.session.userId) {
    req.gab.destroy().then(function() {
    res.redirect("/home");
    // });
  });
});

module.exports = router;
