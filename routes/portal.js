/*
 * Copyright (c) 2020. by o0River0o. All rights reserved.
 * Codes here may not be used for any non-commercial or commercial uses without getting approved by the original author.
 * Any use of code from this project should declare the original source it's from
 *
 */

const express = require('express')
const router = express.Router()
const fs = require('fs')

const { ensureAuth } = require('../config/auth')

const Records = require('../models/Record')
const User = require('../models/User')
const Config = require('../models/Config')
const VUsers = require('../models/VUsers')

const moment = require('moment')
const CryptoJS = require('crypto-js')

const cid = "5f83a19caed5b31337810f36"

/*
@desc Dashboard
@route GET /a/dashboard
*/
router.get('/dashboard', ensureAuth, async(req, res) => {
  let configs = await Config.findById(cid)
  let records = await Records.find({ status: 0 }).sort({ created_at: 1 }).limit(10).lean()
  let cname = req.user.first_name + " " + req.user.last_name
  console.log(cname)
  console.log(records)
  console.log(configs)
  res.render('dashboard', {
    account_page: req.user.account_page,
    dashboard: 'active',
    records: records,
    coordinator_name: cname,
    total_online: configs.total_online,
    total_online_prev_period: configs.total_online_prev_period,
    new_records_added: configs.new_records_added,
    new_records_added_prev_period: configs.new_records_added_prev_period,
    new_users_added: configs.new_users_added,
    new_users_added_prev_period: configs.new_users_added_prev_period,
    traffic: configs.traffic,
    traffic_prev_period: configs.traffic_prev_period,
  })
})

/*
@desc Manage Account
@route GET /a/manage-accounts
*/
router.get('/manage-accounts', ensureAuth, async(req, res) => {
  let users = await User.find({}).lean()
  let vusers = await VUsers.find({}).lean()

  res.render('manage-accounts', {
    maccounts: 'active',
    users: users,
    vusers: vusers
  })
})

/*
@desc Records
@route GET /a/records
*/
router.get('/records', ensureAuth,(req, res) => {
  let cname = req.user.first_name + " " + req.user.last_name
  Records.find({}).lean().then(records => {
    console.log(records)
    console.log(cname)
    res.render('records', {
      account_page: req.user.account_page,
      srecords: 'active',
      records: records,
      coordinator_name: cname,
    })
  }).catch(err => console.log(err))
})

/*
@desc Profile Settings
@route GET /a/profile
*/
router.get('/profile', ensureAuth, async(req, res) => {
  let profile = await User.findOne({ userid: req.user.userid }).lean()
  console.log(profile)
  res.render('profile', {
    account_page: req.user.account_page,
    profile: 'active',
    user: profile
  })
})

/*--------------- DATABASE ACTIONS ---------------*/

/*
@desc Export Volunteer Data
@route GET /a/export-volunteer
*/
const { exportVolSummaryCSV } = require('../utils/exportData')
const { writeFile } = require('../utils/fileIO')

router.get('/export-volunteer', async (req, res) => {
  let fileName = "VolunteerData"

  let voldat = await VUsers.find()
  let data = []
  let current_year = new Date().getFullYear()
  voldat.forEach(user => {
    let sum = {
      "Name": user.first_name + " " + user.last_name,
      "Email": user.email,
      "Award Year": current_year,
      "Age Group": getAgeGroup(user.birth_year, user.birth_month),
      "Total Hours": user.total_hours
    }
    data.push(sum)
  })

  // Write and download the file
  let filedata = exportVolSummaryCSV(data)
  console.log(filedata)
  writeFile(fileName, filedata)
  let filepath = "files/VolunteerData.csv"
  res.download(filepath)

})

/*
@desc Change Password
@route POST /a/change-password?id={userid}
*/
router.post('/change-password', ensureAuth, async(req, res) => {
  console.log(req.body)
  // Validate
  let ori_profile = await User.findById(req.query.id)
  if(CryptoJS.SHA256(req.body.opassword).toString() !== ori_profile.password) {

    req.flash('error_msg', 'Original password incorrect')
    res.redirect('/a/profile')

  } else if(req.body.npassword !== req.body.cnpassword) {

    req.flash('error_msg', 'New password and Confirm New Password should be match')
    res.redirect('/a/profile')

  } else {

    let new_profile = await
        User.findByIdAndUpdate(req.query.id, {
          $set: {
            password: CryptoJS.SHA256(req.body.npassword).toString()
          }
        })

    if(new_profile) {
      req.flash('success_msg', 'Password successfully changed')
      res.redirect('/a/profile')
    }
  }
})

/*
@desc Delete User
@route GET /a/deluser?id={userid}&type={staff/volunteer}
*/
router.get('/deluser', ensureAuth, (req, res) => {

  if (req.query.type == 'staff') {
    console.log(req.query.id);
    User.findByIdAndDelete(req.query.id).then(user => {
      req.flash('success_msg', 'Account successfully deleted')
      res.redirect('/a/manage-accounts')
    }).catch(err => console.log(err))
  }

  if(req.query.type == 'volunteer') {
    console.log(req.query.id);
    VUsers.findByIdAndDelete(req.query.id).then(user => {
      req.flash('success_msg', 'Account successfully deleted')
      res.redirect('/a/manage-accounts')
    }).catch(err => console.log(err))
  }
})

/*
@desc Edit User
@route GET/POST /a/edit-account?id={userid}&type={staff/volunteer}
*/
router.get('/edit-account', ensureAuth, (req, res) => {
  if(req.query.type == 'staff') {
    User.findById(req.query.id).lean().then(user => {
      console.log(user)
      if(user) {
        res.render('edit-staff', {
          user: user,
          // coordinator_name: cname,
        })
      }else {
        res.redirect('/a/dashboard');
      }
    })
  }

  if(req.query.type == 'volunteer') {
    VUsers.findById(req.query.id).lean().then(user => {
      console.log(user)
      if(user) {
        res.render('edit-volunteer', {
          user: user,
          // coordinator_name: cname,
        })
      }else {
        res.redirect('/a/dashboard');
      }
    })
  }
})

router.post('/edit-account', ensureAuth, async(req, res) => {
  let backURL = req.header('Referer') || '/';

  console.log(req.query)

  if(req.query.type == 'staff') {

    // Validate
    let isEmailExist = await User.findOne({ email: req.body.email })

    if (isEmailExist && isEmailExist._id != req.query.id) {
      req.flash('error_msg', 'Email already registered, please use another one')
      res.redirect(backURL)
    }else {
      User.findByIdAndUpdate(req.query.id, req.body).then(user => {
        console.log(user)
        if(user) {
          req.flash('success_msg', 'Changes successfully saved')
          res.redirect(backURL)
        }
      }).catch(err => console.log(err))
    }

  }

  if(req.query.type == 'volunteer') {

    // Validate
    let isEmailExist = await VUsers.findOne({ email: req.body.email })

    if (isEmailExist && isEmailExist._id != req.query.id) {
      req.flash('error_msg', 'Email already registered, please use another one')
      res.redirect(backURL)
    }else {
      VUsers.findByIdAndUpdate(req.query.id, req.body).then(user => {
        console.log(user)
        if(user) {
          req.flash('success_msg', 'Changes successfully saved')
          res.redirect(backURL)
        }
      }).catch(err => console.log(err))
    }

  }
})

// const evttypes = {
//   0: "Other",
//   1: "Normal Zoom Class Teaching",
//   2: "Chinese Daka Teaching",
//   4: "Chinese Daka Training",
//   5: "Math Mammoth Study Group Teaching",
//   6: "Math Mammoth Study Group Teacher Meeting",
//   7: "English Study Group Teaching",
//   8: "Normal Zoom Class Co-Hosting",
// }

/*
@desc Add Record
@route POST /a/newrec
*/
router.post('/newrec', ensureAuth, async(req, res) => {
  console.log(req.body);
  let isahrs, stime, etime;
  console.log(req.body.evt_type)
  switch (parseInt(req.body.evt_type)) {
    case 0:
    case 3:
    case 4:
    case 8:
      isahrs = false;
      break;
    default:
      isahrs = true;
      break;
  }
  if(!req.body.evt_edate) {
    req.body.evt_edate = req.body.evt_sdate
  }

  stime = req.body.start_time;
  etime = req.body.end_time;

  console.log(stime);
  console.log(etime);

  let target_user = await VUsers.findOne({ userid: req.body.userid })

  let newRec = {
    userid: req.body.userid,
    first_name: target_user.first_name,
    last_name: target_user.last_name,
    hours_recorded: req.body.duration,
    additional_hours: req.body.additional_hours,
    start_time: stime,
    end_time: etime,
    event_type: evttypes[req.body.evt_type],
    event_desc: req.body.evt_desc ? req.body.evt_desc : ""
  }
  console.log(isahrs)
  if (isahrs) {
    delete newRec.additional_hours
  }
  console.log(newRec);

  let record = Records.create(newRec);
  if (record) {
    Config.findByIdAndUpdate(cid, { $inc: { new_records_added: 1 } })
        .then(rec => console.log(rec))
        .catch(err => console.log(err))
    req.flash('success_msg', 'Record Successfully Added')
    res.redirect('/a/records');
  }
})

/*
@desc  View Record
@route GET /a/edetails?id={any}
*/
router.get('/edetails', ensureAuth, (req, res) => {
  let cname = req.user.first_name + " " + req.user.last_name
  Records.findById(req.query.id).lean().then(record => {
    console.log(record)
    if(record) {
      res.render('edetails', {
        record: record,
        coordinator_name: cname,
      })
    }else {
      res.redirect('/a/dashboard');
    }
  })
})

/*
@desc  Edit Record
@route GET || POST /a/edit-record?id={any}
*/
router.get('/edit-record', ensureAuth, (req, res) => {
  // let cname = req.user.first_name + " " + req.user.last_name
  Records.findById(req.query.id).lean().then(record => {
    console.log(record)
    if(record) {
      res.render('edit-record', {
        record: record,
        // coordinator_name: cname,
      })
    }else {
      res.redirect('/a/dashboard');
    }
  })
})

router.post('/edit-record', ensureAuth, async (req, res) => {
  function sum(a, b) {
    return a + b
  }

  let prev = await Records.findById(req.query.id)
  let hoursUpdated = sum(parseFloat(req.body.hours_recorded), parseFloat(req.body.additional_hours)) - sum(parseFloat(prev.hours_recorded), parseFloat(prev.additional_hours))
  // console.log(req.body.hours_recorded + " " + req.body.additional_hours + ":" + prev.hours_recorded + " " + prev.additional_hours)
  // console.log(hoursUpdated)
  Records.findByIdAndUpdate(req.query.id, req.body).then(async record => {
    console.log(record);
    if(record) {
      await VUsers.findOneAndUpdate({ userid: record.userid }, { $inc: { total_hours: hoursUpdated } })
      req.flash('success_msg', 'Changes successfully saved');
      res.redirect( `/a/edetails?id=${req.query.id}`)
    }
  }).catch(err => console.log(err))
})

/*
@desc  Delete Record
@route GET /a/delrec?id={any}
*/
router.get('/delrec',  ensureAuth, async(req, res) => {
  let record = await Records.findById(req.query.id)
  console.log(record)
  if (record.status == 1) {
    await Records.findByIdAndDelete(record._id)
    await VUsers.findOneAndUpdate({ userid: record.userid }, { $inc: { total_hours: -(record.hours_recorded + record.additional_hours) } })
    req.flash('success_msg', 'Record successfully deleted!')
    res.redirect('/a/records')
  }

  if (record.status == 0) {
    await Records.findByIdAndDelete(record._id)
    req.flash('success_msg', 'Record successfully deleted!')
    res.redirect('/a/records')
  }
})


/*
@desc Confirm Record
@route POST /a/confirm-rec?id={recid}&coordinator={coordinator}
*/
router.post('/confirm-rec', ensureAuth, async (req, res) => {
  console.log('id: '+req.query.id+'|coordinator: '+req.query.coordinator)
  let backURL = req.header('Referer') || '/';
  console.log(req.body)
  let ahrs = 0;
  if (req.body.ahrs) ahrs = req.body.ahrs;
  await Records.findByIdAndUpdate(req.query.id, { $inc: { additional_hours: ahrs } })
  Records.findByIdAndUpdate(req.query.id, { $set: { status: 1, coordinator: req.query.coordinator } })
      .then(record => {
        console.log("userid: "+record.userid)
        VUsers.findOneAndUpdate({ userid: record.userid }, { $inc: { total_hours: record.additional_hours + record.hours_recorded } })
            .then(user => {
              console.log(user);
              req.flash('success_msg', 'Record confirmed');
              res.redirect(backURL);
            })
            .catch(err => console.log(err))
      })
      .catch(err => console.log(err))
})

//functions
function getAgeGroup(year, month) {
  let birth = new Date(year, month);
  let diff_ms = Date.now() - birth.getTime();
  let age_dt = new Date(diff_ms);
  let age = Math.abs(age_dt.getUTCFullYear() - 1970);

  switch (true) {
    case (age >= 5 && age <= 10):
      return "Kids"
    case (age >= 11 && age <= 15):
      return "Teens"
    case (age >= 16 && age <= 25):
      return "Young Adults"
    case (age >= 26):
      return "Adults"
    default:
      return "Invalid Age"
  }
}

async function updateNewUsers() {
  let doc = await Config.findById(cid).exec()
  await Config.findByIdAndUpdate(cid, { $set:{ new_users_added_prev_period: doc.new_users_added, new_users_added: 0} })
      .then(res => console.log(res))
      .catch(err => console.log(err))
}

async function updateNewRecords() {
  let doc = await Config.findById(cid).exec()
  await Config.findByIdAndUpdate(cid, { $set:{ new_records_added_prev_period: doc.new_records_added, new_records_added: 0} })
      .then(res => console.log(res))
      .catch(err => console.log(err))
}

async function updateOnlines() {
  let doc = await Config.findById(cid).exec()
  await Config.findByIdAndUpdate(cid, { $set:{ total_online_prev_period: doc.total_online} })
      .then(res => console.log(res))
      .catch(err => console.log(err))
}

async function updateTraffic() {
  let doc = await Config.findById(cid).exec()
  await Config.findByIdAndUpdate(cid, { $set:{ traffic_prev_period: doc.traffic, traffic: 0} })
      .then(res => console.log(res))
      .catch(err => console.log(err))
}

// Timers
setInterval(updateNewUsers, moment.duration(24, 'days'))
setInterval(updateNewRecords, moment.duration(1, 'weeks'))
setInterval(updateTraffic, moment.duration(1, 'days'))
setInterval(updateOnlines, moment.duration(1, 'hours'))

module.exports = router