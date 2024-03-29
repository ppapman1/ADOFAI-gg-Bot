const mongoose = require('mongoose');

const { Schema } = mongoose;
const newSchema = new Schema({
    message: {
        type: String,
        required: true,
        unique: true
    },
    question: {
        type: String,
        required: true
    },
    startedBy: {
        type: String,
        required: true
    },
    realtime: {
        type: Boolean,
        required: true
    },
    roles: {
        type: Array,
        required: true,
        default: []
    }
});

module.exports = mongoose.model('Vote', newSchema);