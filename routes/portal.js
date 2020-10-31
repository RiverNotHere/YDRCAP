const express = require('express')
const router = express.Router()

const { ensureAuth } = require('../config/auth')

/*
@desc Dashboard
@route GET /a/dashboard
*/
router.get('/dashboard', ensureAuth, (req, res) => {
  res.render('dashboard')
})

module.exports = router