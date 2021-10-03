const mongoose = require('mongoose');

const { Schema } = mongoose;
const newSchema = new Schema({
    user: {
        type: String,
        required: true
    },
    channel: {
        type: String,
        required: true
    },
    open: {
        type: Boolean,
        required: true,
        default: true
    }
});

module.exports = mongoose.model('Ticket', newSchema);