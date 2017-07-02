const express = require('express');
const path = require('path');
const mustacheExpress = require('mustache-express');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const routes = require('./routes/routes.js');
const session = require("express-session");

const app = express();

app.engine('mustache', mustacheExpress());
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'mustache');
app.use('/public', express.static('public'));
app.set('layout', 'layout');

app.use(bodyParser.urlencoded({extended: false}));
app.use(expressValidator());

app.use(routes);

app.use(session({
  secret: 'aswd',
  resave: false,
  saveUninitialized: false
}));

app.listen(3000, function() {
  console.log('App running on localhost:3000');
});
