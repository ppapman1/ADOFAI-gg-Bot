const mongoose = require('mongoose');

const { Schema } = mongoose;
const newSchema = new Schema({
    id: {
        type: String,
        required: true,
        unique: true
    },
    user: {
        type: String,
        required: true
    },
    createdAt: {
        type: Number,
        required: true
    },
    reason: {
        type: String,
        required: true
    },
    moderator: {
        type: String,
        required: true
    },
    group: {
        type: Array,
        required: true,
        default: []
    }
});

module.exports = mongoose.model('Warn', newSchema);