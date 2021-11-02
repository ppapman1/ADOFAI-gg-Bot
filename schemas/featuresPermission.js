const mongoose = require('mongoose');

const { Schema } = mongoose;
const newSchema = new Schema({
    guild: {
        type: String,
        required: true
    },
    command: {
        type: String,
        required: true
    },
    permissions: {
        type: Array,
        required: true,
        default: []
    }
});

module.exports = mongoose.model('FeaturesPermission', newSchema);