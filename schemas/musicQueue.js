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
    guild: {
        type: String,
        required: true
    },
    url: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    createdUser: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('MusicQueue', newSchema);