/*
 * Copyright (c) 2020. by o0River0o. All rights reserved.
 * Codes here may not be used for any non-commercial or commercial uses without getting approved by the original author.
 * Any use of code from this project should declare the original source it's from
 *
 */

/* Modules */
const express = require('express')
const router = express.Router()

const User = require('../models/User')
const Config = require('../models/Config')

const CryptoJS = require('crypto-js')

const { ensureAuth } = require('../config/auth')

const cid = "5f83a19caed5b31337810f36"

/*
@desc View User
@route /u/{userid}
*/
router.get('/:id', ensureAuth, (req, res) => {
  User.findById(req.params.id).lean().then(user => {
    console.log(user)
    res.render('accdetails', {
      user: user
    })
  }).catch(err => console.log(err))
})

/*
@desc Create User
@route POST /u/new
*/
let accprevilage = {
  "Programmer": "show",
  "Administrator": "show",
  "Coordinator": "hide"
}
router.post('/new', ensureAuth, async(req, res) => {
  console.log(req.body)

  //Validation
  let ispwdMatch = checkPassword(req.body.password, req.body.cpassword)
  let isEmailExist = await User.findOne({ email: req.body.email })

  if (!ispwdMatch) {
    req.flash('error_msg', 'Password and Confirm Password should be match!')
    res.redirect('/a/manage-accounts')
  } else if(isEmailExist) {
    req.flash('error_msg', 'Email is already been registered, please use another one')
    res.redirect('/a/manage-accounts')
  } else {
    let config = await Config.findById(cid)
    console.log(config)
    let account = {
      userid: "A-"+config.next_ida,
      role: req.body.role,
      email: req.body.email,
      password: CryptoJS.SHA256(req.body.password).toString(), //Password Encryption
      first_name: req.body.first_name,
      middle_name: req.body.middle_name,
      last_name: req.body.last_name,
      account_page: accprevilage[req.body.role],
    }
    console.log(account)

    let user = await User.create(account);
    if (user) {
      console.log(user)
      await Config.findByIdAndUpdate(cid, { $inc: { next_ida: 1 } }) //Increase by 1
      req.flash('success_msg', 'Account successfully created')
      res.redirect('/a/manage-accounts')
    }
  }
})

// Functions
function checkPassword(pwd, cpwd) {
  if (pwd === cpwd) {
    return true
  } else {
    return false
  }
}

module.exports = router