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
const VUsers = require('../models/VUsers')
const Config = require('../models/Config')
const Record = require('../models/Record')

const CryptoJS = require('crypto-js')

const { ensureAuth } = require('../config/auth')

const cid = "5f83a19caed5b31337810f36"

// Utils
const { getTotalHours } = require('../utils/userInfo')

/*
@desc View User
@route GET /u/{userid}?type={staff/volunteer}
*/
router.get('/:id', ensureAuth, async(req, res) => {

  if(req.query.type == 'staff') {

    User.findById(req.params.id).lean().then(user => {
      if(user) {
        console.log(user)
        res.render('accdetails', {
          user: user
        })
      } else {
        res.render('errors/404')
      }
    }).catch(err => console.log(err))

  }

  if(req.query.type == 'volunteer') {
    let user = await VUsers.findById(req.params.id).lean()
    let records = await Record.find({ userid: user.userid }).lean()
    console.log(records)

    user.total_hours = await getTotalHours(user.userid)

    if(user) {
      console.log(user)
      res.render('voldetails', {
        user: user,
        records: records
      })
    } else {
      res.render('errors/404')
    }

  }
})


/*
@desc Create Staff Member
@route POST /u/new-user
*/
let accprevilage = {
  "Programmer": "show",
  "Administrator": "show",
  "Coordinator": "hide"
}
router.post('/new-user', ensureAuth, async(req, res) => {
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

/*
@desc Create Volunteer Member
@route POST /u/new-vuser
*/

router.post('/new-vuser', async(req, res) => {
  console.log(req.body)
  //Validation
  let ispwdMatch = checkPassword(req.body.password, req.body.cpassword)
  let isEmailExist = await VUsers.findOne({ email: req.body.email })
  let isUsernameExist = await VUsers.findOne({ username: req.body.username })

  if (!ispwdMatch) {
    req.flash('error_msg', 'Password and Confirm Password should be match!')
    res.redirect('/a/manage-accounts')
  } else if(isEmailExist || isUsernameExist) {
    req.flash('error_msg', 'Email or Username is already been registered, please use another one')
    res.redirect('/a/manage-accounts')
  } else {
    let config = await Config.findById(cid)
    console.log(config)
    let account = {
      userid: "Y-"+config.next_id,
      username: req.body.username,
      email: req.body.email,
      password: CryptoJS.SHA256(req.body.password).toString(), //Password Encryption
      first_name: req.body.first_name,
      middle_name: req.body.middle_name,
      last_name: req.body.last_name,
      birth_year: req.body.birth_year,
      birth_month: req.body.birth_month
    }

    let user = await VUsers.create(account);
    console.log(user)

    if (user) {
      console.log(user)
      await Config.findByIdAndUpdate(cid, { $inc: { next_id: 1 } }) //Increase by 1
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