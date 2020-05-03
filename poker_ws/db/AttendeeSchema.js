const mongoose = require('mongoose'); 

const schema  = mongoose.Schema({
    user_name: String,
    room: String,
    last_contact: Date,
});

module.exports = mongoose.model('attendee', schema, 'attendee');