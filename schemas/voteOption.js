const mongoose = require('mongoose');
const uniqueString = require('unique-string');

const { Schema } = mongoose;
const newSchema = new Schema({
    id: {
        type: String,
        required: true,
        unique: true,
        default: uniqueString
    },
    message: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true,
        maxlength: 80
    },
    description: {
        type: String
    },
    users: {
        type: Array,
        required: true,
        default: []
    }
});

module.exports = mongoose.model('VoteOption', newSchema);