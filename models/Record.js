const mongoose = require('mongoose')

const RecordSchema = new mongoose.Schema({
    userid: {
        type: String,
        required: true
    },
    first_name: {
        type: String,
        required: true
    },
    last_name: {
        type: String,
        required: true
    },
    coordinator: {
        type: String,
        default: ""
    },
    hours_recorded: {
        type: Number,
        required: true
    },
    additional_hours: {
        type: Number,
        required: true,
        default: function() {
            return this.hours_recorded * 0.5
        }
    },
    status: {
        type: Number,
        default: 0
    },
    start_time: {
        type: String,
        required: true
    },
    end_time: {
        type: String,
        required: true,
        default: this.start_time
    },
    event_type: {
        type: String,
        required: true
    },
    event_desc: {
        type: String
    },

})

module.exports = mongoose.model('Record', RecordSchema, 'records');