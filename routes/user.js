const express = require('express')
const router = express.Router()
const passport = require('passport');

const CryptoJS = require('crypto-js');

const { ensureGuest } = require('../config/auth')

/*
@desc Login Page
@route GET /
*/
router.get('/', ensureGuest, (req, res) => {
  res.render('login', { layout: 'user' })
})

/*
@desc Logout Handle
@route GET /logout
*/
router.get('/logout', (req, res) => {
  req.logOut();
  req.flash('success_msg', 'You are Logged Out');
  res.redirect('/');
})

/*
@desc Login Handle
@route POST /
*/
router.post('/', ensureGuest, (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/a/dashboard',
    failureRedirect: '/',
    failureFlash: true
  })(req, res, next);
})

module.exports = router