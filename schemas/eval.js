const mongoose = require('mongoose');

const { Schema } = mongoose;
const newSchema = new Schema({
    id: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    code: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Eval', newSchema);