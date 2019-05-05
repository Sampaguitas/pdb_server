const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Create Schema
const ProjectSchema = new Schema({
    number: {
        type: Number,
    },
    name: {
        type: String,
        required: true
    },
    erpId: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'erps',
        required: true
    },
    localeId: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'locales',
        required: true
    },
    opcoId: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'opcos',
        required: true
    },
    daveId: {
        type: Number,
    },
    users: [{
        user: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: 'users'
        },
        roles: {
            expediting: {
                type: Boolean,
                default: false
            },
            inspection: {
                type: Boolean,
                default: false
            },
            shipping: {
                type: Boolean,
                default: false
            },
            warehouse: {
                type: Boolean,
                default: false
            },
            configuration: {
                type: Boolean,
                default: false
            }
        }
    }]
});

ProjectSchema.virtual("pos", {
    ref: "pos",
    localField: "_id",
    foreignField: "projectId",
    justOne: false
});

ProjectSchema.virtual("collitypes", {
    ref: "collitypes",
    localField: "_id",
    foreignField: "projectId",
    justOne: false
});

ProjectSchema.set('toJSON', { virtuals: true });


//module.exports = mongoose.model('Projects', ProjectSchema);
module.exports = Project = mongoose.model('projects', ProjectSchema);