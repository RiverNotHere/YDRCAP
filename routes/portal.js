const express = require('express')
const router = express.Router()

const { ensureAuth } = require('../config/auth')

const Records = require('../models/Record')
const Config = require('../models/Config')

const cid = "5f83a19caed5b31337810f36"

/*
@desc Dashboard
@route GET /a/dashboard
*/
router.get('/dashboard', ensureAuth, (req, res) => {
  Records.findOne({ userid: 'Y-10010' }).then(records => {
    Config.findById(cid).then(configs => {
      res.render('dashboard', {
        records: records,
        total_online: configs.total_online,
        new_records_added: configs.new_records_added,
        new_users_added: configs.new_users_added
      })
    }).catch(err => console.log(err))
  }).catch(err => console.log(err))
})

module.exports = router