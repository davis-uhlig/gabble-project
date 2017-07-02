const express =  require('express');
const router = express.Router();
const models = require('../models');
const sequelize = require("sequelize");

router.get('/', function(req, res) {
  res.render('index')
});

router.get('/createAccount', function(req, res){
  res.render('createAccount')
});

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
});

module.exports = router;
