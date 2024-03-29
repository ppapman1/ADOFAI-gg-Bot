const mongoose = require('mongoose');

const { Schema } = mongoose;
const newSchema = new Schema({
    guild: {
        type: String
    },
    channel: {
        type: String,
        required: true
    },
    user: {
        type: String,
        required: true
    },
    command: {
        type: String,
        required: true
    },
    subCommandGroup: {
        type: String
    },
    subCommand: {
        type: String
    },
    commandName: {
        type: String,
        required: true
    },
    options: {
        type: JSON,
        required: true
    },
    createdAt: {
        type: Number,
        required: true,
        default: Date.now
    }
});

module.exports = mongoose.model('CommandHistory', newSchema);