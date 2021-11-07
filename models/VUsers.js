/*
 * Copyright (c) 2020. by o0River0o. All rights reserved.
 * Codes here may not be used for any non-commercial or commercial uses without getting approved by the original author.
 * Any use of code from this project should declare the original source it's from
 *
 */

const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
  userid: {
    type: String,
    required: true,
  },
  total_hours: {
    type: Number,
    default: 0,
  },
  email: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  first_name: {
    type: String,
    required: true,
  },
  middle_name: {
    type: String,
    required: false,
  },
  last_name: {
    type: String,
    required: true,
  },
  birth_year: {
    type: Number,
    required: true,
  },
  birth_month: {
    type: Number,
    required: true,
  },
  school_name: {
    type: String,
    required: true,
  },
  grade: {
    type: String,
    required: true,
  },
  is_citizen_or_greencard: {
    type: Boolean,
    required: true,
  },
});

module.exports = mongoose.model('VUser', UserSchema, 'users');