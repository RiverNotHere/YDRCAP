/*
 * Copyright (c) 2020. by o0River0o. All rights reserved.
 * Codes here may not be used for any non-commercial or commercial uses without getting approved by the original author.
 * Any use of code from this project should declare the original source it's from
 *
 */

/*=================================
*                                 *
*   Project: YDRCAP(Admin Portal) *
* ------------------------------- *
*    Created at: 2020-10-10       *
*    Last Changed: 2021-02-13     *
*                                 *
==================================*/

/* Modules */
const path = require('path');
require('dotenv').config({ path: './config/config.env' });

const express = require('express');
const app = express();

const exphbs = require('express-handlebars');

//Moment
const moment = require('moment');

//Express Sessions
const flash = require('connect-flash');
const session = require('express-session');
app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true
}))
app.use(flash());

const connectDB = require('./config/db');
connectDB();

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
});

// Utils
const { isSelected, newSelectGroup } = require('./utils/recInfo');

// Models
const Records = require('./models/Record');
const Config = require('./models/Config');

// Handlebars Config
app.engine('.hbs', exphbs({
  defaultLayout: 'main',
  extname: '.hbs',

  // Customized Helpers
  helpers: {
    // Format Date
    formatDate: (datetime, format) => {
      return moment(datetime).format(format);
    },

    // Get Status
    switch: (status) => {
      switch (status) {
        case 0:
          return '<font color="red">Unconfirmed</font>';
        case 1:
          return '<font color="green">Confirmed</font>';
        default:
          return null;
      }
    },

    // Get sum
    sum: (a, b) => {
      return a + b;
    },

    // Calculating the increase/decreases
    getStat: (now, before, period) => {
      let decreaseValue = before - now;
      let perc = (decreaseValue / before) * 100;
      console.log(perc);
      console.log(perc > 0);
      if(period == 'day') {
        period = 'yesterday';
      } else {
        period = "last " + period;
      }
      if (perc > 0) {
        return `<font color="red"><i class="material-icons">arrow_downward</i> ${Math.abs(+parseFloat(perc.toFixed(2)))}% since ${period}</font>`;
      }else {
        return `<font color="green"><i class="material-icons">arrow_upward</i> ${Math.abs(+parseFloat(perc.toFixed(2)))}% since ${period}</font>`;
      }
    },

    // Determine showing or not
    // ${status}: 0 || 1 (unapproved/approved)
    isshow: (status) => {
      if (status == 0) {
        return '';
      } else {
        return 'hide';
      }
    },

    // Get Age Group
    // Rule from PVSA
    getAgeGroup: (year, month) => {
      let dob = new Date(year, month);
      let diff_ms = Date.now() - dob.getTime();
      let age_dt = new Date(diff_ms);
      let age = Math.abs(age_dt.getUTCFullYear() - 1970);

      switch (true) {
        case (age >= 5 && age <= 10):
          return "Kids";
        case (age >= 11 && age <= 15):
          return "Teens";
        case (age >= 16 && age <= 25):
          return "Young Adults";
        case (age >= 26):
          return "Adults";
        default:
          return "Invalid Age";
      }
    },
  }
}));
app.set('view engine', '.hbs');

app.use(express.static(path.join(__dirname, 'public')));

//DB Models
const User = require('./models/User');

//Body Parser
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

//Routes
app.use('/', require('./routes/user'));
app.use('/a/', require('./routes/portal'));
app.use('/u/', require('./routes/account'));

//Error Handling
// Handle 404
app.use(function (req, res) {
  res.render('./errors/404');
});

// Handle 500
app.use(function (error, req, res, next) {
  res.render('./errors/500');
});

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Site is running on ${PORT}`);
})