const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Create Schema
const ProjectSchema = new Schema({
    number: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    erpId: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'erps'
    },
    localeId: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'locales'
    },
    opcoId: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'opcos'
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



//module.exports = mongoose.model('Projects', ProjectSchema);
module.exports = Project = mongoose.model('projects', ProjectSchema);