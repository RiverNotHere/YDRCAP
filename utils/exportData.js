/*
 * Copyright (c) 2020. by o0River0o. All rights reserved.
 * Codes here may not be used for any non-commercial or commercial uses without getting approved by the original author.
 * Any use of code from this project should declare the original source it's from
 *
 */
const { Parser } = require('json2csv');

module.exports = {
  exportVolSummaryCSV: (data) => {
    // const fields = ['Name', 'Email', 'Award Year', 'Age Group', 'Total Hours']
    // const opts = { fields }

    if (data) {
      try {
        const parser = new Parser()
        const csv = parser.parse(data)
        return csv
      } catch (err) {
        console.error(err)
        return -1
      }
    }

    return -1

  }
}