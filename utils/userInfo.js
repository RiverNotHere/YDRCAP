const Records = require('../models/Record')

module.exports = {
  getTotalHours: async(userid) => {
    let records = await Records.find({ userid: userid  })
    let total_hours = 0
    records.forEach(record => {
      total_hours += (record.hours_recorded + record.additional_hours)
    }) 
    return total_hours
  }
}