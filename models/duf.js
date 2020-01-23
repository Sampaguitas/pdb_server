const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Create Schema
const DufSchema = new Schema({
    status: {
        type: String,
        required: true,
    },
    nProcessed: {
        type: Number,
        required: true
    },
    nRejected: {
        type: Number,
        required: true
    },
    nAdded: {
        type: Number,
        required: true
    },
    nEdited: {
        type: Number,
        required: true
    },
    rejections: [{
        row: {
            type: Number,
            required: true
        },
        reason: {
            type: String,
            required: true
        }
    }],
    userId: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'users' 
    },
    projectId: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'projects' 
    }

}, { timestamps: true});

module.exports = Duf = mongoose.model('dufs', DufSchema);