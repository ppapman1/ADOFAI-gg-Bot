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
    event: {
        type: String,
        required: true
    },
    todo: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Todo', newSchema);