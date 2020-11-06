/*
 * Copyright (c) 2020. by o0River0o. All rights reserved.
 * Codes here may not be used for any non-commercial or commercial uses without getting approved by the original author.
 * Any use of code from this project should declare the original source it's from
 *
 */

/* Modules */
const express = require('express')
const router = express.Router()
const passport = require('passport')

const CryptoJS = require('crypto-js')

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