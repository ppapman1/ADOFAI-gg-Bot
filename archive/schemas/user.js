const mongoose = require('mongoose');

const { Schema } = mongoose;
const newSchema = new Schema({
    id: {
        type: String,
        required: true
    },
    lang: {
        type: String,
        required: true,
        default: 'en'
    }
});

module.exports = mongoose.model('User', newSchema);