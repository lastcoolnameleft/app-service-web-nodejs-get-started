var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var builder = require('botbuilder');
var Roll = require('roll');
var config = require('./config');
var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

// Create chat bot
var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});
//var bot = new builder.UniversalBot(connector);
var bot = new builder.UniversalBot(connector, function(session) {
    session.send('Try one of these commands: help');
});

// Answer help related questions like "what can I say?"
bot.dialog('helpDialog', function (session) {
  let sendStr = "Supported Commands:\n\n"
    + "* roll <xdy>: Roll a die. (e.g. roll 3d6)\n"
    + "* character: Create a new character\n"
    + "* whoami: See character details";
  session.send(sendStr);
  // Send help message and end dialog.
}).triggerAction({ matches: /help/i });

bot.dialog('rollDialog', (session, args) => {
  try {
    let inputSplit = args.intent.matched.input.split(' ');
    let roll = new Roll();
    let result = roll.roll(inputSplit[1]).result;
    session.endDialog('You rolled the following die: ' + inputSplit[1] + '.  Result: ' + result);
  } catch (e) {
    session.endDialog('I do not understand the command.  Try "roll 3d6"');
  }
}).triggerAction({ matches: /roll/i });

bot.dialog('createCharacterDialog', [
  (session) => {
    session.userData.character = {};
    builder.Prompts.text(session, 'What do you want to name your character?');
  },
  (session, results) => {
    session.userData.character.name = results.response;
    session.send('Welcome, ' + session.userData.character.name);
    builder.Prompts.choice(session, "What race?", Object.keys(config.races));
  },
  (session, results) => {
    session.userData.character.race = results.response.entity;
    session.send(session.userData.character.race + ' is a good choice.');
    builder.Prompts.choice(session, "What class?", Object.keys(config.classes));
  },
  (session, results) => {
    session.userData.character.class = results.response.entity;
    session.endDialog(session.userData.character.class + ' is a good choice.');
  }
]).triggerAction({ matches: /character/i });


bot.dialog('whoami', (session) => {
  if (!session.userData.character) {
    session.endDialog('You need to create a character first.  Type: character');
  } else {
    let response = 'name: ' + session.userData.character.name + "\n\n"
      + 'race: ' + session.userData.character.race + "\n\n"
      + 'class: ' + session.userData.character.class;
      session.endDialog(response);
  }
}).triggerAction({ matches: /whoami/i });

app.post('/api/messages', connector.listen());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
