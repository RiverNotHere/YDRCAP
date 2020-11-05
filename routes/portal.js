/*
 * Copyright (c) 2020. by o0River0o. All rights reserved.
 * Codes here may not be used for any non-commercial or commercial uses without getting approved by the original author.
 * Any use of code from this project should declare the original source it's from
 *
 */

const express = require('express')
const router = express.Router()

const { ensureAuth } = require('../config/auth')

const Records = require('../models/Record')
const User = require('../models/User')
const Config = require('../models/Config')
const VUsers = require('../models/VUsers')

const moment = require('moment')
const cid = "5f83a19caed5b31337810f36"

/*
@desc Dashboard
@route GET /a/dashboard
*/
router.get('/dashboard', ensureAuth, (req, res) => {
  let recs = []
  Config.findById(cid).then(configs => {
    Records.find({ status: 0 }).limit(8).sort({ start_time: 1 }).lean().then(records => {
      console.log(configs + "\n" + records)
      let cname = req.user.first_name + " " + req.user.last_name
      console.log(cname)
      res.render('dashboard', {
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
    }).catch(err => console.log(err))
  }).catch(err => console.log(err))
})

/*
@desc Manage Account
@route GET /a/manage-accounts
*/
router.get('/manage-accounts', ensureAuth, (req, res) => {
  res.render('manage-accounts', {
    maccounts: 'active',
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
router.get('/profile', ensureAuth, (req, res) => {
  res.render('profile', {
    profile: 'active',
  })
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

router.post('/edit-record', ensureAuth, (req, res) => {
  Records.findByIdAndUpdate(req.query.id, req.body).then(record => {
    console.log(record);
    if(record) {
      req.flash('success_msg', 'Changes successfully saved');
      res.redirect( `/a/edetails?id=${req.query.id}`)
    }
  }).catch(err => console.log(err))
})

/*
@desc  Delete Record
@route GET /a/delrec?id={any}
*/
router.get('/delrec',  ensureAuth, (req, res) => {
  Records.findByIdAndDelete(req.query.id).then(result => {
    req.flash('success_msg', 'Record successfully deleted')
    res.redirect('/a/records')
  }).catch(err => console.log(err))
})


/*
@desc Confirm Record
@route POST /a/confirm-rec?id={recid}&coordinator={coordinator}
*/
router.post('/confirm-rec', ensureAuth, (req, res) => {
  console.log('id: '+req.query.id+'|coordinator: '+req.query.coordinator)
  let backURL = req.header('Referer') || '/';
  console.log(req.body)
  if(req.body.ahrs) {
    Records.findByIdAndUpdate(req.query.id, { $set: { status: 1, coordinator: req.query.coordinator }, $inc: { additional_hours: parseFloat(req.body.ahrs) } })
        .then(record => {
          console.log("userid: "+record.userid)
          VUsers.findOneAndUpdate({ userid: record.userid }, { $inc: { total_hours: record.additional_hours + record.hours_recorded } })
              .then(user => { console.log(user); req.flash('success_msg', 'Record confirmed'); res.redirect(backURL) })
              .catch(err => console.log(err))
        })
        .catch(err => console.log(err))
  }else {
    Records.findByIdAndUpdate(req.query.id, { $set: { status: 1, coordinator: req.query.coordinator } })
        .then(record => {
          console.log("userid: "+record.userid)
          VUsers.findOneAndUpdate({ userid: record.userid }, { $inc: { total_hours: record.additional_hours + record.hours_recorded } })
              .then(user => { console.log(user); req.flash('success_msg', 'Record confirmed'); res.redirect(backURL) })
              .catch(err => console.log(err))
        })
        .catch(err => console.log(err))
  }
})

//functions
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