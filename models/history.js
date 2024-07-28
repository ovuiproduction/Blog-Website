const mongoose = require('mongoose');

const actionSchema = new mongoose.Schema({
    actionType: {
        type: String,
        required: true
    },
    dateOfAction: {
        type: Date,
        required: true
    },
    actionDescription: {
        type: String,
        required: true
    }
});


const articleHistorySchema = new mongoose.Schema({
    blogId: {
        type: String,
        required: true
    },
    actions: [actionSchema]
});

const historySchema = new mongoose.Schema({
    authorId: {
        type: String,
        unique: true,
        required: true
    },
    historyData: [articleHistorySchema]
}, {
    timestamps: true
});

module.exports = mongoose.model('HistoryColl', historySchema);
