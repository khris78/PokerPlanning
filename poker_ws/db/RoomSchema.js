const mongoose = require('mongoose'); 

const schema  = mongoose.Schema({
    room_name: String,
    room_owner: String, 
    room_password: String,
    card_set: String,
    is_active: Boolean,
});

module.exports = mongoose.model('room', schema, 'room');