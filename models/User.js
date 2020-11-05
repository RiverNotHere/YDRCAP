/*
 * Copyright (c) 2020. by o0River0o. All rights reserved.
 * Codes here may not be used for any non-commercial or commercial uses without getting approved by the original author.
 * Any use of code from this project should declare the original source it's from
 *
 */

const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
  role: {
    type: String,
    required: true,
    default: 'coordinator'
  },
  avatar_url: {
    type: String,
    required: true,
    default: 'https://i.ibb.co/yPHtn7P/default-avatar.png'
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  first_name: {
    type: String,
    required: true
  },
  middle_name: {
    type: String,
  },
  last_name: {
    type: String,
    required: true
  },
})

module.exports = mongoose.model('User', UserSchema,  'ap-users')