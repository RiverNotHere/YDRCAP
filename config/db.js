/*
 * Copyright (c) 2020. by o0River0o. All rights reserved.
 * Codes here may not be used for any non-commercial or commercial uses without getting approved by the original author.
 * Any use of code from this project should declare the original source it's from
 *
 */

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = mongoose.connect(process.env.DBPATH, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false
    })

    console.log(`MongoDB Connected ${(await conn).connection.host}`)
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}

module.exports = connectDB