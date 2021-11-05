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
    name: {
        type: String,
        required: true,
        unique: true
    },
    code: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Eval', newSchema);