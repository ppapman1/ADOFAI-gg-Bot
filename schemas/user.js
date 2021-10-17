const mongoose = require('mongoose');

const { Schema } = mongoose;
const newSchema = new Schema({
    id: {
        type: String,
        required: true,
        unique: true
    },
    lang: {
        type: String,
        required: true,
        default: 'en'
    },
    unmuteAt: {
        type: Number
    },
    unbanAt: {
        type: Number
    }
});

module.exports = mongoose.model('User', newSchema);