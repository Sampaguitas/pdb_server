const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Create Schema
const AccessSchema = new Schema({
    isExpediting: {
        type: Boolean,
        default: false
    },
    isInspection: {
        type: Boolean,
        default: false
    },
    isShipping: {
        type: Boolean,
        default: false
    },
    isWarehouse: {
        type: Boolean,
        default: false
    },
    isConfiguration: {
        type: Boolean,
        default: false
    },
    projectId: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'projects'
    },
    userId: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'users'
    }
});

AccessSchema.virtual("project", {
    ref: "projects",
    localField: "projectId",
    foreignField: "_id",
    justOne: true
});

AccessSchema.virtual("user", {
    ref: "users",
    localField: "userId",
    foreignField: "_id",
    justOne: true
});

AccessSchema.set('toJSON', { virtuals: true });

module.exports= Access = mongoose.model('access', AccessSchema);


