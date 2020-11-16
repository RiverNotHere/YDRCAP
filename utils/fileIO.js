/*
 * Copyright (c) 2020. by o0River0o. All rights reserved.
 * Codes here may not be used for any non-commercial or commercial uses without getting approved by the original author.
 * Any use of code from this project should declare the original source it's from
 *
 */

const fs = require('fs')

module.exports = {
  writeFile: async (filename, data) => {
    let filepath = `${filename}.csv`
    // await fs.unlink(filepath, (err) => {if(err) throw err})
    console.log(data)
    await fs.appendFile(filepath, data, (err) => {
      if (err) throw err;
      console.log('Saved!');
    })
  }
}