const mongoose = require('mongoose');

const { Schema } = mongoose;
const newSchema = new Schema({
    type: {
        type: String,
        required: true
    },
    reason: {
        type: String,
        required: true,
        unique: true
    }
});

module.exports = mongoose.model('ReasonTemplate', newSchema);