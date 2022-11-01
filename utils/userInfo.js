const Records = require('../models/Record')

module.exports = {
  getTotalHours: async(email) => {
    let records = await Records.find({ email: email, status: 1  })
    console.log(records)
    let total_hours = 0
    records.forEach(record => {
      total_hours += record.hours_recorded
    }) 
    return total_hours
  }
}

