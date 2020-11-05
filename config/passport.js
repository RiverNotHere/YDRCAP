/*
 * Copyright (c) 2020. by o0River0o. All rights reserved.
 * Codes here may not be used for any non-commercial or commercial uses without getting approved by the original author.
 * Any use of code from this project should declare the original source it's from
 *
 */

const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const CryptoJS = require('crypto-js');

const User = require('../models/User')

module.exports = (passport) => {
  passport.use(
    new LocalStrategy({ usernameField: 'email' }, (username, password, done) => {
      let epwd = CryptoJS.SHA256(password).toString()
      //Check username
      User.findOne({ email: username, password: epwd }).then(user => {
        console.log(user)
        if (!user) {
          return done(null, false, { message: 'Username or password incorrect' })
          // errors.push({ msg: 'Username or password incorrect' })
          // page.render('login', {
          //   errors,
          //   username: username,
          //   password: password,
          //   layout: 'login'
          // })
        } else {
          return done(null, user);
        }
      })
    })
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
      done(err, user);
    });
  });
}