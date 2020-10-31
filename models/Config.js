const mongoose = require('mongoose')

const ConfigSchema = new mongoose.Schema({
    next_id: {
        type: Number,
        required: true
    },
    next_ida: {
        type: Number,
        required: true
    },
    new_users_added: {
        type: Number,
        required: true
    },
    new_records_added: {
        type: Number,
        required: true
    },
    total_online: {
        type: Number,
        required: true
    }
})

module.exports = mongoose.model('Config', ConfigSchema, 'configs');