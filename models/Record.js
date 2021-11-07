/*
 * Copyright (c) 2020. by o0River0o. All rights reserved.
 * Codes here may not be used for any non-commercial or commercial uses without getting approved by the original author.
 * Any use of code from this project should declare the original source it's from
 *
 */

const mongoose = require('mongoose')

const RecordSchema = new mongoose.Schema({
    email: {
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

}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })

module.exports = mongoose.model('Record', RecordSchema, 'records');