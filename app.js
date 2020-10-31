const path = require('path')
require('dotenv').config({ path: './config/config.env' });

const express = require('express')
const app = express()

const exphbs = require('express-handlebars')

//Express Sessions
const flash = require('connect-flash');
const session = require('express-session');
app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true
}))
app.use(flash());

const connectDB = require('./config/db')
connectDB()

const passport = require('passport');

// Passport Config
require('./config/passport')(passport);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

//Global vars
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
})

// Handlebars
app.engine('.hbs', exphbs({
  defaultLayout: 'main',
  extname: '.hbs',
  helpers: {
    formatDate: function (datetime) {
      let format = "MM-DD-YYYY hh:mm A";
      return moment(datetime).format(format);
    },
    switch: function (val) {
      switch (val) {
        case 0:
          return '<font color="red">Unconfirmed</font>';
          break;
        case 1:
          return '<font color="green">Confirmed</font>';
          break;
        default:
          return null;
      }
    },
    sum: function (a, b) {
      return a + b;
    }
  }
}));
app.set('view engine', '.hbs');

app.use(express.static(path.join(__dirname, 'public')));

//DB Models
const User = require('./models/User')

//Body Parser
app.use(express.urlencoded({ extended: false }))
app.use(express.json())

//Routes
app.use('/', require('./routes/user'))
app.use('/a/', require('./routes/portal'))


//Error Handling
// Handle 404
app.use(function (req, res) {
  res.render('./errors/404');
});

// Handle 500
app.use(function (error, req, res, next) {
  res.render('./errors/500')
});

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Site is running on ${PORT}`)
})