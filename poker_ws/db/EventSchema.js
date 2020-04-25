const mongoose = require('mongoose'); 

const schema  = mongoose.Schema({
    room: String,
    user_name: String,
    action: String, // Vote, TransferRoom, NewTurn, EndTurn, NewVote
    action_param: String,
    created_at: Date
});

module.exports = mongoose.model('event', schema);