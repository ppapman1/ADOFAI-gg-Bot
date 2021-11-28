const mongoose = require('mongoose');

const { Schema } = mongoose;
const newSchema = new Schema({
    hash: {
        type: String,
        required: true
    },
    id: {
        type: Number,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    evidences: {
        type: Array,
        required: true
    },
    links: {
        type: Array,
        required: true
    },
    status: {
        type: Number,
        required: true
    },
    ko_desc: {
        type: String
    },
    en_desc: {
        type: String
    }
});

module.exports = mongoose.model('ADOFAIArtist', newSchema);