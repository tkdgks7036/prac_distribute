const mongoose = require('mongoose');

const commentsSchema = new mongoose.Schema({
    postId: {
        type: String,
        required: true
    },

    userId: {
        type: String,
        required: true
    },

    nickname: {
        type: String,
        required: true
    },

    comment: {
        type: String,
        required: true
    },

    createdAt: {
        type: Date,
        required: true,
        default: Date.now
    },

    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Comment", commentsSchema);